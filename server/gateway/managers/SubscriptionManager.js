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
    _gateway(topics);

  },
  internalEmitter: internalEmitter
};

function _gateway(topics) {
  console.log("Subscribing to [UserCompletedEvent]");

  var sub = redis.createClient();
  var pub = redis.createClient();

  var request = {
    "topic": "UserEvent",
    "type": "crud",
    "action": "create",
    "payload": {
      "someKey": "someValue"
    }
  };

  pub.publish("UserEvent", JSON.stringify(request));

  // sub.subscribe("UserEvent");
  sub.subscribe("UserCompletedEvent");

  sub.on('message', function(channel, message) {
    console.log("#### channel %s published %s", channel, message);
  });
}