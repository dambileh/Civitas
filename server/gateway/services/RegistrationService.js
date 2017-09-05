/**
 * Created by kevinfeng on 2017/08/26.
 */

'use strict';

var logging = require('../utilities/Logging');
var pubSub = require('../../libs/PubSub/PubSubAdapter');
var message = require('../../libs/PubSub/Message');
var constants = require('../../Constants');
var pubSubChannels = require('../../PubSubChannels');

/**
 * The Registration Service module
 */
module.exports = {

  confirmRegistration: async function (args, response, next) {

    var regRequest = args.register.value;

    var request = new message(
      pubSubChannels.Registration.External.CompletedEvent,
      constants.pubSub.messageType.custom,
      constants.pubSub.messageAction.confirmRegistration,
      constants.pubSub.recipients.registration,
      regRequest
    );
      
    try {
      let completed = await pubSub.publishAndWaitForResponse(
        pubSubChannels.Registration.External.Event,
        pubSubChannels.Registration.External.CompletedEvent,
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
        `Failed to publish to channel [${pubSubChannels.Registration.External.Event}]`, err);
      return next(err);
    }
  }
};