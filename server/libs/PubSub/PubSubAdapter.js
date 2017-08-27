'use strict';

var redis = require('redis');
var Message = require('./Message');
var PubSubHelper = require('./PubSubHelper');
var Constants = require('../../Constants');

/**
 * An instance of the service helper
 *
 * @author Hossein Shayesteh <hsh_85@yahoo.com>
 * @since  14 Aug 2017
 *
 * @module ServiceHelper
 */
module.exports = {

  /**
   * This will publish a message to a given channel
   *
   * @param {object} message - The message object that will be published to the given channel
   * @param {string} channel - The channel to which the message will be published
   * @param {object} config - The object containing publisher configurations
   *
   * @returns {object} An instance of the adapter. Used to create a Fluent interface
   */
  publish: async function publish(message, channel, config) {

    // //TODO retry and then persist a message if there was any error during publish
    let client = await PubSubHelper.createClient();
    if (!message.tryValidate()) {
      throw new Error("[Message] did not pass the validation checks: [" + message.getValidationErrors() + "]");
    }

    let subscriberTypes = await PubSubHelper.getSubscriberTypes(channel);

    for (let type of subscriberTypes) {
      // Foreach type, first push the messageId to their list
      await PubSubHelper.addMessageIdToTypeSet(channel, type, message.header.messageId);
      message.header.sentAt = new Date();
      message.recipient = type;
      client.publish(channel, JSON.stringify(message));
    }

    client.quit();
  },

  /**
   * This will wait for a response to arrive at a given channel and will return that response to the client
   *
   * @param {string} channel - The channel to wait on
   * @param {object} config - The object containing publisher configurations
   * @param {object} message - The function that will be called once a the wait is over
   *
   * @returns {object} An instance of the adapter. Used to create a Fluent interface
   */
  publishAndWaitForResponse: async function publishAndWaitForResponse(channel, reponseChannel, config, message) {
    // //TODO retry and then persist a message if there was any error during publish
    return new Promise(async function (resolve, reject) {
      let pub = await PubSubHelper.createClient();
      if (!message.tryValidate()) {
        throw new Error("[Message] did not pass the validation checks: [" + message.getValidationErrors() + "]");
      }

      let subscriberTypes = await PubSubHelper.getSubscriberTypes(channel);

      for (let type of subscriberTypes) {
        // Foreach type, first push the messageId to their list
        await PubSubHelper.addMessageIdToTypeSet(channel, type, message.header.messageId);
        message.header.sentAt = new Date();
        message.recipient = type;
        pub.publish(channel, JSON.stringify(message));
      }

      pub.quit();

      // Check that the subscriberType is set
      if (!config.subscriberType) {
        throw new Error("[subscriberType] was not set on the config");
      }

      let sub = await PubSubHelper.createClient();
      sub.subscribe(reponseChannel);

      sub.on('message', async function (channel, response) {
        response = new Message().createFromString(response);

        if (
          response.channel == channel &&
          response.recipient == config.subscriberType &&
          response.header.messageId == message.header.messageId
        ) {

          // Remove the message id from the list so that no other service consumes it
          var result = await PubSubHelper.removeMessageIdFromTypeSet(
            response.channel,
            response.recipient,
            response.header.messageId);

          // Discard the message if it did not exist in the type set. (This means that the message has already been
          // consumed by another service of the same type)
          if (result) {
            sub.unsubscribe(channel);
            sub.quit();
            resolve(response);
          }

        }
      });
    });
  },
  /**
   * This will wait for a response to arrive at a given channel and will return that response to the client
   *
   * @param {string} channel - The channel to wait on
   * @param {object} config - The object containing publisher configurations
   * @param {function} callback - The function that will be called once a the wait is over
   *
   * @returns {object} An instance of the adapter. Used to create a Fluent interface
   */
  subscribe: async function subscribe(channel, config, callback) {
    // Check that the subscriberType and subscriberId are set
    if (!config.subscriberType || !config.subscriberId) {
      throw new Error("[subscriberType] or [subscriberId] was not set on the config");
    }

    let sub = await PubSubHelper.createClient();
    sub.subscribe(channel);
    sub.on("subscribe", async function (channel, count) {
     await PubSubHelper.registerChannelSubscribers(channel, config.subscriberType, config.subscriberId)
    });

    sub.on('message', async function (channel, message) {
      message = new Message().createFromString(message);

      if (
        message.channel == channel &&
        message.recipient == config.subscriberType
      ) {

        //the first thing we do is to remove the message id from the list so that no other service consumes it
        var result = await PubSubHelper.removeMessageIdFromTypeSet(
          message.channel,
          message.recipient,
          message.header.messageId);

        
        // Discard the message if it did not exist in the type set. (This means that the message has already been
        // consumed by another service of the same type)
        if (result) {
          return callback(null, message);
        }

      }
    });
  }

};