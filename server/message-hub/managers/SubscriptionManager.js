'use strict';

var logging = require('../utilities/Logging');
var appUtil = require('../../libs/AppUtil');
var pubSub = require('../../libs/PubSub/PubSubAdapter');
var messageHubChannels = require('../../PubSubChannels').MessageHub;
var constants = require('../../Constants');
var process = require('process');
var internalEventEmitter = require('../../libs/InternalEventEmitter');
var Message = require('../../libs/PubSub/Message');

module.exports = {
  initialize: async function () {

    if (appUtil.isNullOrUndefined(messageHubChannels)) {
      throw new Error('[channel] is not set');
    }

    var handleMessage = async function handleMessage(err, message) {

      if (err) {
        return;
      }

      if (!message.tryValidate()) {
        return;
      }

      logging.logAction(
        logging.logLevels.INFO,
        `Message [${JSON.stringify(message)}] was received on channel [${messageHubChannels.External.Event}] 
              for recipient [${message.recipient}]`
      );

      switch (message.type) {
        case constants.pubSub.messageType.custom:
          _emitInternalEvents(message, messageHubChannels);
          break;
        default:
          logging.logAction(logging.logLevels.ERROR, `Type [${message.type}] is not supported`)
      }
    };

    try {
      await pubSub.subscribe(
        messageHubChannels.External.Event,
        {
          subscriberType: constants.pubSub.recipients.messageHub
        },
        handleMessage
      );
    } catch (e) {
      logging.logAction(
        logging.logLevels.ERROR, `Failed to subscribe to channel [${messageHubChannels.External.Event}]`,
        e
      );
      throw e;
    }
  }
};

/**
 * Emits the passed message as an internal Registration events
 *
 * @param {object} message - The message that will be emitted
 * @param {array} channelDetails - Contains the external channelDetails details
 */
function _emitInternalEvents(message, channelDetails) {

  internalEventEmitter.on(channelDetails.Internal.SendMessageCompletedEvent, function(response) {
    _sendExternalCompleted(message, response, channelDetails, constants.pubSub.messageAction.requestRegistration);
  });

  switch (message.action) {
    case constants.pubSub.messageAction.sendMessage:
      internalEventEmitter.emit(channelDetails.Internal.SendMessageEvent, message.payload);
      break;
    default:
      console.error(`Type [${message.type}] is not supported`);
  }
}

/**
 * Publishes an external CRUD completed event
 *
 * @param {object} request - The original CRUD request object
 * @param {object} response - The CRUD response object
 * @param {array} channelDetails - Contains the external channelDetails details
 * @param {string} action - The CRUD action that was specified on the request
 *
 * @private
 */
function _sendExternalCompleted(request, response, channelDetails, action) {

  // pass the same messageId that was set on the request so that the gateway can map the completed event back to 
  // the original event
  var completedResponse = new Message(
    channelDetails.External.CompletedEvent,
    constants.pubSub.messageType.custom,
    action,
    response,
    request.header.messageId
  );

  pubSub.publish(completedResponse, channelDetails.External.CompletedEvent);
  _removeAllListeners(channelDetails);
}

/**
 * Removed the internal event listeners
 *
 * @param {array} channelDetails - Contains the external channelDetails details
 *
 * @private
 */
function _removeAllListeners(channelDetails) {
  internalEventEmitter.removeAllListeners(channelDetails.Internal.SendMessageCompletedEvent);
}