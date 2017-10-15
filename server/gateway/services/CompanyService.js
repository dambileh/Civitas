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
   * Creates a company
   *
   * @param {object} args - The request arguments passed in from the controller
   * @param {IncomingMessage} response - The http response object
   * @param {function} next - The callback used to pass control to the next action/middleware
   */
  createCompany: async function createCompany(args, response, next) {
    let companyRequest = args.company.value;

    companyRequest.owner = {
      kind: args.context.value,
      item: args['context-id'].value
    };

    let request = new Message(
      pubSubChannels.Company.External.Event,
      constants.pubSub.messageType.crud,
      constants.pubSub.messageAction.create,
      companyRequest
    );

    try {
      let companyEventCompleted =
        await pubSub.publishAndWaitForResponse(
          pubSubChannels.Company.External.Event,
          pubSubChannels.Company.External.CompletedEvent,
          {
            subscriberType: constants.pubSub.recipients.gateway
          },
          request
        );

      response.statusCode = companyEventCompleted.payload.statusCode;
      response.setHeader('Content-Type', 'application/json');
      return response.end(JSON.stringify(companyEventCompleted.payload.body));

    } catch (err) {
      logging.logAction(
        logging.logLevels.ERROR,
        `Failed to publish to channel [${pubSubChannels.Company.External.CompletedEvent}]`, err);
      return next(err);
    }
  },

  /**
   * Returns all companies
   *
   * @param {object} args - The request arguments passed in from the controller
   * @param {IncomingMessage} response - The http response object
   * @param {function} next - The callback used to pass control to the next action/middleware
   */
  getAllCompanies: async function getAllCompanies(args, response, next) {

    let companyRequest = {
      owner: {
        kind: args.context.value,
        item: args['context-id'].value
      }
    };

    let request = new Message(
      pubSubChannels.Company.External.Event,
      constants.pubSub.messageType.crud,
      constants.pubSub.messageAction.getAll,
      companyRequest
    );

    try {
      let completed =
        await pubSub.publishAndWaitForResponse(
          pubSubChannels.Company.External.Event,
          pubSubChannels.Company.External.CompletedEvent,
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
        `Failed to publish to channel [${pubSubChannels.Company.External.CompletedEvent}]`, err);
      return next(err);
    }
  },

  /**
   * Returns a single company
   *
   * @param {object} args - The request arguments passed in from the controller
   * @param {IncomingMessage} response - The http response object
   * @param {function} next - The callback used to pass control to the next action/middleware
   */
  getSingleCompany: async function getSingleCompany(args, response, next) {

    let companyRequest = {
      id: args.id.value,
      owner: {
        kind: args.context.value,
        item: args['context-id'].value
      }
    };

    let request = new Message(
      pubSubChannels.Company.External.Event,
      constants.pubSub.messageType.crud,
      constants.pubSub.messageAction.getSingle,
      companyRequest
    );

    try {
      let completed =
        await pubSub.publishAndWaitForResponse(
          pubSubChannels.Company.External.Event,
          pubSubChannels.Company.External.CompletedEvent,
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
        `Failed to publish to channel [${pubSubChannels.Company.External.CompletedEvent}]`, err);
      return next(err);
    }

  },
  /**
   * Deletes a company
   *
   * @param {object} args - The request arguments passed in from the controller
   * @param {IncomingMessage} response - The http response object
   * @param {function} next - The callback used to pass control to the next action/middleware
   */
  deleteCompany: async function deleteCompany(args, response, next) {

    let companyRequest = {
      id: args.id.value,
      owner: {
        kind: args.context.value,
        item: args['context-id'].value
      }
    };

    let request = new Message(
      pubSubChannels.Company.External.Event,
      constants.pubSub.messageType.crud,
      constants.pubSub.messageAction.delete,
      companyRequest
    );

    try {
      let completed =
        await pubSub.publishAndWaitForResponse(
          pubSubChannels.Company.External.Event,
          pubSubChannels.Company.External.CompletedEvent,
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
        `Failed to publish to channel [${pubSubChannels.Company.External.CompletedEvent}]`, err);
      return next(err);
    }
  },

  /**
   * Updates a company
   *
   * @param {object} args - The request arguments passed in from the controller
   * @param {IncomingMessage} response - The http response object
   * @param {function} next - The callback used to pass control to the next action/middleware
   */
  updateCompany: async function updateCompany(args, response, next) {

    let companyRequest = args.company.value;
    companyRequest.id = args.id.value;
    companyRequest.owner = {
      kind: args.context.value,
      item: args['context-id'].value
    };

    let request = new Message(
      pubSubChannels.Company.External.Event,
      constants.pubSub.messageType.crud,
      constants.pubSub.messageAction.update,
      companyRequest
    );

    try {
      let completed =
        await pubSub.publishAndWaitForResponse(
          pubSubChannels.Company.External.Event,
          pubSubChannels.Company.External.CompletedEvent,
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
        `Failed to publish to channel [${pubSubChannels.Company.External.CompletedEvent}]`, err);
      return next(err);
    }
  }
};