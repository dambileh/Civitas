'use strict';

var redis = require('redis');

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
  hashMap: {
    put: async function put(key, value) {
      let client = await _createClient();
      client.set(key, JSON.stringify(value));
    },
    get: async function get(key, callback) {
      let client = await _createClient();
      client.get(key, (err, value) => {
        callback(err, JSON.parse(value));
      });
    },
    remove: async function remove(key) {
      let client = await _createClient();
      client.del(key);
    },
    contains: async function contains(key, callback) {
      let client = await _createClient();
      client.get(key, (err, value) => {
        callback(err, value != null);
      });
    }
  }

};

function _createClient() {
  return new Promise(function(resolve, reject){
    var client = redis.createClient();
    client.on('error', function (err) {
      reject(err);
    });

    client.on('connect', function(){
      resolve(client);
    });
  });

}