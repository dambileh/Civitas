'use strict';

var User = require('../models/User');
var validationError = require('../../libs/error/ValidationError');
var resourceNotFoundError = require('../../libs/error/ResourceNotFoundError');
var appUtil = require('../../libs/AppUtil');
var validationChain = require('../../libs/ValidationChain');
var logging = require('../utilities/Logging');
var config = require('config');
var _ = require('lodash');
var subscriptionManager = require('../managers/SubscriptionManager');
var addressManager = require('../managers/AddressManager');
var userChannels = require('../../PubSubChannels').User;
var errors = require('../../ErrorCodes');
var constants = require('../../Constants');

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
    User.findOne(
      {msisdn: request.msisdn},
      async function userFindOneCallback(err, user) {
        if (err) {
          return subscriptionManager.emitInternalResponseEvent(
            {
              statusCode: 500,
              body: err
            },
            userChannels.Internal.CreateCompletedEvent
          );
        }

        var chain = new validationChain();

        var validationResult = await chain
          .add(
            _numberAlreadyExistValidator,
            {
              parameters: [user],
              error: new validationError(
                'Some validation errors occurred.',
                [
                  {
                    code: errors.User.NUMBER_ALREADY_EXISTS,
                    message: `A user with number [${request.msisdn}] already exists.`,
                    path: ['msisdn']
                  }
                ]
              )
            }
          )
          .validate({mode: 'exitOnError'});

        if (validationResult) {
          return subscriptionManager.emitInternalResponseEvent(
            {
              statusCode: 400,
              body: validationResult
            },
            userChannels.Internal.CreateCompletedEvent
          );
        }

        request.status = constants.user.status.inactive;

        var userEntity = null;

        try {
          await addressManager.createAddresses(request.addresses);
        } catch (error) {
          return subscriptionManager.emitInternalResponseEvent(
            {
              statusCode: 400,
              body: error
            },
            userChannels.Internal.CreateCompletedEvent
          );
        }

        request.addresses = [];

        try {
          userEntity = new User(request);
        } catch (error) {
          if (error.name === constants.global.error.strictMode) {
            return subscriptionManager.emitInternalResponseEvent(
              {
                statusCode: 400,
                body: error
              },
              userChannels.Internal.CreateCompletedEvent
            );
          }
        }

        logging.logAction(
          logging.logLevels.INFO,
          'Attempting to save a new user document'
        );

            return subscriptionManager.emitInternalResponseEvent(
              {
                statusCode: 201,
                body: userEntity
              },
              userChannels.Internal.CreateCompletedEvent);

        // userEntity.save(
        //   function userSaveCallback(err) {
        //     if (err) {
        //       return subscriptionManager.emitInternalResponseEvent(
        //         {
        //           statusCode: 500,
        //           body: err
        //         },
        //         userChannels.Internal.CreateCompletedEvent
        //       );
        //
        //     }
        //
        //     return subscriptionManager.emitInternalResponseEvent(
        //       {
        //         statusCode: 201,
        //         body: userEntity
        //       },
        //       userChannels.Internal.CreateCompletedEvent
        //     );
        //   }
        // );
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

    User.find(
      {},
      function userFindCallback(err, users) {
        if (err) {
          return subscriptionManager.emitInternalResponseEvent(
            {
              statusCode: 500,
              body: err
            },
            userChannels.Internal.GetAllCompletedEvent
          );
        }

        // If the array is empty we need to return a 204 response.
        if (appUtil.isArrayEmpty(users)) {
          return subscriptionManager.emitInternalResponseEvent(
            {
              statusCode: 204,
              header: {
                resultCount: 0
              },
              body: {}
            },
            userChannels.Internal.GetAllCompletedEvent
          );
        } else {
          return subscriptionManager.emitInternalResponseEvent(
            {
              statusCode: 200,
              header: {
                resultCount: users.length
              },
              body: users
            },
            userChannels.Internal.GetAllCompletedEvent
          );
        }
      }
    );
  },

  /**
   * Returns a single user
   *
   * @param {object} request - The request that was sent from the controller
   */
  getSingleUser: function getSingleUser(request) {

    logging.logAction(
      logging.logLevels.INFO,
      'Attempting to get a single user'
    );

    User.findById(request.id, function userFindOneCallback(err, user) {
        if (err) {
          return subscriptionManager.emitInternalResponseEvent(
            {
              statusCode: 500,
              body: err
            },
            userChannels.Internal.GetSingleCompletedEvent
          );
        }

        if (appUtil.isNullOrUndefined(user)) {

          var notFoundError = new resourceNotFoundError(
            'Resource not found.',
            `No user with id [${request.id}] was found`
          );

          return subscriptionManager.emitInternalResponseEvent(
            {
              statusCode: 404,
              body: notFoundError
            },
            userChannels.Internal.GetSingleCompletedEvent
          );
        }

        return subscriptionManager.emitInternalResponseEvent(
          {
            statusCode: 200,
            body: user
          },
          userChannels.Internal.GetSingleCompletedEvent
        );
      }
    );
  },

  /**
   * Deletes a user
   *
   * @param {object} request - The request arguments passed in from the controller
   */
  deleteUser: function deleteUser(request) {
    User.findById(request.id, function userFindOneCallback(err, user) {
        if (err) {
          return subscriptionManager.emitInternalResponseEvent(
            {
              statusCode: 500,
              body: err
            },
            userChannels.Internal.DeleteCompletedEvent
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

          return subscriptionManager.emitInternalResponseEvent(
            {
              statusCode: 400,
              body: modelValidationError
            },
            userChannels.Internal.DeleteCompletedEvent
          );
        }

        logging.logAction(
          logging.logLevels.INFO,
          'Attempting to remove a user'
        );

        user.remove(
          function noteRemoveCallback(err) {
            if (err) {
              return subscriptionManager.emitInternalResponseEvent(
                {
                  statusCode: 500,
                  body: err
                },
                userChannels.Internal.DeleteCompletedEvent
              );
            }

            return subscriptionManager.emitInternalResponseEvent(
              {
                statusCode: 200,
                body: user
              },
              userChannels.Internal.DeleteCompletedEvent
            );
          }
        );
      }
    );
  },

  /**
   * Updates a user
   *
   * @param {object} request - The request arguments passed in from the controller
   */
  updateUser: function updateUser(request) {

    User.findById(request.id, function userFindOneCallback(err, user) {
        if (err) {
          return subscriptionManager.emitInternalResponseEvent(
            {
              statusCode: 500,
              body: err
            },
            userChannels.Internal.UpdateCompletedEvent
          );
        }

        if (appUtil.isNullOrUndefined(user)) {
          var modelValidationError = new validationError(
            'Some validation errors occurred.',
            [
              {
                code: errors.User.USER_NOT_FOUND,
                message: `No user with id [${request.msisdn}] was found.`,
                path: ['id']
              }
            ]
          );

          return subscriptionManager.emitInternalResponseEvent(
            {
              statusCode: 400,
              body: modelValidationError
            },
            userChannels.Internal.UpdateCompletedEvent
          );
        }

        logging.logAction(
          logging.logLevels.INFO,
          'Attempting to update a note document'
        );

        // set the updated properties, mongoose does not behave correctly if you pass a model directly
        var updatedProperties = {
          firstName: request.firstName,
          lastName: request.lastName,
          email: request.email
        };

        user.update({_id: request.id}, updatedProperties, function userUpdateCallback(err) {
            if (err) {
              return subscriptionManager.emitInternalResponseEvent(
                {
                  statusCode: 500,
                  body: err
                },
                userChannels.Internal.UpdateCompletedEvent
              );
            }

            user.firstName = request.firstName;
            user.lastName = request.lastName;
            user.email = request.email;
            user.updatedAt = new Date();

            return subscriptionManager.emitInternalResponseEvent(
              {
                statusCode: 200,
                body: user
              },
              userChannels.Internal.UpdateCompletedEvent
            );
          }
        );
      }
    );
  }
};

let _numberAlreadyExistValidator = function (existingUser) {
  return (appUtil.isNullOrUndefined(existingUser))
};

