'use strict';

var logging = require('../utilities/Logging');
var pubSub = require('../../libs/PubSub/PubSubAdapter');
var Message = require('../../libs/PubSub/Message');
var constants = require('../../Constants');
var pubSubChannels = require('../../PubSubChannels');
/**
 * The Chat Service module
 */
module.exports = {

  /**
   * Creates a chat
   *
   * @param {object} args - The request arguments passed in from the controller
   * @param {IncomingMessage} response - The http response object
   * @param {function} next - The callback used to pass control to the next action/middleware
   */
  createChat: async function createChat(args, response, next) {
    let chatRequest = args.chat.value;

    chatRequest.owner = {
      kind: args.context.value,
      item: args['context-id'].value
    };

    let request = new Message(
      pubSubChannels.Chat.External.Event,
      constants.pubSub.messageType.crud,
      constants.pubSub.messageAction.create,
      chatRequest
    );

    try {
      let chatEventCompleted =
        await pubSub.publishAndWaitForResponse(
          pubSubChannels.Chat.External.Event,
          pubSubChannels.Chat.External.CompletedEvent,
          {
            subscriberType: constants.pubSub.recipients.gateway
          },
          request
        );

      response.statusCode = chatEventCompleted.payload.statusCode;
      response.setHeader('Content-Type', 'application/json');
      return response.end(JSON.stringify(chatEventCompleted.payload.body));

    } catch (err) {
      logging.logAction(
        logging.logLevels.ERROR,
        `Failed to publish to channel [${pubSubChannels.Chat.External.CompletedEvent}]`, err);
      return next(err);
    }
  },

  /**
   * Returns all chats
   *
   * @param {object} args - The request arguments passed in from the controller
   * @param {IncomingMessage} response - The http response object
   * @param {function} next - The callback used to pass control to the next action/middleware
   */
  getAllChats: async function getAllChats(args, response, next) {

    let chatRequest = {
      owner: {
        kind: args.context.value,
        item: args['context-id'].value
      }
    };

    let request = new Message(
      pubSubChannels.Chat.External.Event,
      constants.pubSub.messageType.crud,
      constants.pubSub.messageAction.getAll,
      chatRequest
    );

    try {
      let completed =
        await pubSub.publishAndWaitForResponse(
          pubSubChannels.Chat.External.Event,
          pubSubChannels.Chat.External.CompletedEvent,
          {
            subscriberType: constants.pubSub.recipients.gateway
          },
          request
        );

      response.statusCode = completed.payload.statusCode;
      response.setHeader('Content-Type', 'application/json');

      if (completed.payload.header && completed.payload.header.resultCount) {
        response.setHeader('X-Result-Count', completed.payload.header.resultCount);
      }

      return response.end(JSON.stringify(completed.payload.body));

    } catch (err) {
      logging.logAction(
        logging.logLevels.ERROR,
        `Failed to publish to channel [${pubSubChannels.Chat.External.CompletedEvent}]`, err);
      return next(err);
    }
  },

  /**
   * Returns a single chat
   *
   * @param {object} args - The request arguments passed in from the controller
   * @param {IncomingMessage} response - The http response object
   * @param {function} next - The callback used to pass control to the next action/middleware
   */
  getSingleChat: async function getSingleChat(args, response, next) {

    let chatRequest = {
      id: args.id.value,
      owner: {
        kind: args.context.value,
        item: args['context-id'].value
      }
    };

    let request = new Message(
      pubSubChannels.Chat.External.Event,
      constants.pubSub.messageType.crud,
      constants.pubSub.messageAction.getSingle,
      chatRequest
    );

    try {
      let completed =
        await pubSub.publishAndWaitForResponse(
          pubSubChannels.Chat.External.Event,
          pubSubChannels.Chat.External.CompletedEvent,
          {
            subscriberType: constants.pubSub.recipients.gateway
          },
          request
        );

      response.statusCode = completed.payload.statusCode;
      response.setHeader('Content-Type', 'application/json');
      return response.end(JSON.stringify(completed.payload.body))

    } catch (err) {
      logging.logAction(
        logging.logLevels.ERROR,
        `Failed to publish to channel [${pubSubChannels.Chat.External.CompletedEvent}]`, err);
      return next(err);
    }

  },
  /**
   * Deletes a chat
   *
   * @param {object} args - The request arguments passed in from the controller
   * @param {IncomingMessage} response - The http response object
   * @param {function} next - The callback used to pass control to the next action/middleware
   */
  deleteChat: async function deleteChat(args, response, next) {

    let chatRequest = {
      id: args.id.value,
      owner: {
        kind: args.context.value,
        item: args['context-id'].value
      }
    };

    let request = new Message(
      pubSubChannels.Chat.External.Event,
      constants.pubSub.messageType.crud,
      constants.pubSub.messageAction.delete,
      chatRequest
    );

    try {
      let completed =
        await pubSub.publishAndWaitForResponse(
          pubSubChannels.Chat.External.Event,
          pubSubChannels.Chat.External.CompletedEvent,
          {
            subscriberType: constants.pubSub.recipients.gateway
          },
          request
        );

      response.statusCode = completed.payload.statusCode;
      response.setHeader('Content-Type', 'application/json');
      return response.end(JSON.stringify(completed.payload.body))

    } catch (err) {
      logging.logAction(
        logging.logLevels.ERROR,
        `Failed to publish to channel [${pubSubChannels.Chat.External.CompletedEvent}]`, err);
      return next(err);
    }
  },

  /**
   * Updates a chat
   *
   * @param {object} args - The request arguments passed in from the controller
   * @param {IncomingMessage} response - The http response object
   * @param {function} next - The callback used to pass control to the next action/middleware
   */
  updateChat: async function updateChat(args, response, next) {

    let chatRequest = args.chat.value;
    chatRequest.id = args.id.value;
    chatRequest.owner = {
      kind: args.context.value,
      item: args['context-id'].value
    };

    let request = new Message(
      pubSubChannels.Chat.External.Event,
      constants.pubSub.messageType.crud,
      constants.pubSub.messageAction.update,
      chatRequest
    );

    try {
      let completed =
        await pubSub.publishAndWaitForResponse(
          pubSubChannels.Chat.External.Event,
          pubSubChannels.Chat.External.CompletedEvent,
          {
            subscriberType: constants.pubSub.recipients.gateway
          },
          request
        );

      response.statusCode = completed.payload.statusCode;
      response.setHeader('Content-Type', 'application/json');
      return response.end(JSON.stringify(completed.payload.body))
    } catch (err) {
      logging.logAction(
        logging.logLevels.ERROR,
        `Failed to publish to channel [${pubSubChannels.Chat.External.CompletedEvent}]`, err);
      return next(err);
    }
  }
};