'use strict';

var redis = require('redis');
var memStoreAdapter = require('../MemStore/MemStoreAdapter');
var appUtil = require('../AppUtil');

/**
 * An instance of the Pub Sub Helper
 *
 * @module PubSubHelper
 */
module.exports = {

  /**
   * Creates and instance of the redis client
   * 
   * @returns {Promise}
   */
  createClient: function createClient() {
    return new Promise(function (resolve, reject) {
      var client = redis.createClient();
      client.on('error', function (err) {
        reject(err);
      });

      client.on('connect', function () {
        resolve(client);
      });
    });

  },

  /**
   * Registers the passed in subscriber on to the list of subscribers for a given channel and type
   * 
   * @param {string} channel - The channel on which the subscriber will be registered  
   * @param {string} subscriberType - The type of the subscriber
   * @param {string} subscriberId - The id of the subscriber
   */
  registerChannelSubscribers: async function (channel, subscriberType, subscriberId) {
    let store = await memStoreAdapter.keyValue.get(channel);
    if (store) {
      if (store[subscriberType]) {
        store[subscriberType].push(subscriberId);
      } else {
        store[subscriberType] = [subscriberId];
      }
    }
    else {
      store = {};
      store[subscriberType] = [subscriberId];
    }
    await memStoreAdapter.keyValue.put({}, channel, store);
  },

  /**
   * Removed a subscriber from the list of subscribers for a given channel
   *
   * @param {string} channel - The channel from which the subscriber will be unregistered
   * @param {string} subscriberType - The type of the subscriber
   * @param {string} subscriberId - The id of the subscriber
   */
  unregisterChannelSubscribers: async function (channel, subscriberType, subscriberId) {
    let store = await memStoreAdapter.keyValue.get(channel);

    if (store && store[subscriberType]) {
      store[subscriberType] = appUtil.removeFromArray(
        store[subscriberType],
        subscriberId
      );
    }

    await memStoreAdapter.keyValue.put({}, channel, store);
  },

  /**
   * Returns the various subscriber types associated with a channel
   * 
   * @param {string} channel - The channel whose types will be returned
   * 
   * @returns {Array} The array of subscriber types
   */
  getSubscriberTypes: async function (channel) {
    let store = await memStoreAdapter.keyValue.get(channel);
    let types = [];
    if (store) {
      types = Object.keys(store);
    }

    return types;
  },

  /**
   * Adds the passed in message id to the set of messages for a given subscriber type of a channel
   * 
   * @param {string} channel - The channel to which the subscriber is associated with
   * @param {string} type - The type of the subscriber
   * @param {string} messageId - The message id that will be added to the set
   */
  addMessageIdToTypeSet: async function (channel, type, messageId) {
    let storeName = `${channel}.${type}`;
    let storeValue = await memStoreAdapter.keyValue.get(storeName);
    if (storeValue) {
      storeValue.push(messageId);
    }
    else {
      storeValue = [messageId];
    }
    await memStoreAdapter.keyValue.put({}, storeName, storeValue);
  },

  /**
   * Removed the passed in message id from the set of messages for a given subscriber type of a channel
   *
   * @param {string} channel - The channel to which the subscriber is associated with
   * @param {string} type - The type of the subscriber
   * @param {string} messageId - The message id that will be removed from the set
   * 
   * @returns {Promise}
   */
  removeMessageIdFromTypeSet: async function (channel, type, messageId) {
   return new Promise(async function(resolve, reject){
     let storeName = `${channel}.${type}`;
     let storeValue = await memStoreAdapter.keyValue.get(storeName);
     if (storeValue && storeValue.includes(messageId)) {
       storeValue = appUtil.removeFromArray(
         storeValue,
         messageId
       );
       let storeValueCheck = await memStoreAdapter.keyValue.get(storeName);

       if (storeValueCheck && storeValueCheck.includes(messageId)) {
         await memStoreAdapter.keyValue.put({}, storeName, storeValue);
         return resolve(1);
       }

     }
     resolve(0);
   });
  }
};