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
   *
   * @returns {Object|null} - Error
   */
  isNameUniqueValidator: function isNameUniqueValidator(entities) {

    let firstName = null;

    for (let entity of entities) {
      if(firstName) {
        if(firstName == entity.name) {
          return new validationError(
            'Some validation errors occurred.',
            [
              {
                code: errors.Entity.DUPLICATE_NAME_FOUND,
                message: `Found duplicate entity name [${entity.name}]`,
                path: ['entities', 'name']
              }
            ]
          );
        }
      } else {
        firstName = entity.name;
      }
    }

    return null;
  },

  /**
   * Validates that entity has exactly one primary phone number
   *
   * @param {Array} entities - The entities that will be validated
   *
   * @returns {Object|null} - Error
   */
  entityHasPrimaryPhoneValidator: async function entityHasPrimaryPhoneValidator(entities) {
    for (let entity of entities) {
      let validationResult = await phoneNumberValidator.hasPrimaryValidator(entity.phoneNumbers);
      if (validationResult) {
        return new validationError(
          'Some validation errors occurred.',
          [
            {
              code: errors.PhoneNumber.EXACTLY_ONE_PRIMARY_NUMBER_MUST_BE_SET,
              message: `Exactly one primary phone number must be set for entity`,
              path: ['entities', 'phoneNumbers']
            }
          ]
        );
      }
    }

    return null;
  },

  /**
   * Validates that entity has unique phone numbers
   *
   * @param {Array} entities - The entities that will be validated
   *
   * @returns {Object|null} - Error
   */
  entityHasUniquePhoneValidator: async function entityHasUniquePhoneValidator(entities) {
    for (let entity of entities) {
      let validationResult = await phoneNumberValidator.isNumberUniqueValidator(entity.phoneNumbers);
      if (validationResult) {
        return new validationError(
          'Some validation errors occurred.',
          [
            {
              code: errors.PhoneNumber.DUPLICATE_PHONE_NUMBER_FOUND,
              message: `Entities phone numbers must be unique`,
              path: ['entities', 'phoneNumbers', 'number']
            }
          ]
        );
      }
    }

    return null;
  },

  /**
   * Validates that entity has unique representative
   *
   * @param {Array} entities - The entities that will be validated
   *
   * @returns {Object|null} - Error
   */
  entityHasPrimaryPersonValidator: async function entityHasPrimaryPersonValidator(entities) {
    for (let entity of entities) {
      let validationResult = await personValidator.hasPrimaryValidator(entity.representatives);
      if (validationResult) {
        return new validationError(
          'Some validation errors occurred.',
          [
            {
              code: errors.Person.EXACTLY_ONE_PRIMARY_PERSON_MUST_BE_SET,
              message: `Exactly one primary representative must be set for entity`,
              path: ['entities', 'representatives']
            }
          ]
        );
      }
    }

    return null;
  },

  /**
   * Validates that entity representative has unique phone number
   *
   * @param {Array} entities - The entities that will be validated
   *
   * @returns {Object|null} - Error
   */
  entityPersonHasUniquePhoneValidator: async function entityPersonHasUniquePhoneValidator(entities) {
    for (let entity of entities) {
      let validationResult = await personValidator.personHasUniquePhoneValidator(entity.representatives);
      if (validationResult) {
        return new validationError(
          'Some validation errors occurred.',
          [
            {
              code: errors.PhoneNumber.DUPLICATE_PHONE_NUMBER_FOUND,
              message: `Entity persons phone numbers must be unique`,
              path: ['entities', 'representatives', 'phoneNumbers', 'number']
            }
          ]
        );
      }
    }
    
    return null;
  },

  /**
   * Validates that entity representative has primary phone number
   *
   * @param {Array} entities - The entities that will be validated
   *
   * @returns {Object|null} - Error
   */
  entityPersonPrimaryPhoneValidator: async function entityPersonPrimaryPhoneValidator(entities) {
    for (let entity of entities) {
      let validationResult = await personValidator.personHasPrimaryPhoneValidator(entity.representatives);
      if (validationResult) {
        return new validationError(
          'Some validation errors occurred.',
          [
            {
              code: errors.PhoneNumber.EXACTLY_ONE_PRIMARY_NUMBER_MUST_BE_SET,
              message: `Exactly one primary phone number must be set for entity person`,
              path: ['entities', 'representatives', 'phoneNumbers']
            }
          ]
        );
      }
    }
    return null;
  },

  /**
   * Validates that entity representative has unique email address
   *
   * @param {Array} entities - The entities that will be validated
   *
   * @returns {Object|null} - Error
   */
  entityPersonIsEmailUniqueValidator: async function entityPersonIsEmailUniqueValidator(entities) {
    for (let entity of entities) {
      let validationResult = await personValidator.isEmailUniqueValidator(entity.representatives);
      if (validationResult) {
        return new validationError(
          'Some validation errors occurred.',
          [
            {
              code: errors.Person.DUPLICATE_EMAIL_FOUND,
              message: `Entity persons email address must be unique`,
              path: ['entities', 'representatives', 'email']
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
          async: true
        }
      )
      .add(
        that.entityHasUniquePhoneValidator,
        {
          parameters: [entities],
          async: true
        }
      )
      .add(
        that.isNameUniqueValidator,
        {
          parameters: [entities]
        }
      )
      .add(
        that.entityHasPrimaryPersonValidator,
        {
          parameters: [entities],
          async: true
        }
      )
      .add(
        that.entityPersonHasUniquePhoneValidator,
        {
          parameters: [entities],
          async: true
        }
      )
      .add(
        that.entityPersonPrimaryPhoneValidator,
        {
          parameters: [entities],
          async: true
        }
      )
      .add(
        that.entityPersonIsEmailUniqueValidator,
        {
          parameters: [entities],
          async: true
        }
      )
      .validate({mode: validationChain.modes.EXIT_ON_ERROR});
  }
};



