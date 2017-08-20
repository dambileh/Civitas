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
   * @param {string} channel - The channel to which the message will be published
   * @param {object} message - The message object that will be published to the given channel
   *
   * @returns {object} An instance of the adapter. Used to create a Fluent interface
   */
  publish: function publish(channel, message) {
    var pub = redis.createClient();

    // TODO: validate that the message to conforms to our message structure
    pub.publish(channel, message);
    return this;
  },

  /**
   * This will wait for a response to arrive at a given channel and will return that response to the client
   * 
   * @param {string} channel - The channel to wait on
   * @param {bool} unsubscribe - Whether the subscription to the channel should end
   * @param {function} callback - The function that will be called once a the wait is over
   *
   * @returns {object} An instance of the adapter. Used to create a Fluent interface
   */
  subscribe: function subscribe(channel, unsubscribe, callback) {
    var sub = redis.createClient();
    sub.subscribe(channel);
    return sub.on('message', function(channel, message) {
      message = JSON.parse(message);
      callback(null, message);
      if (unsubscribe) {
        sub.unsubscribe(channel);
      }
      return this;
    });
  }

};
