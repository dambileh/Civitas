/**
 * Created by kevinfeng on 2017/08/26.
 */

'use strict';

var Logging = require('../utilities/Logging');
var PubSub = require('../../libs/PubSub/PubSubAdapter');
var Message = require('../../libs/PubSub/Message');
var constants = require('../../Constants');
var PubSubChannels = require('../../PubSubChannels');

/**
 * The Registration Service module
 */
module.exports = {

    confirmRegistration: function(args, response, next) {

        var regRequest = args.register.value;

        var request = new Message(
            PubSubChannels.Registration.External.CompletedEvent,
            constants.pub_sub.message_type.custom,
            constants.pub_sub.message_action.confirmRegistration,
            constants.pub_sub.recipients.registration,
            regRequest
        );

        PubSub
            .publish(request, PubSubChannels.Registration.External.Event)
            .subscribe(PubSubChannels.Registration.External.CompletedEvent, { unsubscribe: true },
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