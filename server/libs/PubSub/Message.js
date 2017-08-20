'use strict';
var AppUtil = require('../AppUtil');

module.exports = function Message(channel, type, action, payload) {
  var that = this;

  this.channel = channel;
  this.type = type;
  this.action = action;
  this.payload = payload;
  this.validationErrors = [];

  this.create = function cast(object) {
    that.channel = object.channel;
    that.type = object.type;
    that.action = object.action;
    that.payload = object.payload;
    return that;
  };

  this.createFromString = function cast(string) {
    return that.create(JSON.parse(string));
  };
  
  this.tryValidate = function validate() {
    var errors = [];

    if (AppUtil.isNullOrUndefined(that.channel)) {
      errors.push("[channel] property is required");
    }

    if (AppUtil.isNullOrUndefined(that.type)) {
      errors.push("[type] property is required");
    }

    if (AppUtil.isNullOrUndefined(that.action)) {
      errors.push("[action] property is required");
    }

    if (AppUtil.isNullOrUndefined(that.payload)) {
      errors.push("[payload] property is required");
    } else if (typeof that.payload !== "object") {
      errors.push("The payload [" + that.payload + "] has to be an object. Found ["
        + (typeof that.payload) + "] instead");
    }
    
    that.validationErrors = errors;

    return (errors.length <= 0); 
  };
  
  this.getValidationErrors = function getValidationErrors() {
    return that.validationErrors;
  }
};
