'use strict';

var redis = require('redis');
var Message = require('./Message');
var pubSubHelper = require('./PubSubHelper');

/**
 * An instance of the Pub Sub Adapter
 *
 * @module PubSubAdapter
 */
module.exports = {

  /**
   * This will publish a message to a given channel
   *
   * @param {object} message - The message object that will be published to the given channel
   * @param {string} channel - The channel to which the message will be published
   * @param {object} option - The object containing publisher options
   *
   * @returns {object} An instance of the adapter. Used to create a Fluent interface
   */
  publish: async function publish(message, channel, option) {

    // //TODO retry and then persist a message if there was any error during publish
    let client = await pubSubHelper.createClient();
    if (!message.tryValidate()) {
      throw new Error(`[Message] did not pass the validation checks: [${message.getValidationErrors()}]`);
    }

    let subscriberTypes = await pubSubHelper.getSubscriberTypes(channel);

    for (let type of subscriberTypes) {
      // Foreach type, first push the messageId to their list
      await pubSubHelper.addMessageIdToTypeSet(channel, type, message.header.messageId);
      message.header.sentAt = new Date();
      message.recipient = type;
      client.publish(channel, JSON.stringify(message));
    }

    client.quit();
  },

  /**
   * This will publish a message and waits for a response to arrive at a given channel and will return that response 
   * to the client
   *
   * @param {string} channel - The channel to publish the message to
   * @param {string} responseChannel - The channel to wait on
   * @param {object} option - The object containing publisher options
   * @param {object} message - The function that will be called once a the wait is over
   *
   * @returns {object} An instance of the adapter. Used to create a Fluent interface
   */
  publishAndWaitForResponse: async function publishAndWaitForResponse(channel, responseChannel, option, message) {
    // //TODO retry and then persist a message if there was any error during publish
    
    return new Promise(async function (resolve, reject) {
      let pub = await pubSubHelper.createClient();
      if (!message.tryValidate()) {
        throw new Error(`[Message] did not pass the validation checks: [${message.getValidationErrors()}]`);
      }

      let subscriberTypes = await pubSubHelper.getSubscriberTypes(channel);

      for (let type of subscriberTypes) {
        // Foreach type, first push the messageId to their list
        await pubSubHelper.addMessageIdToTypeSet(channel, type, message.header.messageId);
        message.header.sentAt = new Date();
        message.recipient = type;
        // Then publish the message
        pub.publish(channel, JSON.stringify(message));
      }
      pub.publish(channel, JSON.stringify(message));
      pub.quit();

      if (!option.subscriberType) {
        throw new Error('[subscriberType] was not set on the option');
      }

      let sub = await pubSubHelper.createClient();
      sub.subscribe(responseChannel);

      sub.on('subscribe', async function (channel, count) {
        await pubSubHelper.registerChannelSubscribers(channel, option.subscriberType, option.subscriberId)
      });

      sub.on('message', async function (channel, response) {
        response = new Message().createFromString(response);

        if (
          response.channel == channel &&
          response.recipient == option.subscriberType &&
          response.header.messageId == message.header.messageId
        ) {

          // Remove the message id from the list so that no other service consumes it
          var result = await pubSubHelper.removeMessageIdFromTypeSet(
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
   * @param {object} option - The object containing subscribers options
   * @param {function} callback - The function that will be called once a the wait is over
   *
   * @returns {object} An instance of the adapter. Used to create a Fluent interface
   */
  subscribe: async function subscribe(channel, option, callback) {
    // Check that the subscriberType and subscriberId are set
    if (!option.subscriberType || !option.subscriberId) {
      throw new Error('[subscriberType] or [subscriberId] was not set on the config');
    }

    let sub = await pubSubHelper.createClient();
    sub.subscribe(channel);
    sub.on('subscribe', async function (channel, count) {
     await pubSubHelper.registerChannelSubscribers(channel, option.subscriberType, option.subscriberId)
    });

    sub.on('message', async function (channel, message) {
      message = new Message().createFromString(message);

      if (
        message.channel == channel &&
        message.recipient == option.subscriberType
      ) {

        //the first thing we do is to remove the message id from the list so that no other service consumes it
        var result = await pubSubHelper.removeMessageIdFromTypeSet(
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