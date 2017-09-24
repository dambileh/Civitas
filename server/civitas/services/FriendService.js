'use strict';

var User = require('../models/User');

var resourceNotFoundError = require('../../libs/error/ResourceNotFoundError');
var appUtil = require('../../libs/AppUtil');
var logging = require('../utilities/Logging');
var config = require('config');
var _ = require('lodash');
var internalEventEmitter = require('../../libs/InternalEventEmitter');
var addressManager = require('../managers/AddressManager');
var userChannels = require('../../PubSubChannels').User;
var errors = require('../../ErrorCodes');
var constants = require('../../Constants');
var Address = require('../models/Address');
var userValidator = require('../validators/UserValidator');

/**
 * The Friend Service module
 */
module.exports = {

  /**
   * Creates users
   *
   * @param {object} request - The request that was sent from the controller
   */
  createFriend: async function createUser(request) {
    let user = null;
    try {
      user = await User.findOne({msisdn: request.msisdn});
    } catch (err) {
      return internalEventEmitter.emit(
        userChannels.Internal.CreateCompletedEvent,
        {
          statusCode: 500,
          body: err
        }
      );
    }

    var validationResult = await userValidator.validateCreate(user, request);

    if (validationResult) {
      return internalEventEmitter.emit(
        userChannels.Internal.CreateCompletedEvent,
        {
          statusCode: 400,
          body: validationResult
        }
      );
    }

    request.status = constants.user.status.inactive;

    // get address from the request and unset it so that we can create the User model
    // Otherwise it will fail the Array of Ids schema validation
    let requestAddresses = request.addresses;

    request.addresses = [];

    let userEntity = null;

    try {
      userEntity = new User(request);
    } catch (error) {
      return internalEventEmitter.emit(
        userChannels.Internal.CreateCompletedEvent,
        {
          statusCode: 500,
          body: error
        }
      );
    }

    logging.logAction(
      logging.logLevels.INFO,
      'Attempting to save a new user document'
    );

    await userEntity.save();

    let userAddresses = null;

    try {
      userAddresses = await addressManager.createAddresses(
        requestAddresses,
        userEntity.id,
        constants.address.ownerType.user
      );
    } catch (error) {

      let statusCode = 0;

      if (error.status === 400) {
        statusCode = 400;
      } else {
        statusCode = 500;
      }

      // If there is an error creating the address, we should remove the user record as well
      await userEntity.remove();

      return internalEventEmitter.emit(
        userChannels.Internal.CreateCompletedEvent,
        {
          statusCode: statusCode,
          body: error
        }
      );
    }

    // Now that we have created the addresses, we should set them on the user record
    // We only save the ids
    userEntity.addresses = userAddresses.map((userAddress) => {
      return userAddress.id;
    });

    await userEntity.save();

    // Set the address objects back on for display
    userEntity.addresses = userAddresses;

    return internalEventEmitter.emit(
      userChannels.Internal.CreateCompletedEvent,
      {
        statusCode: 201,
        body: userEntity
      }
    );
  },

};