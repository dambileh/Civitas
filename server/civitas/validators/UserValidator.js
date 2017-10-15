'use strict';

var validationChain = require('../../libs/ValidationChain');
var validationError = require('../../libs/error/ValidationError');
var errors = require('../../ErrorCodes');

module.exports = {

  /**
   * New user validator
   *
   * @param {object} user - The user entity that will be validated
   *
   * @returns {boolean} - If the validation was successful
   */
  newUserValidator: function newUserValidator(user) {
    return !(user);
  },

  /**
   * Existing user validator
   *
   * @param {object} user - The user entity that will be validated
   *
   * @returns {boolean} - If the validation was successful
   */
  existingUserValidator: function existingUserValidator(user) {
    return (user ? true: false);
  },
  
  /**
   * Executes all user create validations
   *
   * @param {user} user - The existing user
   * @param {object} request - The new user entity that will be validated
   *
   * @returns {Object|null} - Validation error
   */
  validateCreate: async function validateCreate(user, request) {
    let that = this;
    
    return await new validationChain()
      .add(
        that.newUserValidator,
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
      .validate({mode: validationChain.modes.EXIT_ON_ERROR});
  },

  /**
   * Executes all user update validations
   *
   * @param {user} user - The existing user
   * @param {object} request - The new user entity that will be validated
   *
   * @returns {Object|null} - Validation error
   */
  validateUpdate: async function validateCreate(user, request) {
    let that = this;

    return await new validationChain()
      .add(
        that.existingUserValidator,
        {
          parameters: [user],
          error: new validationError(
            'Some validation errors occurred.',
            [
              {
                code: errors.User.USER_NOT_FOUND,
                message: `No user with id [${request.id}] was found.`,
                path: ['id']
              }
            ]
          )
        }
      )
      .validate({mode: validationChain.modes.EXIT_ON_ERROR});
  }
};