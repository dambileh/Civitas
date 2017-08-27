/**
 * Created by kevinfeng on 2017/08/26.
 */

'use strict';

var Logging = require('../utilities/Logging');
var PubSub = require('../../libs/PubSub/PubSubAdapter');
var Message = require('../../libs/PubSub/Message');
var constants = require('../../Constants');
var PubSubChannels = require('../../PubSubChannels');

/**
 * The Registration Service module
 */
module.exports = {

  confirmRegistration: async function (args, response, next) {

    var regRequest = args.register.value;

    var request = new Message(
      PubSubChannels.Registration.External.CompletedEvent,
      constants.pub_sub.message_type.custom,
      constants.pub_sub.message_action.confirmRegistration,
      constants.pub_sub.recipients.registration,
      regRequest
    );
      
    try {
      let completed = await PubSub.publishAndWaitForResponse(
        PubSubChannels.Registration.External.Event,
        PubSubChannels.Registration.External.CompletedEvent,
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
        `Failed to publish to channel [${PubSubChannels.Registration.External.Event}]`, err);
      return next(err);
    }
  }
};