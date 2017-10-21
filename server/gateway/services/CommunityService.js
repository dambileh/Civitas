'use strict';

var logging = require('../utilities/Logging');
var pubSub = require('../../libs/PubSub/PubSubAdapter');
var Message = require('../../libs/PubSub/Message');
var constants = require('../../Constants');
var pubSubChannels = require('../../PubSubChannels');
/**
 * The Community Service module
 */
module.exports = {

  /**
   * Creates a community
   *
   * @param {object} args - The request arguments passed in from the controller
   * @param {IncomingMessage} response - The http response object
   * @param {function} next - The callback used to pass control to the next action/middleware
   */
  createCommunity: async function createCommunity(args, response, next) {
    let communityRequest = args.community.value;

    communityRequest.owner = {
      kind: args.context.value,
      item: args['context-id'].value
    };

    let request = new Message(
      pubSubChannels.Community.External.Event,
      constants.pubSub.messageType.crud,
      constants.pubSub.messageAction.create,
      communityRequest
    );

    try {
      let communityEventCompleted =
        await pubSub.publishAndWaitForResponse(
          pubSubChannels.Community.External.Event,
          pubSubChannels.Community.External.CompletedEvent,
          {
            subscriberType: constants.pubSub.recipients.gateway
          },
          request
        );

      response.statusCode = communityEventCompleted.payload.statusCode;
      response.setHeader('Content-Type', 'application/json');
      return response.end(JSON.stringify(communityEventCompleted.payload.body));

    } catch (err) {
      logging.logAction(
        logging.logLevels.ERROR,
        `Failed to publish to channel [${pubSubChannels.Community.External.CompletedEvent}]`, err);
      return next(err);
    }
  },

  /**
   * Returns all communities
   *
   * @param {object} args - The request arguments passed in from the controller
   * @param {IncomingMessage} response - The http response object
   * @param {function} next - The callback used to pass control to the next action/middleware
   */
  getAllCommunities: async function getAllCommunities(args, response, next) {

    let communityRequest = {
      owner: {
        kind: args.context.value,
        item: args['context-id'].value
      }
    };

    let request = new Message(
      pubSubChannels.Community.External.Event,
      constants.pubSub.messageType.crud,
      constants.pubSub.messageAction.getAll,
      communityRequest
    );

    try {
      let completed =
        await pubSub.publishAndWaitForResponse(
          pubSubChannels.Community.External.Event,
          pubSubChannels.Community.External.CompletedEvent,
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
        `Failed to publish to channel [${pubSubChannels.Community.External.CompletedEvent}]`, err);
      return next(err);
    }
  },

  /**
   * Returns a single community
   *
   * @param {object} args - The request arguments passed in from the controller
   * @param {IncomingMessage} response - The http response object
   * @param {function} next - The callback used to pass control to the next action/middleware
   */
  getSingleCommunity: async function getSingleCommunity(args, response, next) {

    let communityRequest = {
      id: args.id.value,
      owner: {
        kind: args.context.value,
        item: args['context-id'].value
      }
    };

    let request = new Message(
      pubSubChannels.Community.External.Event,
      constants.pubSub.messageType.crud,
      constants.pubSub.messageAction.getSingle,
      communityRequest
    );

    try {
      let completed =
        await pubSub.publishAndWaitForResponse(
          pubSubChannels.Community.External.Event,
          pubSubChannels.Community.External.CompletedEvent,
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
        `Failed to publish to channel [${pubSubChannels.Community.External.CompletedEvent}]`, err);
      return next(err);
    }

  },
  /**
   * Deletes a community
   *
   * @param {object} args - The request arguments passed in from the controller
   * @param {IncomingMessage} response - The http response object
   * @param {function} next - The callback used to pass control to the next action/middleware
   */
  deleteCommunity: async function deleteCommunity(args, response, next) {

    let communityRequest = {
      id: args.id.value,
      owner: {
        kind: args.context.value,
        item: args['context-id'].value
      }
    };

    let request = new Message(
      pubSubChannels.Community.External.Event,
      constants.pubSub.messageType.crud,
      constants.pubSub.messageAction.delete,
      communityRequest
    );

    try {
      let completed =
        await pubSub.publishAndWaitForResponse(
          pubSubChannels.Community.External.Event,
          pubSubChannels.Community.External.CompletedEvent,
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
        `Failed to publish to channel [${pubSubChannels.Community.External.CompletedEvent}]`, err);
      return next(err);
    }
  },

  /**
   * Updates a community
   *
   * @param {object} args - The request arguments passed in from the controller
   * @param {IncomingMessage} response - The http response object
   * @param {function} next - The callback used to pass control to the next action/middleware
   */
  updateCommunity: async function updateCommunity(args, response, next) {

    let communityRequest = args.community.value;
    communityRequest.id = args.id.value;
    communityRequest.owner = {
      kind: args.context.value,
      item: args['context-id'].value
    };

    let request = new Message(
      pubSubChannels.Community.External.Event,
      constants.pubSub.messageType.crud,
      constants.pubSub.messageAction.update,
      communityRequest
    );

    try {
      let completed =
        await pubSub.publishAndWaitForResponse(
          pubSubChannels.Community.External.Event,
          pubSubChannels.Community.External.CompletedEvent,
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
        `Failed to publish to channel [${pubSubChannels.Community.External.CompletedEvent}]`, err);
      return next(err);
    }
  }
};