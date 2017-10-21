'use strict';

const validationChain = require('../../libs/ValidationChain');
const validationError = require('../../libs/error/ValidationError');
const phoneNumberValidator = require('./PhoneNumberValidator');
const personValidator = require('./PersonValidator');
const errors = require('../../ErrorCodes');

module.exports = {

  /**
   * Validates that entity has unique name
   *
   * @param {Array} entities - The entities that will be validated

   * @returns {boolean} - If the validation was successful
   */
  isNameUniqueValidator: function isNameUniqueValidator(entities) {

    let firstName = null;

    for (let entity of entities) {
      if(firstName) {
        if(firstName == entity.name) {
          return false;
        }
      } else {
        firstName = entity.name;
      }
    }

    return true;
  },

  /**
   * Validates that entity has exactly one primary phone number
   *
   * @param {Array} entities - The entities that will be validated

   * @returns {boolean} - If the validation was successful
   */
  entityHasPrimaryPhoneValidator: async function entityHasPrimaryPhoneValidator(entities) {
    for (let entity of entities) {
      let validationResult = await phoneNumberValidator.hasPrimaryValidator(entity.phoneNumbers);
      if (!validationResult) {
        return false;
      }
    }

    return true;
  },

  /**
   * Validates that entity has unique phone numbers
   *
   * @param {Array} entities - The entities that will be validated
   *
   * @returns {boolean} - If the validation was successful
   */
  entityHasUniquePhoneValidator: async function entityHasUniquePhoneValidator(entities) {
    for (let entity of entities) {
      let validationResult = await phoneNumberValidator.isNumberUniqueValidator(entity.phoneNumbers);
      if (!validationResult) {
        return false;
      }
    }
    return true;
  },

  /**
   * Validates that entity has unique representative
   *
   * @param {Array} entities - The entities that will be validated
   *
   * @returns {boolean} - If the validation was successful
   */
  entityHasPrimaryPersonValidator: async function entityHasPrimaryPersonValidator(entities) {
    for (let entity of entities) {
      let validationResult = await personValidator.hasPrimaryValidator(entity.representatives);
      if (!validationResult) {
        return false;
      }
    }
    return true;
  },

  /**
   * Validates that entity representative has unique phone number
   *
   * @param {Array} entities - The entities that will be validated
   *
   * @returns {boolean} - If the validation was successful
   */
  entityPersonHasUniquePhoneValidator: async function entityPersonHasUniquePhoneValidator(entities) {
    for (let entity of entities) {
      let validationResult = await personValidator.personHasUniquePhoneValidator(entity.representatives);
      if (!validationResult) {
        return false;
      }
    }
    return true;
  },

  /**
   * Validates that entity representative has primary phone number
   *
   * @param {Array} entities - The entities that will be validated
   *
   * @returns {boolean} - If the validation was successful
   */
  entityPersonPrimaryPhoneValidator: async function entityPersonPrimaryPhoneValidator(entities) {
    for (let entity of entities) {
      let validationResult = await personValidator.personHasPrimaryPhoneValidator(entity.representatives);
      if (!validationResult) {
        return false;
      }
    }
    return true;
  },

  /**
   * Validates that entity representative has unique email address
   *
   * @param {Array} entities - The entities that will be validated
   *
   * @returns {boolean} - If the validation was successful
   */
  entityPersonIsEmailUniqueValidator: async function entityPersonIsEmailUniqueValidator(entities) {
    for (let entity of entities) {
      let validationResult = await personValidator.isEmailUniqueValidator(entity.representatives);
      if (!validationResult) {
        return false;
      }
    }
    return true;
  },

  /**
   * Executes all person validations
   *
   * @param {Array} entities - The entities that will be validated
   *
   * @returns {Object|null} - Validation error
   */
  validate: async function validate(entities) {
    let that = this;

    return await new validationChain()
      .add(
        that.entityHasPrimaryPhoneValidator,
        {
          parameters: [entities],
          error: new validationError(
            'Some validation errors occurred.',
            [
              {
                code: errors.PhoneNumber.EXACTLY_ONE_PRIMARY_NUMBER_MUST_BE_SET,
                message: `Exactly one primary phone number must be set for entity`,
                path: ['entities', 'phoneNumbers']
              }
            ]
          ),
          async: true
        }
      )
      .add(
        that.entityHasUniquePhoneValidator,
        {
          parameters: [entities],
          error: new validationError(
            'Some validation errors occurred.',
            [
              {
                code: errors.PhoneNumber.DUPLICATE_PHONE_NUMBER_FOUND,
                message: `Entities phone numbers must be unique`,
                path: ['entities', 'phoneNumbers', 'number']
              }
            ]
          ),
          async: true
        }
      )
      .add(
        that.isNameUniqueValidator,
        {
          parameters: [entities],
          error: new validationError(
            'Some validation errors occurred.',
            [
              {
                code: errors.Entity.DUPLICATE_NAME_FOUND,
                message: `Entity name must be unique`,
                path: ['entities', 'name']
              }
            ]
          )
        }
      )
      .add(
        that.entityHasPrimaryPersonValidator,
        {
          parameters: [entities],
          error: new validationError(
            'Some validation errors occurred.',
            [
              {
                code: errors.Person.EXACTLY_ONE_PRIMARY_PERSON_MUST_BE_SET,
                message: `Exactly one primary representative must be set for entity`,
                path: ['entities', 'representatives']
              }
            ]
          ),
          async: true
        }
      )
      .add(
        that.entityPersonHasUniquePhoneValidator,
        {
          parameters: [entities],
          error: new validationError(
            'Some validation errors occurred.',
            [
              {
                code: errors.PhoneNumber.DUPLICATE_PHONE_NUMBER_FOUND,
                message: `Entity persons phone numbers must be unique`,
                path: ['entities', 'representatives', 'phoneNumbers', 'number']
              }
            ]
          ),
          async: true
        }
      )
      .add(
        that.entityPersonPrimaryPhoneValidator,
        {
          parameters: [entities],
          error: new validationError(
            'Some validation errors occurred.',
            [
              {
                code: errors.PhoneNumber.EXACTLY_ONE_PRIMARY_NUMBER_MUST_BE_SET,
                message: `Exactly one primary phone number must be set for entity person`,
                path: ['entities', 'representatives', 'phoneNumbers']
              }
            ]
          ),
          async: true
        }
      )
      .add(
        that.entityPersonIsEmailUniqueValidator,
        {
          parameters: [entities],
          error: new validationError(
            'Some validation errors occurred.',
            [
              {
                code: errors.Person.DUPLICATE_EMAIL_FOUND,
                message: `Entity persons email address must be unique`,
                path: ['entities', 'representatives', 'email']
              }
            ]
          ),
          async: true
        }
      )
      .validate({mode: validationChain.modes.EXIT_ON_ERROR});
  }
};



