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

   * @returns {boolean} - If the validation was successful
   */
  hasPrimaryValidator: function hasPrimaryValidator(persons) {

    let primaryCounter = 0;

    for (let person of persons) {
      if (person.isPrimary) {
        primaryCounter++;
      }
    }

    return (primaryCounter === 1);
  },

  /**
   * Validates that person has unique email
   *
   * @param {Array} persons - the persons that will be validated

   * @returns {boolean} - If the validation was successful
   */
  isEmailUniqueValidator: function isEmailUniqueValidator(persons) {

    let firstEmail = null;

    for (let person of persons) {
      if(firstEmail) {
        if(firstEmail == person.email) {
          return false;
        }
      } else {
        firstEmail = person.email;
      }
    }

    return true;
  },

  /**
   * Validates that person has exactly one primary phone numbers
   *
   * @param {Array} persons - the persons that will be validated

   * @returns {boolean} - If the validation was successful
   */
  personHasPrimaryPhoneValidator: async function personHasPrimaryPhoneValidator(persons) {
    for (let person of persons) {
      let validationResult = await phoneNumberValidator.hasPrimaryValidator(person.phoneNumbers);
      if (!validationResult) {
        return false;
      }
    }

    return true;
  },

  /**
   * Validates that person has unique phone numbers
   *
   * @param {Array} persons - the persons that will be validated

   * @returns {boolean} - If the validation was successful
   */
  personHasUniquePhoneValidator: async function personHasUniquePhoneValidator(persons) {
    for (let person of persons) {
      let validationResult = await phoneNumberValidator.isNumberUniqueValidator(person.phoneNumbers);
      if (!validationResult) {
        return false;
      }
    }
    return true;
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
          parameters: [persons],
          error: new validationError(
            'Some validation errors occurred.',
            [
              {
                code: errors.Person.EXACTLY_ONE_PRIMARY_PERSON_MUST_BE_SET,
                message: `Exactly one primary representative must be set`,
                path: ['representatives']
              }
            ]
          )
        }
      )
      .add(
        that.personHasPrimaryPhoneValidator,
        {
          parameters: [persons],
          error: new validationError(
            'Some validation errors occurred.',
            [
              {
                code: errors.PhoneNumber.EXACTLY_ONE_PRIMARY_NUMBER_MUST_BE_SET,
                message: `Exactly one primary phone number must be set for person`,
                path: ['representatives', 'phoneNumbers']
              }
            ]
          ),
          async: true
        }
      )
      .add(
        that.personHasUniquePhoneValidator,
        {
          parameters: [persons],
          error: new validationError(
            'Some validation errors occurred.',
            [
              {
                code: errors.PhoneNumber.DUPLICATE_PHONE_NUMBER_FOUND,
                message: `Persons phone numbers must be unique`,
                path: ['representatives', 'phoneNumbers', 'number']
              }
            ]
          ),
          async: true
        }
      )
      .add(
        that.isEmailUniqueValidator,
        {
          parameters: [persons],
          error: new validationError(
            'Some validation errors occurred.',
            [
              {
                code: errors.PhoneNumber.DUPLICATE_EMAIL_FOUND,
                message: `Persons email address must be unique`,
                path: ['representatives', 'email']
              }
            ]
          ),
          async: true
        }
      )
      .validate({mode: validationChain.modes.EXIT_ON_ERROR});
  }
};



