'use strict';

var logging = require('../libs//Logging');
var AppUtil = require('../libs/AppUtil');
var redis = require('redis');
var events = require('events');
var internalEmitter = new events.EventEmitter();

module.exports = {
  initialize: function (topics) {
    if (AppUtil.isUndefined(topics)) {
      throw new Error("Subscription topics were not set");
    }
    _subscribeToTopic(topics.User);

  },
  internalEmitter: internalEmitter
};

function _subscribeToTopic(topic) {
  if (AppUtil.isUndefined(topic)) {
    throw new Error("[topic] is required");
  }

  var sub = redis.createClient();
  var pub = redis.createClient();

  sub.subscribe(topic.External.Event);
  
  sub.on('message', function(channel, message) {
    
    message = JSON.parse(message);

    if(!_tryValidateMessage(message)) {
      return;
    }

    logging.logAction(
      logging.logLevels.INFO,
      "Message [" + JSON.stringify(message) + "] was published on channel [" + channel + "]"
    );

    internalEmitter.on(topic.Internal.CreateCompletedEvent, function(response) {
      pub.publish(topic.External.CompletedEvent, response);
    });

    internalEmitter.on(topic.Internal.UpdateCompletedEvent, function(response) {
      pub.publish(topic.External.CompletedEvent, response);
    });

    internalEmitter.on(topic.Internal.DeleteCompletedEvent, function(response) {
      pub.publish(topic.External.CompletedEvent, response);
    });

    internalEmitter.on(topic.Internal.GetSingleCompletedEvent, function(response) {
      pub.publish(topic.External.CompletedEvent, response);
    });

    internalEmitter.on(topic.Internal.GetAllCompletedEvent, function(response) {
      pub.publish(topic.External.CompletedEvent, response);
    });

    if (message.topic == topic.External.Event) {
      switch (message.type) {
        case "crud":
          switch (message.action) {
            case "create":
              internalEmitter.emit(topic.Internal.CreateEvent, message);
              break;
            case "update":
              internalEmitter.emit(topic.Internal.UpdateEvent, message);
              break;
            case "delete":
              internalEmitter.emit(topic.Internal.DeleteEvent, message);
              break;
            case "getSingle":
              internalEmitter.emit(topic.Internal.GetSingleEvent, message);
              break;
            case "getAll":
              internalEmitter.emit(topic.Internal.GetAllEvent, message);
              break;
            default:
              logging.logAction(logging.logLevels.ERROR, "Type [%s] is not supported", message.type)
          }
          break;
        default:
          logging.logAction(logging.logLevels.ERROR, "Type [%s] is not supported", message.type)
      }
    }

  });
}

function _tryValidateMessage(message) {
  var errors = [];

  if (AppUtil.isUndefined(message)) {
    logging.logAction(
      logging.logLevels.ERROR,
      "The message [" + message + "] received on channel [" + channel  + "] could not be parsed to JSON"
    );
    return false;
  }

  if (AppUtil.isUndefined(message.topic)) {
    errors.push("[topic] property is required");
  }

  if (AppUtil.isUndefined(message.type)) {
    errors.push("[type] property is required");
  }

  if (AppUtil.isUndefined(message.action)) {
    errors.push("[action] property is required");
  }

  if (AppUtil.isUndefined(message.payload)) {
    errors.push("[payload] property is required");
  } else {

    if (typeof message.payload !== "object") {
      errors.push("The payload [" + message.payload + "] has to be an object");
    }
  }

  if (errors.length > 0) {
    logging.logAction(
      logging.logLevels.ERROR,
      "The message failed the validation checks: [" + errors + "]"
    );
    return false;
  }

  return true;
}