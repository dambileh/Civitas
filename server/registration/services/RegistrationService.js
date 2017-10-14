'use strict';

var Verification = require('../models/Verification');
var appUtil = require('../../libs/AppUtil');
var logging = require('../utilities/Logging');
var internalEventEmitter = require('../../libs/InternalEventEmitter');
var _ = require('lodash');
var registrationChannels = require('../../PubSubChannels').Registration;
var TwilioAuthService = require('node-twilio-verify');
var Errors  = require("../../ErrorCodes");
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

        return internalEventEmitter.emit(
          registrationChannels.Internal.RequestRegistrationCompletedEvent,
          {
            statusCode: 200,
            body: registration
          }
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
       return internalEventEmitter.emit(
       registrationChannels.Internal.CreateCompletedEvent,
       {
       statusCode: 200,
       body: registrationEntity
       }
       );
       }, function error(err) {
       return internalEventEmitter.emit(
       registrationChannels.Internal.CreateCompletedEvent,
       {
       statusCode: 500,
       body: err
       }
       );
       });
       */

      // Remove below when above is uncommented
      return internalEventEmitter.emit(
        registrationChannels.Internal.RequestRegistrationCompletedEvent,
        {
          statusCode: 200,
          body: registrationEntity
        }
      );

    } catch (err) {
      return internalEventEmitter.emit(
        registrationChannels.Internal.RequestRegistrationCompletedEvent,
        {
          statusCode: 500,
          body: err
        }
      );
    }
  },

  /**
   * Confirm registration
   *
   * @param {object} request - The request that was sent from the controller
   */
  confirmRegistration: async function confirmRegistration(request) {

    let registration = null;

    try {
      registration = await Verification.findOne(
        {
          msisdn: request.msisdn
        }
      );

      // check if there is an existing registration code
      if (appUtil.isNullOrUndefined(registration)) {
        return internalEventEmitter.emit(
          registrationChannels.Internal.ConfirmRegistrationCompletedEvent,
          {
            statusCode: 400,
            body: '' // send empty?
          }
        );
      }

      // registration already confirmed previously
      if (registration.status == true) {

        logging.logAction(
          logging.logLevels.INFO,
          'Registration for ' + request.msisdn + ' already confirmed previously'
        );

        var modelValidationError = new ValidationError(
          'Registration already confirmed',
          [
            {
              code: Errors.Registration.ALREADY_CONFIRMED,
              message: `Registration has already been confirmed previously`,
              path: ['code']
            }
          ]
        );

        return SubscriptionManager.emitInternalResponseEvent(
          {
            statusCode: 400,
            body: modelValidationError
          },
          registrationChannels.Internal.ConfirmRegistrationCompletedEvent
        );
      }

      // check if code matches
      if (request.code == registration.code) {
        registration.status = true;
        registration.save();

        logging.logAction(
          logging.logLevels.INFO,
          'Registration for ' + request.msisdn + ' confirmed'
        );

        return internalEventEmitter.emit(
          registrationChannels.Internal.ConfirmRegistrationCompletedEvent,
          {
            statusCode: 200,
            body: {
              "msisdn" : request.msisdn,
              "code": request.code
            }
          }
        );
      } else {

        var modelValidationError = new ValidationError(
          'Registration confirmation code does not match',
          [
            {
              code: Errors.Registration.CODE_MISMATCH,
              message: `An incorrect confirmation code [${request.code}] received.`,
              path: ['code']
            }
          ]
        );

        return SubscriptionManager.emitInternalResponseEvent(
          {
            statusCode: 400,
            body: modelValidationError
          },
          registrationChannels.Internal.ConfirmRegistrationCompletedEvent
        );
      }
    } catch (err) {
      return internalEventEmitter.emit(
        registrationChannels.Internal.RequestRegistrationCompletedEvent,
        {
          statusCode: 500,
          body: err
        }
      );
    }
  }
};