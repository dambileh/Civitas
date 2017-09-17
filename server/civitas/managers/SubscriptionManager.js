'use strict';

var logging = require('../utilities/Logging');
var appUtil = require('../../libs/AppUtil');
var pubSub = require('../../libs/PubSub/PubSubAdapter');
var subscriptionHelper = require('../../libs/PubSub/SubscriptionHelper');
var userChannels = require('../../PubSubChannels').User;
var constants = require('../../Constants');
var process = require('process');
var internalEventEmitter = require('../../libs/InternalEventEmitter');

module.exports = {
  initialize: async function () {

    if (appUtil.isNullOrUndefined(userChannels)) {
      throw new Error('[channel] is not set');
    }

    var handleMessage = async function handleMessage(err, message) {
      if (err) {
        return;
      }

      if(!message.tryValidate()) {
        return;
      }

      logging.logAction(
        logging.logLevels.INFO,
        `Message [${JSON.stringify(message)}] was received on channel [${userChannels.External.Event}] for recipient [
            ${message.recipient}]`
      );

      switch (message.type) {
        case constants.pubSub.messageType.crud:
          subscriptionHelper.emitCRUDEvents(message, userChannels);
          break;
        default:
          logging.logAction(logging.logLevels.ERROR, `Type [${message.type}] is not supported`)
      }
    };

    try {
      await pubSub.subscribe(
        userChannels.External.Event,
        {
          subscriberId: process.pid,
          subscriberType: constants.pubSub.recipients.user
        },
        handleMessage
      );
    } catch (e) {
      logging.logAction(logging.logLevels.ERROR, `Failed to subscribe to channel [${userChannels.External.Event}]`, e);
      throw e;
    }
  }
};

process.on('exit', () => {
});