'use strict';

const validationChain = require('../../libs/ValidationChain');
const validationError = require('../../libs/error/ValidationError');
const errors = require('../../ErrorCodes');
const Company = require('../models/Company');

module.exports = {

  /**
   * Validates that no company with the same name and primary phone number already exist
   *
   * @param {string} name - The name of the company that will be validated
   * @param {Array} phoneNumbers - The array of phone numbers that will be validated
   *
   * @returns {Object|null} - Error
   */
  newCompanyValidator: async function newCompanyValidator(name, phoneNumbers) {

    let primaryNumber = phoneNumbers.find((number) => {
      return number.isPrimary;
    });

    let company = null;
    try {
      company = await Company.findOne(
        {
          name: name,
          'phoneNumbers.isPrimary': true,
          'phoneNumbers.number': primaryNumber.number
        }
      );
    } catch (err) {
      return err;
    }

    if (company) {
      return new validationError(
        'Some validation errors occurred.',
        [
          {
            code: errors.Company.COMPANY_ALREADY_EXISTS,
            message: `A company with the same name [${name}] and primary phone number [${primaryNumber.number}] already exists.`,
            path: ['name']
          }
        ]
      )
    }
    
    return null;
  },

  /**
   * Validates the company already exist
   *
   * @param {Object} company - The existing company entity
   * @param {Object} request - The new user company that will be validated
   * 
   * @returns {Object|null} - Error
   */
  existingCompanyValidator: function existingCompanyValidator(company, request) {
    if (!company) {
      return new validationError(
        'Some validation errors occurred.',
        [
          {
            code: errors.Company.COMPANY_NOT_FOUND,
            message: `No company with id [${request.id}] was found.`,
            path: ['id']
          }
        ]
      )
    }
    return null;
  },

  /**
   * Executes all company create validations
   *
   * @param {Object} request - The new company request that will be validated
   *
   * @returns {Object|null} - Validation error
   */
  validateCreate: async function validateCreate(request) {
    let that = this;

    return await new validationChain()
      .add(
        that.newCompanyValidator,
        {
          parameters: [request.name, request.phoneNumbers],
          async: true
        }
      )
      .validate({mode: validationChain.modes.EXIT_ON_ERROR});
  },

  /**
   * Executes all user update validations
   *
   * @param {Company} company - The existing company
   * @param {Object} request - The new user entity that will be validated
   *
   * @returns {Object|null} - Validation error
   */
  validateUpdate: async function validateCreate(company, request) {
    let that = this;
    return await new validationChain()
      .add(
        that.existingCompanyValidator,
        {
          parameters: [company, request]
        }
      ).validate({mode: validationChain.modes.EXIT_ON_ERROR});

  }
};