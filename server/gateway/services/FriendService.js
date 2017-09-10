'use strict';

var logging = require('../utilities/Logging');
var _ = require('lodash');
var pubSub = require('../../libs/PubSub/PubSubAdapter');
var message = require('../../libs/PubSub/Message');
var constants = require('../../Constants');
var pubSubChannels = require('../../PubSubChannels');
var process = require('process');

/**
 * The User Service module
 */
module.exports = {
  
  /**
   * Creates a user
   *
   * @param {object} args - The request arguments passed in from the controller
   * @param {IncomingMessage} response - The http response object
   * @param {function} next - The callback used to pass control to the next action/middleware
   */
  createFriend: async function(args, response, next) {

    var contactPayload = args.friend.value;
    var userId = args.id.value;

    var payload = {
      "user-id": userId,
      "numbers": contactPayload.numbers
    };

    var request = new message(
      pubSubChannels.User.External.Event,
      constants.pubSub.messageType.custom,
      constants.pubSub.messageAction.addFriends,
      payload
    );

    try {
      let completed =
        await pubSub.publishAndWaitForResponse(
        pubSubChannels.User.External.Event,
        pubSubChannels.User.External.CompletedEvent,
        {
          subscriberType: constants.pubSub.recipients.gateway,
          subscriberId: process.pid
        },
        request);

      response.statusCode = completed.payload.statusCode;
      response.setHeader('Content-Type', 'application/json');
      return response.end(JSON.stringify(completed.payload.body));
    } catch (err) {
      logging.logAction(
        logging.logLevels.ERROR,
        `Failed to subscribe to channel [${pubSubChannels.User.External.CompletedEvent}]`, err);
      return next(err);
    }

  }
};