'use strict';

var events = require('events');
var internalEmitter = new events.EventEmitter();

module.exports = {

  /**
   * Registers an event listener
   *
   * @param {string} event - The event to subscribe to
   * @param {function} callback - The event listener
   */
  on: function on (event, callback) {
    internalEmitter.on(event, callback);
  },

  /**
   * Published an event
   *
   * @param {string} event - The name of the event to publish
   * @param {object} message - The message that will be injected to the listeners
   */
  emit: function emit (event, message) {
    internalEmitter.emit(event, message);
  },

  /**
   * Removes listeners that are attached to the passed in event
   *
   * @param {string} event - The name of the event whose listeners will be removed
   */
  removeAllListeners: function removeAllListeners (event) {
    internalEmitter.removeAllListeners(event);
  }
};
