'use strict';

var logging = require('../utilities/Logging');
var appUtil = require('../../libs/AppUtil');
var pubSub = require('../../libs/PubSub/PubSubAdapter');
var subscriptionHelper = require('../../libs/PubSub/SubscriptionHelper');
var registrationChannels = require('../../PubSubChannels').Registration;
var constants = require('../../Constants');
var process = require('process');

module.exports = {
  initialize: async function () {

    if (appUtil.isNullOrUndefined(registrationChannels)) {
      throw new Error('[channel] is not set');
    }

    var handleMessage = async function handleMessage(err, message) {
      if (err) {
        return;
      }

      if (!message.tryValidate()) {
        return;
      }

      logging.logAction(
        logging.logLevels.INFO,
        `Message [${JSON.stringify(message)}] was received on channel [${registrationChannels.External.Event}] 
              for recipient [${message.recipient}]`
      );

      switch (message.type) {
        case constants.pubSub.messageType.custom:
          if (message.action == constants.pubSub.messageAction.requestRegistration) {
            subscriptionHelper.emitRegistrationEvents(message, registrationChannels);
          } else if (message.action == constants.pubSub.messageAction.confirmRegistration) {
            subscriptionHelper.emitConfirmRegistrationEvents(message, registrationChannels);
          }
          break;
        default:
          logging.logAction(logging.logLevels.ERROR, `Type [${message.type}] is not supported`)
      }
    };

    try {
      await pubSub.subscribe(
        registrationChannels.External.Event,
        {
          subscriberId: process.pid,
          subscriberType: constants.pubSub.recipients.registration
        },
        handleMessage
      );
    } catch (e) {
      logging.logAction(
        logging.logLevels.ERROR, `Failed to subscribe to channel [${registrationChannels.External.Event}]`,
        e
      );
      throw e;
    }
  }
};