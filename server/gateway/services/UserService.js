'use strict';

var AppUtil = require('../../libs/AppUtil');
var Logging = require('../utilities/Logging');
var config = require('config');
var _ = require('lodash');
var PubSub = require('../../libs/PubSub/PubSubAdapter');
var Message = require('../../libs/PubSub/Message');
var constants = require('../../Constants');
var PubSubChannels = require('../../PubSubChannels');

/**
 * The User Service module
 */
module.exports = {
  
  /**
   * Creates a user
   *
   * @param {object} args - The request arguments passed in from the controller
   * @param {IncomingMessage} response - The http response object
   * @param {function} next - The callback used to pass control to the next action/middleware
   */
  createUser: function(args, response, next) {

    var userRequest = args.user.value;

    var request = new Message(
      PubSubChannels.User.External.Event,
      constants.pub_sub.message_type.crud,
      constants.pub_sub.message_action.create,
      userRequest
    );

    PubSub
      .publish(request, PubSubChannels.User.External.Event)
      .subscribe(PubSubChannels.User.External.CompletedEvent, { unsubscribe: true },
          function handleCompleted(err, completed) {
            if (err) {
              return next(err);
            }
            response.statusCode = completed.payload.statusCode;
            response.setHeader('Content-Type', 'application/json');
            return response.end(JSON.stringify(completed.payload.body));
          });
  }
};