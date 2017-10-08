'use strict';

var messageService = require('../services/MessageService');
var internalEventEmitter = require('../../libs/InternalEventEmitter');
var messageChannels = require('../../PubSubChannels').MessageHub;

/**
 * Calls the corresponding service layer method to create a user
 */
internalEventEmitter.on(messageChannels.Internal.SendMessageEvent, function(event){
  messageService.sendMessage(event);
});
