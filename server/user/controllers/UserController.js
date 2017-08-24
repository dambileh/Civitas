'use strict';

var UserService = require('../services/UserService');
var SubscriptionManager = require('../managers/SubscriptionManager');
var UserChannels = require('../../PubSubChannels').User;

/**
 * Calls the corresponding service layer method to create a user
 */
SubscriptionManager.internalEmitter.on(UserChannels.Internal.CreateEvent, function(event){
  UserService.createUser(event);
});

/**
 * Calls the corresponding service layer method to get all users
 */
SubscriptionManager.internalEmitter.on(UserChannels.Internal.GetAllEvent, function(event){
  UserService.getAllUsers(event);
});

/**
 * Calls the corresponding service layer method to get a single user
 */
SubscriptionManager.internalEmitter.on(UserChannels.Internal.GetSingleEvent, function(event){
  UserService.getSingleUser(event);
});

/**
 * Calls the corresponding service layer method to delete a user
 */
SubscriptionManager.internalEmitter.on(UserChannels.Internal.DeleteEvent, function(event){
  UserService.deleteUser(event);
});

/**
 * Calls the corresponding service layer method to update a user
 */
SubscriptionManager.internalEmitter.on(UserChannels.Internal.UpdateEvent, function(event){
  UserService.updateUser(event);
});

