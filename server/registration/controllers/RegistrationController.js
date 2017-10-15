'use strict';

var registrationService = require('../services/RegistrationService');
var registrationChannels = require('../../PubSubChannels').Registration;
var internalEventEmitter = require('../../libs/InternalEventEmitter');

/**
 * Calls the corresponding service layer method to request registration
 */
internalEventEmitter.on(registrationChannels.Internal.RequestRegistrationEvent, function (event) {
    registrationService.requestRegistration(event);
});

/**
 * Calls the corresponding service layer method to request confirm registration
 */
internalEventEmitter.on(registrationChannels.Internal.ConfirmRegistrationEvent, function (event) {
  registrationService.confirmRegistration(event);
});

