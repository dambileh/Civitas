'use strict';

var redis = require('redis');
var Message = require('./Message');

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

    //TODO retry and then persist a message if there was any error during poublish
    let client = await _createClient();
      if (!message.tryValidate()) {
        throw new Error("[Message] did not pass the validation checks: [" + message.getValidationErrors() + "]");
      }
      client.publish(channel, JSON.stringify(message));
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
    let sub = await _createClient();
    sub.subscribe(channel);
    sub.on('message', function(channel, message) {
      message = new Message().createFromString(message);
      callback(null, message);
      if (config.unsubscribe) {
        sub.unsubscribe(channel);
      }
    });
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