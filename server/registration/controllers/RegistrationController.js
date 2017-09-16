'use strict';

var registrationService = require('../services/RegistrationService');
var subscriptionManager = require('../managers/SubscriptionManager');
var registrationChannels = require('../../PubSubChannels').Registration;

/**
 * Calls the corresponding service layer method to request registration
 */
subscriptionManager.internalEmitter.on(registrationChannels.Internal.RequestRegistrationEvent, function (event) {
    registrationService.requestRegistration(event);
});

