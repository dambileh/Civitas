'use strict';

var chatService = require('../services/ChatService');
var internalEventEmitter = require('../../libs/InternalEventEmitter');
var chatChannels = require('../../PubSubChannels').Chat;

/**
 * Calls the corresponding service layer method to create a chat
 */
internalEventEmitter.on(chatChannels.Internal.CreateEvent, function(event){
  chatService.createChat(event);
});

/**
 * Calls the corresponding service layer method to get all chats
 */
internalEventEmitter.on(chatChannels.Internal.GetAllEvent, function(event){
  chatService.getAllChats(event);
});

/**
 * Calls the corresponding service layer method to get a single chat
 */
internalEventEmitter.on(chatChannels.Internal.GetSingleEvent, function(event){
  chatService.getSingleChat(event);
});

/**
 * Calls the corresponding service layer method to delete a chat
 */
internalEventEmitter.on(chatChannels.Internal.DeleteEvent, function(event){
  chatService.deleteChat(event);
});

/**
 * Calls the corresponding service layer method to update a chat
 */
internalEventEmitter.on(chatChannels.Internal.UpdateEvent, function(event){
  chatService.updateChat(event);
});

