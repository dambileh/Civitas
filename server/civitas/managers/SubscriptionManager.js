'use strict';

const logging = require('../utilities/Logging');
const appUtil = require('../../libs/AppUtil');
const pubSub = require('../../libs/PubSub/PubSubAdapter');
const subscriptionHelper = require('../../libs/PubSub/SubscriptionHelper');
const pubSubChannels = require('../../PubSubChannels');
const userChannels = pubSubChannels.User;
const companyChannels = pubSubChannels.Company;
const communityChannels = pubSubChannels.Community;
const constants = require('../../Constants');

module.exports = {
  initialize: async function () {
    await _subscribeToUserChannel();
    await _subscribeToCompanyChannel();
    await _subscribeToCommunityChannel();
  }
};

async function  _subscribeToUserChannel() {
  if (appUtil.isNullOrUndefined(userChannels)) {
    throw new Error('[channel] is not set');
  }

  try {
    await pubSub.subscribe(
      userChannels.External.Event,
      {
        subscriberType: constants.pubSub.recipients.user
      },
      (err, message) => {
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
      }
    );
  } catch (e) {
    logging.logAction(logging.logLevels.ERROR, `Failed to subscribe to channel [${userChannels.External.Event}]`, e);
    throw e;
  }
}

async function  _subscribeToCompanyChannel() {
  if (appUtil.isNullOrUndefined(companyChannels)) {
    throw new Error('[channel] is not set');
  }

  try {
    await pubSub.subscribe(
      companyChannels.External.Event,
      {
        subscriberType: constants.pubSub.recipients.company
      },
      (err, message) => {
        if (err) {
          return;
        }

        if(!message.tryValidate()) {
          return;
        }

        logging.logAction(
          logging.logLevels.INFO,
          `Message [${JSON.stringify(message)}] was received on channel [${companyChannels.External.Event}] for recipient [
            ${message.recipient}]`
        );

        switch (message.type) {
          case constants.pubSub.messageType.crud:
            subscriptionHelper.emitCRUDEvents(message, companyChannels);
            break;
          default:
            logging.logAction(logging.logLevels.ERROR, `Type [${message.type}] is not supported`)
        }
      }
    );
  } catch (e) {
    logging.logAction(logging.logLevels.ERROR, `Failed to subscribe to channel [${companyChannels.External.Event}]`, e);
    throw e;
  }
}

async function  _subscribeToCommunityChannel() {
  if (appUtil.isNullOrUndefined(communityChannels)) {
    throw new Error('[channel] is not set');
  }

  try {
    await pubSub.subscribe(
      communityChannels.External.Event,
      {
        subscriberType: constants.pubSub.recipients.community
      },
      (err, message) => {
        if (err) {
          return;
        }

        if(!message.tryValidate()) {
          return;
        }

        logging.logAction(
          logging.logLevels.INFO,
          `Message [${JSON.stringify(message)}] was received on channel [${communityChannels.External.Event}] for recipient [
            ${message.recipient}]`
        );

        switch (message.type) {
          case constants.pubSub.messageType.crud:
            subscriptionHelper.emitCRUDEvents(message, communityChannels);
            break;
          default:
            logging.logAction(logging.logLevels.ERROR, `Type [${message.type}] is not supported`)
        }
      }
    );
  } catch (e) {
    logging.logAction(logging.logLevels.ERROR, `Failed to subscribe to channel [${communityChannels.External.Event}]`, e);
    throw e;
  }
}