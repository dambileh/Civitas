'use strict';

var Verification = require('../models/Verification');
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
  requestRegistration: async function requestRegistration(request) {

    let registration = null;

    try {
      registration = await Verification.findOne(
        {
          msisdn: request.msisdn
        }
      );

      var high = 9999;
      var low = 1000;
      var code = Math.floor(Math.random() * (high - low + 1) + low);

      // check if there is already an existing registration code
      if (!appUtil.isNullOrUndefined(registration)) {

        registration.code = code;

        await registration.save();

        registration.msisdn = request.msisdn;
        registration.code = code;
        registration.updatedAt = new Date();

        return subscriptionManager.emitInternalResponseEvent(
          {
            statusCode: 200,
            body: registration
          },
          registrationChannels.Internal.RequestRegistrationCompletedEvent
        );
      }

      request.code = code;

      var registrationEntity = new Verification(request);

      logging.logAction(
        logging.logLevels.INFO,
        'Attempting to create a new registration code for ' + request.msisdn
      );

      await registrationEntity.save();
      
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
       statusCode: 200,
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
          statusCode: 200,
          body: registrationEntity
        },
        registrationChannels.Internal.RequestRegistrationCompletedEvent
      );

    } catch (err) {
      return subscriptionManager.emitInternalResponseEvent(
        {
          statusCode: 500,
          body: err
        },
        registrationChannels.Internal.RequestRegistrationCompletedEvent
      );
    }

  }
};