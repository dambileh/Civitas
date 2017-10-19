'use strict';

var communityService = require('../services/CommunityService');
var internalEventEmitter = require('../../libs/InternalEventEmitter');
var communityChannels = require('../../PubSubChannels').Community;

/**
 * Calls the corresponding service layer method to create a community
 */
internalEventEmitter.on(communityChannels.Internal.CreateEvent, function(event){
  communityService.createCommunity(event);
});

/**
 * Calls the corresponding service layer method to get all communities
 */
internalEventEmitter.on(communityChannels.Internal.GetAllEvent, function(event){
  communityService.getAllCommunities(event);
});

/**
 * Calls the corresponding service layer method to get a single community
 */
internalEventEmitter.on(communityChannels.Internal.GetSingleEvent, function(event){
  communityService.getSingleCommunity(event);
});

/**
 * Calls the corresponding service layer method to delete a community
 */
internalEventEmitter.on(communityChannels.Internal.DeleteEvent, function(event){
  communityService.deleteCommunity(event);
});

/**
 * Calls the corresponding service layer method to update a community
 */
internalEventEmitter.on(communityChannels.Internal.UpdateEvent, function(event){
  communityService.updateCommunity(event);
});

