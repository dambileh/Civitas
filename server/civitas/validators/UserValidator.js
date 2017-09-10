'use strict';

var validationChain = require('../../libs/ValidationChain');
var validationError = require('../../libs/error/ValidationError');
var errors = require('../../ErrorCodes');

module.exports = {
  newUserValidator: function alreadyExistValidator(user) {
    return !(user);
  },
  existingUserValidator: function existingUserValidator(user) {
    return (user);
  },
  addressNotEmptyValidator: function addressNotEmptyValidator(request) {
    return (request.addresses.length > 0);
  },
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
      .add(
        that.addressNotEmptyValidator,
        {
          parameters: [request],
          error: new validationError(
            'Some validation errors occurred.',
            [
              {
                code: errors.User.AT_LEAST_ONE_ADDRESS_MUST_BE_SET,
                message: `At least one address must be set for the user`,
                path: ['addresses']
              }
            ]
          )
        }
      )
      .validate({mode: validationChain.modes.EXIT_ON_ERROR});
  },
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