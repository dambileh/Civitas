'use strict';

var validationChain = require('../../libs/ValidationChain');
var validationError = require('../../libs/error/ValidationError');
var authorizationError = require('../../libs/error/AuthorizationError');
var errors = require('../../ErrorCodes');

module.exports = {

  /**
   * Validates that the owner is of allowed type
   *
   * @param {Object} owner - The owner that will be validated
   * @param {Array} allowedTypes - The array of allowed types
   *
   * @returns {boolean} - If the validation was successful
   */
  typeAllowedValidator: function typeAllowedValidator(owner, allowedTypes) {
    return allowedTypes.includes(owner.kind);
  },

  /**
   * Validates that the owner exists
   *
   * @param {Object} owner - The owner that will be validated
   *
   * @returns {boolean} - If the validation was successful
   */
  ownerExistsValidator: async function ownerExistsValidator(owner) {
    let ownerModel = _ownerFactory(owner.kind);
    let existingOwner = await ownerModel.findById(owner.item);
    return ((existingOwner) ? true : false);
  },

  /**
   * Validates that the requesting owner has access to the entity
   *
   * @param {string} requestOwnerId - The owner that will be validated
   * @param {string} existingOwnerId - The existing owner set on the entity
   *
   * @returns {boolean} - If the validation was successful
   */
  accessValidator: function accessValidator(requestOwnerId, existingOwnerId) {
    return (requestOwnerId == existingOwnerId);
  },

  /**
   * Validates owner
   *
   * @param {Object} requestOwner - The owner that will be validated
   * @param {Array} allowedTypes - The array of allowed types
   *
   * @returns {Object|null} - Validation error
   */
  validateRequest: async function validateRequest(requestOwner, allowedTypes) {
    let that = this;
    
    return await new validationChain()
      .add(
        that.typeAllowedValidator,
        {
          parameters: [requestOwner, allowedTypes],
          error: new validationError(
            'Some validation errors occurred.',
            [
              {
                code: errors.Owner.INVALID_OWNER_TYPE_SPECIFIED,
                message: `The owner type [${requestOwner.kind}] is not valid for this entity.`
              }
            ]
          )
        }
      )
      .add(
        that.ownerExistsValidator,
        {
          parameters: [requestOwner],
          error: new validationError(
            'Some validation errors occurred.',
            [
              {
                code: errors.User.OWNER_NOT_FOUND,
                message: `An owner with id [${requestOwner.item}] could not be found`
              }
            ]
          ),
          async: true
        }
      )
      .validate({mode: validationChain.modes.EXIT_ON_ERROR});

  },

  /**
   * Validates owner
   *
   * @param {string} requestOwnerId - The owner that will be validated
   * @param {string} existingOwnerId - The existing owner set on the entity
   *
   * @returns {Object|null} - Validation error
   */
  validateExisting: async function validateRequest(requestOwnerId, existingOwnerId) {
    let that = this;
    
    return await new validationChain()
      .add(
        that.accessValidator,
        {
          parameters: [requestOwnerId, existingOwnerId],
          error: new authorizationError(
            `The specified owner with id [${requestOwnerId}] does not have access to the entity.`
          )
        }
      )
      .validate({mode: validationChain.modes.EXIT_ON_ERROR});
  }
};


function _ownerFactory(type) {
  switch (type.toLowerCase()) {
    case 'user':
      return require('../models/User');
    default:
      throw new Error(`Invalid owner type [${type}] specified`);
  }
}