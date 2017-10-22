'use strict';

const validationChain = require('../../libs/ValidationChain');
const validationError = require('../../libs/error/ValidationError');
const phoneNumberValidator = require('./PhoneNumberValidator');
const errors = require('../../ErrorCodes');

module.exports = {

  /**
   * Validates that there is exactly one primary person
   *
   * @param {Array} persons - the persons that will be validated
   * 
   * @returns {Object|null} - Error
   */
  hasPrimaryValidator: function hasPrimaryValidator(persons) {

    let primaryCounter = 0;

    for (let person of persons) {
      if (person.isPrimary) {
        primaryCounter++;
      }
    }

    if (primaryCounter !== 1) {
      return new validationError(
        'Some validation errors occurred.',
        [
          {
            code: errors.Person.EXACTLY_ONE_PRIMARY_PERSON_MUST_BE_SET,
            message: `Exactly one primary representative must be set. [${primaryCounter}] found instead`,
            path: ['representatives']
          }
        ]
      )
    }
    
    return null;
  },

  /**
   * Validates that person has unique email
   *
   * @param {Array} persons - the persons that will be validated
   *
   * @returns {Object|null} - Error
   */
  isEmailUniqueValidator: function isEmailUniqueValidator(persons) {

    let firstEmail = null;

    for (let person of persons) {
      if(firstEmail) {
        if(firstEmail == person.email) {
          return new validationError(
            'Some validation errors occurred.',
            [
              {
                code: errors.Person.DUPLICATE_EMAIL_FOUND,
                message: `Found duplicate persons email address [${person.email}]`,
                path: ['representatives', 'email']
              }
            ]
          );
        }
      } else {
        firstEmail = person.email;
      }
    }

    return null;
  },

  /**
   * Validates that person has exactly one primary phone numbers
   *
   * @param {Array} persons - the persons that will be validated
   * 
   * @returns {Object|null} - Error
   */
  personHasPrimaryPhoneValidator: async function personHasPrimaryPhoneValidator(persons) {
    for (let person of persons) {
      let validationResult = await phoneNumberValidator.hasPrimaryValidator(person.phoneNumbers);
      if (validationResult) {
        return new validationError(
          'Some validation errors occurred.',
          [
            {
              code: errors.PhoneNumber.EXACTLY_ONE_PRIMARY_NUMBER_MUST_BE_SET,
              message: `Exactly one primary phone number must be set for person`,
              path: ['representatives', 'phoneNumbers']
            }
          ]
        );
      }
    }

    return null;
  },

  /**
   * Validates that person has unique phone numbers
   *
   * @param {Array} persons - the persons that will be validated
   * 
   * @returns {Object|null} - Error
   */
  personHasUniquePhoneValidator: async function personHasUniquePhoneValidator(persons) {
    for (let person of persons) {
      let validationResult = await phoneNumberValidator.isNumberUniqueValidator(person.phoneNumbers);
      if (validationResult) {
        return new validationError(
          'Some validation errors occurred.',
          [
            {
              code: errors.PhoneNumber.DUPLICATE_PHONE_NUMBER_FOUND,
              message: `Persons phone numbers must be unique`,
              path: ['representatives', 'phoneNumbers', 'number']
            }
          ]
        );
      }
    }
    
    return null;
  },

  /**
   * Executes all person validations
   *
   * @param {Array} persons - the persons that will be validated
   *
   * @returns {Object|null} - Validation error
   */
  validate: async function validate(persons) {
    let that = this;
    return await new validationChain()
      .add(
        that.hasPrimaryValidator,
        {
          parameters: [persons]
        }
      )
      .add(
        that.personHasPrimaryPhoneValidator,
        {
          parameters: [persons],
          async: true
        }
      )
      .add(
        that.personHasUniquePhoneValidator,
        {
          parameters: [persons],
          async: true
        }
      )
      .add(
        that.isEmailUniqueValidator,
        {
          parameters: [persons],
          async: true
        }
      )
      .validate({mode: validationChain.modes.EXIT_ON_ERROR});
  }
};



