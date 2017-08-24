'use strict';

var User = require('../models/User');
var ValidationError = require('../../libs/error/ValidationError');
var ResourceNotFoundError = require('../../libs/error/ResourceNotFoundError');
var AppUtil = require('../../libs/AppUtil');
var Logging = require('../utilities/Logging');
var config = require('config');
var _ = require('lodash');
var SubscriptionManager = require('../managers/SubscriptionManager');
var UserChannels = require('../../PubSubChannels').User;
var Errors = require('../../ErrorCodes');

/**
 * The User Service module
 */
module.exports = {

  /**
   * Creates users
   *
   * @param {object} request - The request that was sent from the controller
   */
  createUser: function (request) {
    // Make sure that the no other user with the same name exist already

    User.findOne(
      {cellnumber: request.cellnumber},
      function userFindOneCallback(err, user) {
        if (err) {
          return SubscriptionManager.emitInternalResponseEvent(
            {
              statusCode: 500,
              body: err
            },
            UserChannels.Internal.CreateCompletedEvent
          );
        }
        if (!AppUtil.isNullOrUndefined(user)) {
          var modelValidationError = new ValidationError(
            'Some validation errors occurred.',
            [
              {
                code: Errors.UserService.NUMBER_ALREADY_EXISTS,
                message: 'A user with number [' + request.cellnumber + '] already exists.',
                path: ['cellnumber']
              }
            ]
          );

          return SubscriptionManager.emitInternalResponseEvent(
            {
              statusCode: 400,
              body: modelValidationError
            },
            UserChannels.Internal.CreateCompletedEvent
          );
        }

        request.status = 'inactive';

        var userEntity = new User(request);

        Logging.logAction(
          Logging.logLevels.INFO,
          'Attempting to save a new user document'
        );

        userEntity.save(
          function userSaveCallback(err) {
            if (err) {
              var statusCode = 500;

              if (err.name != null && err.name == 'ValidationError') {
                statusCode = 400;
              }

              return SubscriptionManager.emitInternalResponseEvent(
                {
                  statusCode: statusCode,
                  body: err
                },
                UserChannels.Internal.CreateCompletedEvent
              );

            }

            return SubscriptionManager.emitInternalResponseEvent(
              {
                statusCode: 201,
                body: userEntity
              },
              UserChannels.Internal.CreateCompletedEvent
            );
          }
        );
      }
    );
  },

  /**
   * Returns all users
   *
   * @param {object} request - The request arguments passed in from the controller
   */
  getAllUsers: function (request) {

    Logging.logAction(
      Logging.logLevels.INFO,
      'Attempting to retrieve all users'
    );

    User.find(
      {},
      function userFindCallback(err, users) {
        if (err) {
          return SubscriptionManager.emitInternalResponseEvent(
            {
              statusCode: 500,
              body: err
            },
            UserChannels.Internal.GetAllCompletedEvent
          );
        }

        // If the array is empty we need to return a 204 response.
        if (AppUtil.isArrayEmpty(users)) {
          return SubscriptionManager.emitInternalResponseEvent(
            {
              statusCode: 204,
              header: {
                resultCount: 0
              },
              body: {}
            },
            UserChannels.Internal.GetAllCompletedEvent
          );
        } else {
          return SubscriptionManager.emitInternalResponseEvent(
            {
              statusCode: 200,
              header: {
                resultCount: users.length
              },
              body: users
            },
            UserChannels.Internal.GetAllCompletedEvent
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
  getSingleUser: function (request) {

    Logging.logAction(
      Logging.logLevels.INFO,
      'Attempting to get a single user'
    );

    User.findById(request.id, function userFindOneCallback(err, user) {
        if (err) {
          return SubscriptionManager.emitInternalResponseEvent(
            {
              statusCode: 500,
              body: err
            },
            UserChannels.Internal.GetSingleCompletedEvent
          );
        }

        if (AppUtil.isNullOrUndefined(user)) {

          var notFoundError = new ResourceNotFoundError(
            'Resource not found.',
            'No user with id [' + request.id + '] was found'
          );

          return SubscriptionManager.emitInternalResponseEvent(
            {
              statusCode: 404,
              body: notFoundError
            },
            UserChannels.Internal.GetSingleCompletedEvent
          );
        }

        return SubscriptionManager.emitInternalResponseEvent(
          {
            statusCode: 200,
            body: user
          },
          UserChannels.Internal.GetSingleCompletedEvent
        );
      }
    );
  },

  /**
   * Deletes a user
   *
   * @param {object} request - The request arguments passed in from the controller
   */
  deleteUser: function (request) {
    User.findById(request.id, function userFindOneCallback(err, user) {
        if (err) {
          return SubscriptionManager.emitInternalResponseEvent(
            {
              statusCode: 500,
              body: err
            },
            UserChannels.Internal.DeleteCompletedEvent
          );
        }

        if (AppUtil.isNullOrUndefined(user)) {
          var modelValidationError = new ValidationError(
            'Some validation errors occurred.',
            [
              {
                code: Errors.UserService.USER_NOT_FOUND,
                message: 'No user with id [' + request.cellnumber + '] was found.',
                path: ['id']
              }
            ]
          );

          return SubscriptionManager.emitInternalResponseEvent(
            {
              statusCode: 400,
              body: modelValidationError
            },
            UserChannels.Internal.DeleteCompletedEvent
          );
        }

        Logging.logAction(
          Logging.logLevels.INFO,
          'Attempting to remove a user'
        );

        user.remove(
          function noteRemoveCallback(err) {
            if (err) {
              return SubscriptionManager.emitInternalResponseEvent(
                {
                  statusCode: 500,
                  body: err
                },
                UserChannels.Internal.DeleteCompletedEvent
              );
            }

            return SubscriptionManager.emitInternalResponseEvent(
              {
                statusCode: 200,
                body: user
              },
              UserChannels.Internal.DeleteCompletedEvent
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
  updateUser: function (request) {

    User.findById(request.id, function userFindOneCallback(err, user) {
        if (err) {
          return SubscriptionManager.emitInternalResponseEvent(
            {
              statusCode: 500,
              body: err
            },
            UserChannels.Internal.UpdateCompletedEvent
          );
        }

        if (AppUtil.isNullOrUndefined(user)) {
          var modelValidationError = new ValidationError(
            'Some validation errors occurred.',
            [
              {
                code: Errors.UserService.USER_NOT_FOUND,
                message: 'No user with id [' + request.cellnumber + '] was found.',
                path: ['id']
              }
            ]
          );

          return SubscriptionManager.emitInternalResponseEvent(
            {
              statusCode: 400,
              body: modelValidationError
            },
            UserChannels.Internal.UpdateCompletedEvent
          );
        }

        Logging.logAction(
          Logging.logLevels.INFO,
          'Attempting to update a note document'
        );

        // set the updated properties, mongoose does not behave correctly if you pass a model directly
        var updatedProperties = {
          firstname: request.firstname,
          lastname: request.lastname,
          email: request.email
        };

        User.update({_id: request.id}, updatedProperties, function userUpdateCallback(err) {
            if (err) {
              return SubscriptionManager.emitInternalResponseEvent(
                {
                  statusCode: 500,
                  body: err
                },
                UserChannels.Internal.UpdateCompletedEvent
              );
            }

            user.firstname = request.firstname;
            user.lastname = request.lastname;
            user.email = request.email;
            user.updatedAt = Date.Now;

            return SubscriptionManager.emitInternalResponseEvent(
              {
                statusCode: 200,
                body: user
              },
              UserChannels.Internal.UpdateCompletedEvent
            );
          }
        );
      }
    );
  }
};