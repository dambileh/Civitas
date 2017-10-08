'use strict';

var logging = require('../utilities/Logging');
var pubSub = require('../../libs/PubSub/PubSubAdapter');
var message = require('../../libs/PubSub/Message');
var constants = require('../../Constants');
var pubSubChannels = require('../../PubSubChannels');

module.exports = {

  /**
   * Gets the system status
   *
   * @param {object} args - The request arguments passed in from the controller
   * @param {IncomingMessage} response - The http response object
   * @param {function} next - The callback used to pass control to the next action/middleware
   *
   * @author Hadi Shayesteh <Hadishayesteh@gmail.com>
   * @since  14 Aug 2017
   */
  sendMessage: async function sendMessage(args, response, next) {

    var regRequest = args.message.value;

    var request = new message(
      pubSubChannels.MessageHub.External.Event,
      constants.pubSub.messageType.custom,
      constants.pubSub.messageAction.sendMessage,
      regRequest
    );

    try {
      let completed = await pubSub.publishAndWaitForResponse(
        pubSubChannels.MessageHub.External.Event,
        pubSubChannels.MessageHub.External.CompletedEvent,
        {
          subscriberType: constants.pubSub.recipients.gateway
        },
        request
      );

      response.statusCode = completed.payload.statusCode;
      response.setHeader('Content-Type', 'application/json');
      return response.end(JSON.stringify(completed.payload.body));
    } catch (err) {
      logging.logAction(
        logging.logLevels.ERROR,
        `Failed to publish to channel [${pubSubChannels.MessageHub.External.Event}]`, err);
      return next(err);
    }
  }
};

