'use strict';

var logging = require('../utilities/Logging');
var AppUtil = require('../../libs/AppUtil');
var events = require('events');
var internalEmitter = new events.EventEmitter();
var PubSub = require('../../libs/PubSub/PubSubAdapter');
var SubscriptionHelper = require('../../libs/PubSub/SubscriptionHelper');
var UserChannels = require('../../PubSubChannels').User;
var constants = require('../../Constants');

module.exports = {
  initialize: function () {

    if (AppUtil.isNullOrUndefined(UserChannels)) {
      throw new Error("[channel] is not set");
    }

    var handleMessage = function handleMessage(err, message) {
      if (err) {
        return;
      }

      if(!message.tryValidate()) {
        return;
      }

      logging.logAction(
        logging.logLevels.INFO,
        "Message [" + JSON.stringify(message) + "] was published on channel [" + UserChannels.External.Event + "]"
      );

      if (message.channel == UserChannels.External.Event) {
        switch (message.type) {
          case "crud":
            SubscriptionHelper.emitCRUDEvents(message, UserChannels, internalEmitter);
            break;
          default:
            logging.logAction(logging.logLevels.ERROR, "Type [%s] is not supported", message.type)
        }
      }

    };

    PubSub.subscribe(UserChannels.External.Event, { unsubscribe: false }, handleMessage);
  },
  internalEmitter: internalEmitter
};