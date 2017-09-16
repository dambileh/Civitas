'use strict';

var Registration = require('../models/Registration');
var appUtil = require('../../libs/AppUtil');
var logging = require('../utilities/Logging');
var _ = require('lodash');
var subscriptionManager = require('../managers/SubscriptionManager');
var registrationChannels = require('../../PubSubChannels').Registration;
var TwilioAuthService = require('node-twilio-verify');

/**
 * The Registration Service module
 */
module.exports = {

    /**
     * Request registration
     *
     * @param {object} request - The request that was sent from the controller
     */
	requestRegistration: function requestRegistration(request) {
        Registration.findOne(
            {msisdn: request.msisdn},
            function requestRegistrationCallback(err, registration) {
                if (err) {
                    return subscriptionManager.emitInternalResponseEvent(
                        {
                            statusCode: 500,
                            body: err
                        },
                        registrationChannels.Internal.RequestRegistrationCompletedEvent
                    );
                }

				var high = 9999;
                var low = 1000;
                var code = Math.floor(Math.random() * (high - low + 1) + low);

                // check if there is already an existing registration code
                if (!appUtil.isNullOrUndefined(registration)) {
					var updatedProperties = {
						msisdn: request.msisdn,
						code: code
					};

					registration.update({_id: request.id}, updatedProperties, function userUpdateCallback(err) {
							if (err) {
								return subscriptionManager.emitInternalResponseEvent(
									{
										statusCode: 500,
										body: err
									},
									userChannels.Internal.UpdateCompletedEvent
								);
							}

							registration.msisdn = request.firstName;
							registration.code = code;
							registration.updatedAt = new Date();

							return subscriptionManager.emitInternalResponseEvent(
								{
									statusCode: 200,
									body: registration
								},
								registrationChannels.Internal.UpdateCompletedEvent
							);
						}
					);
                }

                request.code = code;
                var registrationEntity = new Registration(request);

                logging.logAction(
                    logging.logLevels.INFO,
                    'Attempting to create a new registration code for ' + request.msisdn
                );

                registrationEntity.save(
                    function userSaveCallback(err) {
                        if (err) {
                            return subscriptionManager.emitInternalResponseEvent(
                                {
                                    statusCode: 500,
                                    body: err
                                },
                                registrationChannels.Internal.CreateCompletedEvent
                            );

                        }

                        /*
                        Uncomment this when ready to test SMS

                        // Sending SMS to the subscriber
						var accountSid = "xxxxxxxx",
							authToken = "yyyyyyyyyy",
							fromNumber = '+1xxxxxxxxxx';

						var twilioAuthService = new TwilioAuthService();
						twilioAuthService.init(accountSid, authToken);
						twilioAuthService.setFromNumber(fromNumber);

                        var msgBody = 'Your Civitas registration code: ' + code;

						twilioAuthService.sendCode(request.msisdn, msgBody).then(function(results) {
							return subscriptionManager.emitInternalResponseEvent(
								{
									statusCode: 201,
									body: registrationEntity
								},
								registrationChannels.Internal.CreateCompletedEvent
							);
						}, function error(err) {
							return subscriptionManager.emitInternalResponseEvent(
								{
									statusCode: 500,
									body: err
								},
								registrationChannels.Internal.CreateCompletedEvent
							);
						});
						*/

                        // Remove below when above is uncommented
						return subscriptionManager.emitInternalResponseEvent(
							{
								statusCode: 201,
								body: registrationEntity
							},
							registrationChannels.Internal.CreateCompletedEvent
						);
                    }
                );
            }
        );
    }
};