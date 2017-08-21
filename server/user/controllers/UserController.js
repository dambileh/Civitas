'use strict';

var UserService = require('../services/UserService');
var SubscriptionManager = require('../managers/SubscriptionManager');
var UserChannels = require('../../PubSubChannels').User;

/**
 * Calls the corresponding service layer method to get system status
 *
 * @param {ClientRequest} request - The http request object
 * @param {IncomingMessage} response - The http response object
 * @param {function} next The callback used to pass control to the next action/middleware
 *
 * @author Hadi Shayesteh <Hadishayesteh@gmail.com>
 * @since  14 Aug 2017
 */
SubscriptionManager.internalEmitter.on(UserChannels.Internal.CreateEvent, function(event){
  UserService.createUser(event);
});

