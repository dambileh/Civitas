'use strict';

var appUtil = require('../AppUtil');
const uuidV1 = require('uuid/v1');

module.exports = function Message(channel, type, action, payload, id = uuidV1()) {
  var that = this;

  this.header = {
    messageId: id
  };
  
  this.channel = channel;
  this.type = type;
  this.action = action;
  this.payload = payload;
  this.validationErrors = [];

  /**
   * Creates a message object and populates its properties using the passed in object
   *
   * @param object - An object that will be used to populate the message object
   *
   * @returns {module} An instance of the message object
   */
  this.create = function create(object) {
    this.header = object.header;
    that.channel = object.channel;
    that.type = object.type;
    that.action = object.action;
    that.payload = object.payload;
    that.recipient = object.recipient;
    return that;
  };

  /**
   * Creates a message object and populates its properties using the passed in object string
   *
   * @param string - The object string that is used to populate the message
   */
  this.createFromString = function createFromString(string) {
    return that.create(JSON.parse(string));
  };

  /**
   * Validates the message object properties
   *
   * @returns {boolean} - True if thee are no validation errors, otherwise False
   */
  this.tryValidate = function tryValidate() {
    var errors = [];

    if (appUtil.isNullOrUndefined(that.channel)) {
      errors.push('[channel] property is required');
    }

    if (appUtil.isNullOrUndefined(that.type)) {
      errors.push('[type] property is required');
    }

    if (appUtil.isNullOrUndefined(that.action)) {
      errors.push('[action] property is required');
    }

    if (appUtil.isNullOrUndefined(that.header)) {
      errors.push('[header] property is required');
    } else if (appUtil.isNullOrUndefined(that.header.messageId)) {
      errors.push('[header.messageId] property is required');
    }

    if (appUtil.isNullOrUndefined(that.payload)) {
      errors.push('[payload] property is required');
    } else if (!appUtil.isObject(that.payload)) {
      errors.push(
        `The payload [${that.payload}] has to be an object. Found [${(typeof that.payload)}] instead`
      );
    }

    that.validationErrors = errors;

    return (errors.length <= 0); 
  };

  /**
   * Return the array of validation errors
   *
   * @returns {Array} The array of validation errors
   */
  this.getValidationErrors = function getValidationErrors() {
    return that.validationErrors;
  }
};
