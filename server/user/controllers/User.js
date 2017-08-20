'use strict';

var url = require('url');
var UserService = require('../services/UserService');
var SubscriptionManager = require('../managers/SubscriptionManager');

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
SubscriptionManager.internalEmitter.on("UserCreateEvent", function(event){
  console.log(
    "### handled the event in service: ",
    event
  );

  var response = {
    statusCode: 200,
    body: {
      status: "successful"
    }
  };

  SubscriptionManager.internalEmitter.emit(
    "UserCreateCompletedEvent",
    JSON.stringify(response)
  );
});

