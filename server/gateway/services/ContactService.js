'use strict';

var _ = require('lodash');
var pubSub = require('../../libs/PubSub/PubSubAdapter');
var message = require('../../libs/PubSub/Message');
var constants = require('../../Constants');
var pubSubChannels = require('../../PubSubChannels');

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
  createContact: function(args, response, next) {

    var contactPayload = args.contact.value;
    var userId = args.id.value;

    var payload = {
      "user-id": userId,
      "number": contactPayload.number
    };

    var request = new message(
      pubSubChannels.Contact.External.Event,
      constants.pub_sub.message_type.crud,
      constants.pub_sub.message_action.create,
      constants.pub_sub.recipients.user,
      payload
    );

    pubSub
      .publish(request, PubSubChannels.Contact.External.Event)
      .subscribe(PubSubChannels.Contact.External.CompletedEvent, { unsubscribe: true },
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