'use strict';

var logging = require('../utilities/Logging');
var AppUtil = require('../../libs/AppUtil');
var events = require('events');
var internalEmitter = new events.EventEmitter();
var PubSub = require('../../libs/PubSub/PubSubAdapter');
var SubscriptionHelper = require('../../libs/PubSub/SubscriptionHelper');
var UserChannels = require('../../PubSubChannels').User;
var constants = require('../../Constants');
var process = require('process');

module.exports = {
  initialize: async function () {

    if (AppUtil.isNullOrUndefined(UserChannels)) {
      throw new Error("[channel] is not set");
    }

    var handleMessage = async function handleMessage(err, message) {
      if (err) {
        return;
      }

      if(!message.tryValidate()) {
        return;
      }

      logging.logAction(
        logging.logLevels.INFO,
        "Message [" + JSON.stringify(message) + "] was received on channel [" + UserChannels.External.Event + "]" +
          " for recipient [" + message.recipient + "]"
      );

      switch (message.type) {
        case "crud":
          SubscriptionHelper.emitCRUDEvents(message, UserChannels, internalEmitter);
          break;
        default:
          logging.logAction(logging.logLevels.ERROR, "Type [%s] is not supported", message.type)
      }
    };

    try {
      await PubSub.subscribe(
        UserChannels.External.Event,
        {
          unsubscribe: false,
          subscriberId: process.pid,
          subscriberType: constants.pubSub.recipients.user
        },
        handleMessage
      );
    } catch (e) {
      logging.logAction(logging.logLevels.ERROR, `Failed to subscribe to channel [${UserChannels.External.Event}]`, e);
      throw e;
    }
  },
  emitInternalResponseEvent: function emitInternalResponseEvent(response, event) {
    this.internalEmitter.emit(
      event,
      response
    );
  },
  internalEmitter: internalEmitter
};