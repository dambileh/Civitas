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
 * The User Service module
 */
module.exports = {

  /**
   * Creates users
   *
   * @param {object} request - The request that was sent from the controller
   */
  createUser: async function createUser(request) {
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

  /**
   * Returns all users
   *
   * @param {object} request - The request arguments passed in from the controller
   */
  getAllUsers: async function getAllUsers(request) {

    logging.logAction(
      logging.logLevels.INFO,
      'Attempting to retrieve all users'
    );

    let users = null;

    try {
      users = await User.find({}).populate('addresses').populate('friends');
    } catch (err) {
      return internalEventEmitter.emit(
        userChannels.Internal.GetAllCompletedEvent,
        {
          statusCode: 500,
          body: err
        }
      );
    }

    // If the array is empty we need to return a 204 response.
    if (appUtil.isArrayEmpty(users)) {
      return internalEventEmitter.emit(
        userChannels.Internal.GetAllCompletedEvent,
        {
          statusCode: 204,
          header: {
            resultCount: 0
          },
          body: {}
        }
      );
    } else {

      return internalEventEmitter.emit(
        userChannels.Internal.GetAllCompletedEvent,
        {
          statusCode: 200,
          header: {
            resultCount: users.length
          },
          body: users
        }
      );
    }
  },

  /**
   * Returns a single user
   *
   * @param {object} request - The request that was sent from the controller
   */
  getSingleUser: async function getSingleUser(request) {

    logging.logAction(
      logging.logLevels.INFO,
      'Attempting to get a single user'
    );

    let user = null;

    try {
      user = await User.findById(request.id).populate('addresses').populate('friends');

    } catch (err) {
      return internalEventEmitter.emit(
        userChannels.Internal.GetSingleCompletedEvent,
        {
          statusCode: 500,
          body: err
        }
      );
    }

    if (appUtil.isNullOrUndefined(user)) {

      var notFoundError = new resourceNotFoundError(
        'Resource not found.',
        `No user with id [${request.id}] was found`
      );

      return internalEventEmitter.emit(
        userChannels.Internal.GetSingleCompletedEvent,
        {
          statusCode: 404,
          body: notFoundError
        }
      );
    }

    return internalEventEmitter.emit(
      userChannels.Internal.GetSingleCompletedEvent,
      {
        statusCode: 200,
        body: user
      }
    );
  },

  /**
   * Deletes a user
   *
   * @param {object} request - The request arguments passed in from the controller
   */
  deleteUser: async function deleteUser(request) {

    let user = null;
    try {
      user = await User.findById(request.id);
    } catch (err) {
      return internalEventEmitter.emit(
        userChannels.Internal.DeleteCompletedEvent,
        {
          statusCode: 500,
          body: err
        }
      );
    }

    if (appUtil.isNullOrUndefined(user)) {
      var modelValidationError = new validationError(
        'Some validation errors occurred.',
        [
          {
            code: errors.User.USER_NOT_FOUND,
            message: `No user with id [${request.id}] was found.`,
            path: ['id']
          }
        ]
      );

      return internalEventEmitter.emit(
        userChannels.Internal.DeleteCompletedEvent,
        {
          statusCode: 400,
          body: modelValidationError
        }
      );
    }

    logging.logAction(
      logging.logLevels.INFO,
      'Attempting to remove a user'
    );

    try {
      await user.remove();
    } catch (err) {
      return internalEventEmitter.emit(
        userChannels.Internal.DeleteCompletedEvent,
        {
          statusCode: 500,
          body: err
        }
      );
    }

    return internalEventEmitter.emit(
      userChannels.Internal.DeleteCompletedEvent,
      {
        statusCode: 200,
        body: user
      }
    );
  },

  /**
   * Updates a user
   *
   * @param {object} request - The request arguments passed in from the controller
   */
  updateUser: async function updateUser(request) {

    let user = null;

    try {
      user = await User.findById(request.id);
    } catch (err) {
      return internalEventEmitter.emit(
        userChannels.Internal.UpdateCompletedEvent,
        {
          statusCode: 500,
          body: err
        }
      );
    }

    var validationResult = await userValidator.validateUpdate(user, request);

    if (validationResult) {
      return internalEventEmitter.emit(
        userChannels.Internal.CreateCompletedEvent,
        {
          statusCode: 400,
          body: validationresult
        }
      );
    }

    logging.logAction(
      logging.logLevels.INFO,
      `Attempting to update a user document with id [${user.id}]`
    );

    let userAddresses = null;

    // First update the address
    if (request.addresses) {

      try {
        userAddresses = await _updateUserAddress(user, request);
      } catch (error) {

        let statusCode = 0;

        if (error.status === 400) {
          statusCode = 400;
        } else {
          statusCode = 500;
        }

        return internalEventEmitter.emit(
          userChannels.Internal.UpdateCompletedEvent,
          {
            statusCode: statusCode,
            body: error
          }
        );
      }

      user.addresses = userAddresses.map((userAddress) => {
        return userAddress.id;
      });
    }

    if (request.firstName) {
      user.firstName = request.firstName;
    }

    if (request.lastName) {
      user.firstName = request.lastName;
    }

    if (request.email) {
      user.email = request.email;
    }
    
    try {
      await user.save();
    } catch (err) {
      return internalEventEmitter.emit(
        userChannels.Internal.UpdateCompletedEvent,
        {
          statusCode: 500,
          body: err
        }
      );
    }

    user.updatedAt = new Date();

    // set the address objects back on the display response
    user.addresses = userAddresses;
    return internalEventEmitter.emit(
      userChannels.Internal.UpdateCompletedEvent,
      {
        statusCode: 200,
        body: user
      }
    );
  }
};

function _updateUserAddress(user, request) {

  return new Promise(async function (resolve, reject) {
    // It is easier just to remove the existing addresses and insert the new ones

    // First create the new address records so we can return the validation errors
    let userAddresses = null;
    try {
      userAddresses = await addressManager.createAddresses(
        request.addresses,
        user.id,
        constants.address.ownerType.user
      );
    } catch (error) {
      return reject(error);
    }

    // Now remove the old address records
    if (user.addresses.length > 0) {
      try {

        await addressManager.removeAddresses(
          user.addresses
        );
      } catch (error) {

        // If there is an error removing the old addresses, the new addresses should be removed as well
        if (userAddresses.length > 0) {
          await addressManager.removeAddresses(
            userAddresses.map((address) => {
              return address.id;
            })
          );
        }
        return reject(error);
      }
    }

    return resolve(userAddresses);

  });
}