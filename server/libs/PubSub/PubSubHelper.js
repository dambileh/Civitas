'use strict';

var redis = require('redis');
var memStoreAdapter = require('../MemStore/MemStoreAdapter');
var appUtil = require('../AppUtil');
var pubSubChannels = require('../../PubSubChannels');

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
   */
  registerChannelSubscribers: async function (channel, subscriberType) {
    let store = await memStoreAdapter.keyValue.get(channel);
    if (store) {
      if (store[subscriberType]) {
        store[subscriberType].push(process.pid);
      } else {
        store[subscriberType] = [process.pid];
      }
    }
    else {
      store = {};
      store[subscriberType] = [process.pid];
    }
    await memStoreAdapter.keyValue.put({}, channel, store);
  },

  /**
   * Removes a subscriber from the list of subscribers for a given channel
   *
   * @param {string} channel - The channel from which the subscriber will be unregistered
   * @param {string} subscriberType - The type of the subscriber
   * @param {string} subscriberId - The id of the subscriber
   */
  unregisterSubscriberFromAllChannels: async function (subscriberId) {
    return new Promise(async (resolve, reject) => {
      let allChannelKeys = Object.keys(pubSubChannels);

      try {

        let store = await memStoreAdapter.keyValue.get('UserEvent');
        console.log(`store`, store);
      } catch(err) {

        console.log(`error`, err);
      }


      allChannelKeys.forEach(async key => {
        let channel = pubSubChannels[key];

        let allChannelEventKeys = Object.keys(channel.External);

        allChannelEventKeys.forEach(async eventKey => {


          console.log(`channel [${channel.External[eventKey]}]`);

          // let store = await memStoreAdapter.keyValue.get(channel.External[eventKey]);
          let store = await memStoreAdapter.keyValue.get('UserEvent');

          console.log(`store`, store);

        });

      });

      resolve(null);
    });
    



    //
    // if (store && store[subscriberType]) {
    //   store[subscriberType] = appUtil.removeFromArray(
    //     store[subscriberType],
    //     subscriberId
    //   );
    // }
    //
    // await memStoreAdapter.keyValue.put({}, channel, store);
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
    return (store) ? Object.keys(store) : [];
  },

  /**
   * Returns the subscribers of a certain channel + subscriber type combination
   * 
   * @param {string} channel - The channel whose subscribers will be returned
   * @param {string} subscriberType - The subscriber type of the channel
   * 
   * @returns {Array} The array of subscriber types
   */
  getChannelSubscribersForType: async function (channel, subscriberType) {
    let store = await memStoreAdapter.keyValue.get(channel);
    return (store[subscriberType]) ? store[subscriberType] : [];
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