'use strict';

var friendService = require('../services/FriendService');
var internalEventEmitter = require('../../libs/InternalEventEmitter');
var userChannels = require('../../PubSubChannels').User;

/**
 * Calls the corresponding service layer method to create a friend
 */
internalEventEmitter.on(userChannels.Internal.AddUserFriendsEvent, function(event){
  friendService.createFriend(event);
});

