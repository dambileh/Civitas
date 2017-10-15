'use strict';

var validationChain = require('../../libs/ValidationChain');
var validationError = require('../../libs/error/ValidationError');
var errors = require('../../ErrorCodes');
const Company = require('../models/Company');

module.exports = {

  /**
   * Validates that no company with the same name and primary phone number already exist
   *
   * @param {Object} companyRequest - The company entity that will be validated
   *
   * @returns {boolean} - If the validation was successful
   */
  newCompanyValidator: async function newCompanyValidator(companyRequest) {

    let primaryNumber = companyRequest.phoneNumbers.find((number) => {
      return number.isPrimary;
    });

    let company = null;
    try {
      company = await Company.findOne(
        {
          name: companyRequest.name,
          'phoneNumbers.isPrimary': true,
          'phoneNumbers.number': primaryNumber.number
        }
      );
    } catch (err) {
      return false;
    }

    return !(company);
  },

  /**
   * Validates the company already exist
   *
   * @param {Object} company - The company entity that will be validated
   *
   * @returns {boolean} - If the validation was successful
   */
  existingCompanyValidator: function existingCompanyValidator(company) {
    return (company ? true : false);
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
          parameters: [request],
          error: new validationError(
            'Some validation errors occurred.',
            [
              {
                code: errors.Company.COMPANY_ALREADY_EXISTS,
                message: `A company with the same name and primary phone number already exists.`,
                path: ['name']
              }
            ]
          ),
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
          parameters: [company],
          error: new validationError(
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
      )
      .validate({mode: validationChain.modes.EXIT_ON_ERROR});
  }
};