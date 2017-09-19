'use strict';

var logging = require('../utilities/Logging');
var pubSub = require('../../libs/PubSub/PubSubAdapter');
var Message = require('../../libs/PubSub/Message');
var constants = require('../../Constants');
var pubSubChannels = require('../../PubSubChannels');
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
  createUser: async function (args, response, next) {
    var userRequest = args.user.value;

    var request = new Message(
      pubSubChannels.User.External.Event,
      constants.pubSub.messageType.crud,
      constants.pubSub.messageAction.create,
      userRequest
    );

    try {
      let userEventCompleted =
        await pubSub.publishAndWaitForResponse(
          pubSubChannels.User.External.Event,
          pubSubChannels.User.External.CompletedEvent,
          {
            subscriberType: constants.pubSub.recipients.gateway
          },
          request);

      // publish a new event to registration channel

      try {
        var registrationRequest = new Message(
          pubSubChannels.Registration.External.Event,
          constants.pubSub.messageType.custom,
          constants.pubSub.messageAction.requestRegistration,
          {
            msisdn : userRequest.msisdn
          }
        );

          await pubSub.publishAndWaitForResponse(
            pubSubChannels.Registration.External.Event,
            pubSubChannels.Registration.External.CompletedEvent,
            {
              subscriberType: constants.pubSub.recipients.gateway
            },
            registrationRequest
          );

      } catch (err) {
        logging.logAction(
          logging.logLevels.ERROR,
          `Failed to subscribe to channel [${pubSubChannels.Registration.External.CompletedEvent}]`, err);
        return next(err);
      }

      response.statusCode = userEventCompleted.payload.statusCode;
      response.setHeader('Content-Type', 'application/json');
      return response.end(JSON.stringify(userEventCompleted.payload.body));

    } catch (err) {
      logging.logAction(
        logging.logLevels.ERROR,
        `Failed to subscribe to channel [${pubSubChannels.User.External.CompletedEvent}]`, err);
      return next(err);
    }
  },

  /**
   * Returns all users
   *
   * @param {object} args - The request arguments passed in from the controller
   * @param {IncomingMessage} response - The http response object
   * @param {function} next - The callback used to pass control to the next action/middleware
   */
  getAllUsers: async function (args, response, next) {

    var request = new Message(
      pubSubChannels.User.External.Event,
      constants.pubSub.messageType.crud,
      constants.pubSub.messageAction.getAll,
      {}
    );

    try {
      let completed =
        await pubSub.publishAndWaitForResponse(
          pubSubChannels.User.External.Event,
          pubSubChannels.User.External.CompletedEvent,
          {
            subscriberType: constants.pubSub.recipients.gateway
          },
          request);

      response.statusCode = completed.payload.statusCode;
      response.setHeader('Content-Type', 'application/json');
      response.setHeader('X-Result-Count', completed.payload.header.resultCount);
      return response.end(JSON.stringify(completed.payload.body));

    } catch (err) {
      logging.logAction(
        logging.logLevels.ERROR,
        `Failed to subscribe to channel [${pubSubChannels.User.External.CompletedEvent}]`, err);
      return next(err);
    }
  },

  /**
   * Returns a single user
   *
   * @param {object} args - The request arguments passed in from the controller
   * @param {IncomingMessage} response - The http response object
   * @param {function} next - The callback used to pass control to the next action/middleware
   */
  getSingleUser: async function (args, response, next) {

    var userId = args.id.value;

    var request = new Message(
      pubSubChannels.User.External.Event,
      constants.pubSub.messageType.crud,
      constants.pubSub.messageAction.getSingle,
      {
        id: userId
      }
    );

    try {
      let completed =
        await pubSub.publishAndWaitForResponse(
          pubSubChannels.User.External.Event,
          pubSubChannels.User.External.CompletedEvent,
          {
            subscriberType: constants.pubSub.recipients.gateway
          },
          request);

      response.statusCode = completed.payload.statusCode;
      response.setHeader('Content-Type', 'application/json');
      return response.end(JSON.stringify(completed.payload.body))

    } catch (err) {
      logging.logAction(
        logging.logLevels.ERROR,
        `Failed to subscribe to channel [${pubSubChannels.User.External.CompletedEvent}]`, err);
      return next(err);
    }

  },
  /**
   * Deletes a user
   *
   * @param {object} args - The request arguments passed in from the controller
   * @param {IncomingMessage} response - The http response object
   * @param {function} next - The callback used to pass control to the next action/middleware
   */
  deleteUser: async function (args, response, next) {
    var userId = args.id.value;

    var request = new Message(
      pubSubChannels.User.External.Event,
      constants.pubSub.messageType.crud,
      constants.pubSub.messageAction.delete,
      {
        id: userId
      }
    );

    try {
      let completed =
        await pubSub.publishAndWaitForResponse(
          pubSubChannels.User.External.Event,
          pubSubChannels.User.External.CompletedEvent,
          {
            subscriberType: constants.pubSub.recipients.gateway
          },
          request);

      response.statusCode = completed.payload.statusCode;
      response.setHeader('Content-Type', 'application/json');
      return response.end(JSON.stringify(completed.payload.body))

    } catch (err) {
      logging.logAction(
        logging.logLevels.ERROR,
        `Failed to subscribe to channel [${pubSubChannels.User.External.CompletedEvent}]`, err);
      return next(err);
    }
  },

  /**
   * Updates a user
   *
   * @param {object} args - The request arguments passed in from the controller
   * @param {IncomingMessage} response - The http response object
   * @param {function} next - The callback used to pass control to the next action/middleware
   */
  updateUser: async function (args, response, next) {
    var userRequest = args.user.value;
    userRequest.id = args.id.value;

    var request = new Message(
      pubSubChannels.User.External.Event,
      constants.pubSub.messageType.crud,
      constants.pubSub.messageAction.update,
      userRequest
    );

    try {
      let completed =
        await pubSub.publishAndWaitForResponse(
          pubSubChannels.User.External.Event,
          pubSubChannels.User.External.CompletedEvent,
          {
            subscriberType: constants.pubSub.recipients.gateway
          },
          request);

      response.statusCode = completed.payload.statusCode;
      response.setHeader('Content-Type', 'application/json');
      return response.end(JSON.stringify(completed.payload.body))
    } catch (err) {
      logging.logAction(
        logging.logLevels.ERROR,
        `Failed to subscribe to channel [${pubSubChannels.User.External.CompletedEvent}]`, err);
      return next(err);
    }
  }
};