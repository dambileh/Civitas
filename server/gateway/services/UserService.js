'use strict';

var AppUtil = require('../../libs/AppUtil');
var logging = require('../utilities/Logging');
var config = require('config');
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
  createUser: function(args, response, next) {

    var userRequest = args.user.value;

    var request = new Message(
      PubSubChannels.User.External.Event,
      constants.pub_sub.message_type.crud,
      constants.pub_sub.message_action.create,
      constants.pub_sub.recipients.user,
      userRequest
    );

    PubSub
      .publish(request, PubSubChannels.User.External.Event)
      .subscribe(PubSubChannels.User.External.CompletedEvent, { unsubscribe: true },
        function handleCompleted(err, completed) {
          if (err) {
            return next(err);
          }

          response.statusCode = completed.payload.statusCode;
          response.setHeader('Content-Type', 'application/json');
          return response.end(JSON.stringify(completed.payload.body));
        });
  },

  /**
   * Returns all users
   *
   * @param {object} args - The request arguments passed in from the controller
   * @param {IncomingMessage} response - The http response object
   * @param {function} next - The callback used to pass control to the next action/middleware
   */
  getAllUsers: function(args, response, next) {

    var request = new Message(
      PubSubChannels.User.External.Event,
      constants.pub_sub.message_type.crud,
      constants.pub_sub.message_action.getAll,
      constants.pub_sub.recipients.user,
      {}
    );

    PubSub
      .publish(request, PubSubChannels.User.External.Event)
      .subscribe(PubSubChannels.User.External.CompletedEvent, { unsubscribe: true },
        function handleCompleted(err, completed) {
          if (err) {
            return next(err);
          }

          response.statusCode = completed.payload.statusCode;
          response.setHeader('Content-Type', 'application/json');
          response.setHeader('X-Result-Count', completed.payload.header.resultCount);
          return response.end(JSON.stringify(completed.payload.body));
        });
  },

  /**
   * Returns a single user
   *
   * @param {object} args - The request arguments passed in from the controller
   * @param {IncomingMessage} response - The http response object
   * @param {function} next - The callback used to pass control to the next action/middleware
   */
  getSingleUser: function(args, response, next) {
    var userId = args.id.value;

    var request = new Message(
      PubSubChannels.User.External.Event,
      constants.pub_sub.message_type.crud,
      constants.pub_sub.message_action.getSingle,
      constants.pub_sub.recipients.user,
      {
        id: userId
      }
    );

    PubSub
      .publish(request, PubSubChannels.User.External.Event)
      .subscribe(PubSubChannels.User.External.CompletedEvent, { unsubscribe: true },
        function handleCompleted(err, completed) {
          if (err) {
            return next(err);
          }

          response.statusCode = completed.payload.statusCode;
          response.setHeader('Content-Type', 'application/json');
          return response.end(JSON.stringify(completed.payload.body));
        });
  },

  /**
   * Deletes a user
   *
   * @param {object} args - The request arguments passed in from the controller
   * @param {IncomingMessage} response - The http response object
   * @param {function} next - The callback used to pass control to the next action/middleware
   */
  deleteUser: function(args, response, next) {
    var userId = args.id.value;

    var request = new Message(
      PubSubChannels.User.External.Event,
      constants.pub_sub.message_type.crud,
      constants.pub_sub.message_action.delete,
      constants.pub_sub.recipients.user,
      {
        id: userId
      }
    );

    PubSub
      .publish(request, PubSubChannels.User.External.Event)
      .subscribe(PubSubChannels.User.External.CompletedEvent, { unsubscribe: true },
        function handleCompleted(err, completed) {
          if (err) {
            return next(err);
          }

          response.statusCode = completed.payload.statusCode;
          response.setHeader('Content-Type', 'application/json');
          return response.end(JSON.stringify(completed.payload.body));
        });
  },

  /**
   * Updates a user
   *
   * @param {object} args - The request arguments passed in from the controller
   * @param {IncomingMessage} response - The http response object
   * @param {function} next - The callback used to pass control to the next action/middleware
   */
  updateUser: function(args, response, next) {
    var userRequest = args.user.value;
    userRequest.id = args.id.value;

    var request = new Message(
      PubSubChannels.User.External.Event,
      constants.pub_sub.message_type.crud,
      constants.pub_sub.message_action.update,
      constants.pub_sub.recipients.user,
      userRequest
    );

    PubSub
      .publish(request, PubSubChannels.User.External.Event)
      .subscribe(PubSubChannels.User.External.CompletedEvent, { unsubscribe: true },
        function handleCompleted(err, completed) {
          if (err) {
            return next(err);
          }

          response.statusCode = completed.payload.statusCode;
          response.setHeader('Content-Type', 'application/json');
          return response.end(JSON.stringify(completed.payload.body));
        });
  },

  /**
   * Allows users to invite other users
   *
   * @param {object} args - The request arguments passed in from the controller
   * @param {IncomingMessage} response - The http response object
   * @param {function} next - The callback used to pass control to the next action/middleware
   */
  inviteUser: async function(args, response, next) {

    var invitePayload = args.invite.value;
    var userId = args.id.value;

    var payload = {
      "user-id": userId,
      "number": invitePayload
    };
    var request = new Message(
      PubSubChannels.User.External.Event,
      constants.pubSub.messageType.custom,
      constants.pubSub.messageAction.inviteUser,
      constants.pubSub.recipients.user,
      payload
    );

    try {
      let completed =
        await PubSub.publishAndWaitForResponse(
          PubSubChannels.User.External.Event,
          PubSubChannels.User.External.CompletedEvent,
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
        `Failed to subscribe to channel [${PubSubChannels.User.External.CompletedEvent}]`, err);
      return next(err);
    }
  }
};