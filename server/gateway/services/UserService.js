'use strict';

var Logging = require('../utilities/Logging');
var _ = require('lodash');
var PubSub = require('../../libs/PubSub/PubSubAdapter');
var Message = require('../../libs/PubSub/Message');
var constants = require('../../Constants');
var PubSubChannels = require('../../PubSubChannels');

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
      PubSubChannels.User.External.Event,
      constants.pubSub.message_type.crud,
      constants.pubSub.message_action.create,
      userRequest
    );

    try {
      let completed =
        await PubSub.publishAndWaitForResponse(
          PubSubChannels.User.External.Event,
          PubSubChannels.User.External.CompletedEvent,
          {
            subscriberType: constants.pubSub.recipients.gateway
          },
          request);

      response.statusCode = completed.payload.statusCode;
      response.setHeader('Content-Type', 'application/json');
      return response.end(JSON.stringify(completed.payload.body));
    } catch (err) {
      logging.logAction(
        logging.logLevels.ERROR,
        `Failed to publish to channel [${PubSubChannels.User.External.Event}]`, err);
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
      PubSubChannels.User.External.Event,
      constants.pubSub.message_type.crud,
      constants.pubSub.message_action.getAll,
      {}
    );

    try {
      let completed =
        await PubSub.publishAndWaitForResponse(
          PubSubChannels.User.External.Event,
          PubSubChannels.User.External.CompletedEvent,
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
        `Failed to publish to channel [${PubSubChannels.User.External.Event}]`, err);
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
      PubSubChannels.User.External.Event,
      constants.pubSub.message_type.crud,
      constants.pubSub.message_action.getSingle,
      {
        id: userId
      }
    );

    try {
      let completed =
        await PubSub.publishAndWaitForResponse(
          PubSubChannels.User.External.Event,
          PubSubChannels.User.External.CompletedEvent,
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
        `Failed to publish to channel [${PubSubChannels.User.External.Event}]`, err);
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
      PubSubChannels.User.External.Event,
      constants.pubSub.message_type.crud,
      constants.pubSub.message_action.delete,
      {
        id: userId
      }
    );

    try {
      let completed =
        await PubSub.publishAndWaitForResponse(
          PubSubChannels.User.External.Event,
          PubSubChannels.User.External.CompletedEvent,
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
        `Failed to publish to channel [${PubSubChannels.User.External.Event}]`, err);
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
      PubSubChannels.User.External.Event,
      constants.pubSub.message_type.crud,
      constants.pubSub.message_action.update,
      userRequest
    );

    try {
      let completed =
        await PubSub.publishAndWaitForResponse(
          PubSubChannels.User.External.Event,
          PubSubChannels.User.External.CompletedEvent,
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
        `Failed to publish to channel [${PubSubChannels.User.External.Event}]`, err);
      return next(err);
    }
  }
};