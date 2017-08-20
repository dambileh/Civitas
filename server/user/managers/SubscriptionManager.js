'use strict';

var logging = require('../utilities/Logging');
var AppUtil = require('../../libs/AppUtil');
var events = require('events');
var internalEmitter = new events.EventEmitter();
var PubSub = require('../../libs/PubSubAdapter');

module.exports = {
  initialize: function (channels) {
    if (AppUtil.isUndefined(channels)) {
      throw new Error("Subscription channels were not set");
    }
    _subscribeToChannel(channels.User);
  },
  internalEmitter: internalEmitter
};

function _subscribeToChannel(channel) {
  if (AppUtil.isUndefined(channel)) {
    throw new Error("[channel] is not set");
  }

  var handleMessage = function handleMessage(err, response) {
    if (err) {
      return;
    }

    var message = JSON.parse(response);

    if(!_tryValidateMessage(message, channel.External.Event)) {
      return;
    }

    logging.logAction(
      logging.logLevels.INFO,
      "Message [" + JSON.stringify(message) + "] was published on channel [" + channel.External.Event + "]"
    );

    if (message.channel == channel.External.Event) {
      switch (message.type) {
        case "crud":
          _emitCRUDEvents(message, channel, internalEmitter);
          break;
        default:
          logging.logAction(logging.logLevels.ERROR, "Type [%s] is not supported", message.type)
      }
    }

  };

  PubSub.subscribe(channel.External.Event, false, handleMessage);
}

function _tryValidateMessage(message, channel) {
  var errors = [];

  if (AppUtil.isUndefined(message)) {
    logging.logAction(
      logging.logLevels.ERROR,
      "The message [" + message + "] received from the channel [" + channel+ "] is null or undefined"
    );
    return false;
  }

  if (AppUtil.isUndefined(message.channel)) {
    errors.push("[channel] property is required");
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

function _emitCRUDEvents(message, channel, internalEmitter) {

  var handleCreateCompletedEvent = function(response) {
    PubSub.publish(channel.External.CompletedEvent, response);
    _removeAllCRUDListeners(channel, internalEmitter);
  };

  internalEmitter.on(channel.Internal.CreateCompletedEvent, handleCreateCompletedEvent);

  var handleUpdateCompletedEvent = function(response) {
    PubSub.publish(channel.External.CompletedEvent, response);
    _removeAllCRUDListeners(channel, internalEmitter);
  };

  internalEmitter.on(channel.Internal.UpdateCompletedEvent, handleUpdateCompletedEvent);

  var handleDeleteCompletedEvent = function(response) {
    PubSub.publish(channel.External.CompletedEvent, response);
    _removeAllCRUDListeners(channel, internalEmitter);
  };

  internalEmitter.on(channel.Internal.DeleteCompletedEvent, handleDeleteCompletedEvent);

  var handleGetSingleCompletedEvent = function(response) {
    PubSub.publish(channel.External.CompletedEvent, response);
    _removeAllCRUDListeners(channel, internalEmitter);
  };

  internalEmitter.on(channel.Internal.GetSingleCompletedEvent, handleGetSingleCompletedEvent);

  var handleGetAllCompletedEvent = function(response) {
    PubSub.publish(channel.External.CompletedEvent, response);
    _removeAllCRUDListeners(channel, internalEmitter);
  };

  internalEmitter.on(channel.Internal.GetAllCompletedEvent, handleGetAllCompletedEvent);

  switch (message.action) {
    case "create":
      internalEmitter.emit(channel.Internal.CreateEvent, message);
      break;
    case "update":
      internalEmitter.emit(channel.Internal.UpdateEvent, message);
      break;
    case "delete":
      internalEmitter.emit(channel.Internal.DeleteEvent, message);
      break;
    case "getSingle":
      internalEmitter.emit(channel.Internal.GetSingleEvent, message);
      break;
    case "getAll":
      internalEmitter.emit(channel.Internal.GetAllEvent, message);
      break;
    default:
      logging.logAction(logging.logLevels.ERROR, "Type [%s] is not supported", message.type)
  }
}

function _removeAllCRUDListeners(channel, internalEmitter) {
  internalEmitter.removeAllListeners(channel.Internal.CreateCompletedEvent);
  internalEmitter.removeAllListeners(channel.Internal.UpdateCompletedEvent);
  internalEmitter.removeAllListeners(channel.Internal.DeleteCompletedEvent);
  internalEmitter.removeAllListeners(channel.Internal.GetSingleCompletedEvent);
  internalEmitter.removeAllListeners(channel.Internal.GetAllCompletedEvent);
}