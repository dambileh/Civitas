'use strict';

const validationChain = require('../../libs/ValidationChain');
const validationError = require('../../libs/error/ValidationError');
const User = require('../models/User');
const errors = require('../../ErrorCodes');

module.exports = {

  /**
   * New user validator
   *
   * @param {object} request - The new user entity that will be validated
   *
   * @returns {Object|null} - Error
   */
  newUserValidator: async function newUserValidator(request) {

    let user = null;
    try {
      user = await User.findOne({msisdn: request.msisdn});
    } catch (err) {
      return err;
    }
    
    if(user) {
      return new validationError(
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
    
    return null;
  },

  /**
   * Existing user validator
   *
   * @param {object} user - The user entity that will be validated
   * @param {object} request - The new user entity that will be validated
   * 
   * @returns {Object|null} - Error
   */
  existingUserValidator: function existingUserValidator(user, request) {

    if (!user) {
      return new validationError(
        'Some validation errors occurred.',
        [
          {
            code: errors.User.USER_NOT_FOUND,
            message: `No user with id [${request.id}] was found.`,
            path: ['id']
          }
        ]
      );
    }
    
    return null;
  },
  
  /**
   * Executes all user create validations
   *
   * @param {object} request - The new user entity that will be validated
   *
   * @returns {Object|null} - Validation error
   */
  validateCreate: async function validateCreate(request) {
    let that = this;
    
    return await new validationChain()
      .add(
        that.newUserValidator,
        {
          parameters: [request],
          async: true
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
          parameters: [user, request]
        }
      )
      .validate({mode: validationChain.modes.EXIT_ON_ERROR});
  }
};