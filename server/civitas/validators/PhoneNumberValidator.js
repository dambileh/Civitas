'use strict';

var validationChain = require('../../libs/ValidationChain');
var validationError = require('../../libs/error/ValidationError');
var errors = require('../../ErrorCodes');

module.exports = {

  /**
   * Validates that there is exactly one primary phone number
   *
   * @param {Array} phoneNumbers - the phone numbers that will be validated
   *
   * @returns {Object|null} - Error
   */
  hasPrimaryValidator: function hasPrimaryValidator(phoneNumbers) {

    let primaryCounter = 0;

    for (let number of phoneNumbers) {
      if (number.isPrimary) {
        primaryCounter++;
      }
    }

    if (primaryCounter !== 1) {
      return new validationError(
        'Some validation errors occurred.',
        [
          {
            code: errors.PhoneNumber.EXACTLY_ONE_PRIMARY_NUMBER_MUST_BE_SET,
            message: `Exactly one primary phone number must be set. [${primaryCounter}] found instead`,
            path: ['phoneNumbers']
          }
        ]
      );
    }

    return null;
  },

  /**
   * Validates that there are no duplicate phone numbers
   *
   * @param {Array} phoneNumbers - The phone numbers that will be validated
   *
   * @returns {Object|null} - Error
   */
  isNumberUniqueValidator: function isNumberUniqueValidator(phoneNumbers) {

    let firstNumber = null;

    for (let phoneNumber of phoneNumbers) {
      if(firstNumber) {
        if(firstNumber == phoneNumber.number) {
          return new validationError(
            'Some validation errors occurred.',
            [
              {
                code: errors.PhoneNumber.DUPLICATE_PHONE_NUMBER_FOUND,
                message: `Found duplicate phone numbers [${phoneNumber.number}]`,
                path: ['phoneNumbers']
              }
            ]
          );
        }
      } else {
        firstNumber = phoneNumber.number;
      }
    }

    return null;
  },

  /**
   * Executes all phone number validations
   *
   * @param {array} phoneNumbers - the phone numbers that will be validated
   *
   * @returns {Object|null} - Validation error
   */
  validate: async function validate(phoneNumbers) {
    let that = this;
    return await new validationChain()
      .add(
        that.hasPrimaryValidator,
        {
          parameters: [phoneNumbers]
        }
      )
      .add(
        that.isNumberUniqueValidator,
        {
          parameters: [phoneNumbers]
        }
      )
      .validate({mode: validationChain.modes.EXIT_ON_ERROR});
  }
};



