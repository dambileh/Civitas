'use strict';

var redis = require('redis');
var MemStoreAdapter = require('../MemStore/MemStoreAdapter');
var AppUtil = require('../AppUtil');

/**
 * An instance of the service helper
 *
 * @author Hossein Shayesteh <hsh_85@yahoo.com>
 * @since  14 Aug 2017
 *
 * @module ServiceHelper
 */
module.exports = {

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

  registerChannelSubscribers: async function (channel, subscriberType, subscriberId) {
    let store = await MemStoreAdapter.keyValue.get(channel);
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
    await MemStoreAdapter.keyValue.put({}, channel, store);
  },

  unregisterChannelSubscribers: async function (channel, subscriberType, subscriberId) {
    let store = await MemStoreAdapter.keyValue.get(channel);

    if (store && store[subscriberType]) {
      store[subscriberType] = AppUtil.removeFromArray(
        store[subscriberType],
        subscriberId
      );
    }

    await MemStoreAdapter.keyValue.put({}, channel, store);
  },

  getSubscriberTypes: async function (channel) {
    let store = await MemStoreAdapter.keyValue.get(channel);
    let types = [];
    if (store) {
      types = Object.keys(store);
    }
    
    return types;
  },

  addMessageIdToTypeSet: async function (channel, type, messageId) {
    let storeName = `${channel}.${type}`;
    let storeValue = await MemStoreAdapter.keyValue.get(storeName);
    if (storeValue) {
      storeValue.push(messageId);
    }
    else {
      storeValue = [messageId];
    }
    await MemStoreAdapter.keyValue.put({}, storeName, storeValue);
  },

  removeMessageIdFromTypeSet: async function (channel, type, messageId) {
   return new Promise(async function(resolve, reject){
     let storeName = `${channel}.${type}`;
     let storeValue = await MemStoreAdapter.keyValue.get(storeName);
     if (storeValue && storeValue.includes(messageId)) {
       storeValue = AppUtil.removeFromArray(
         storeValue,
         messageId
       );
       let storeValueCheck = await MemStoreAdapter.keyValue.get(storeName);

       if (storeValueCheck && storeValueCheck.includes(messageId)) {
         await MemStoreAdapter.keyValue.put({}, storeName, storeValue);
         return resolve(1);
       }

     }
     resolve(0);
   });
  }
};