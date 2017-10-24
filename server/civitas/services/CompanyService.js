'use strict';

const Company = require('../models/Company');
const resourceNotFoundError = require('../../libs/error/ResourceNotFoundError');
const validationError = require('../../libs/error/ValidationError');
const appUtil = require('../../libs/AppUtil');
const logging = require('../utilities/Logging');
const config = require('config');
const internalEventEmitter = require('../../libs/InternalEventEmitter');
const addressManager = require('../managers/AddressManager');
const companyChannels = require('../../PubSubChannels').Company;
const errors = require('../../ErrorCodes');
const constants = require('../../Constants');
const ownerValidator = require('../validators/OwnerValidator');
const companyValidator = require('../validators/CompanyValidator');
const phoneNumberValidator = require('../validators/PhoneNumberValidator');
const personValidator = require('../validators/PersonValidator');

/**
 * The Company Service module
 */
module.exports = {

  /**
   * Creates a company
   *
   * @param {object} request - The request that was sent from the controller
   */
  createCompany: async function createCompany(request) {

    //Validate the owner
    let ownerValidationResult = await ownerValidator.validateRequest(request.owner, ['user']);

    if (ownerValidationResult) {
      return internalEventEmitter.emit(
        companyChannels.Internal.CreateCompletedEvent,
        {
          statusCode: 400,
          body: ownerValidationResult
        }
      );
    }

    // Validate the phone numbers first since company validator requires the phone numbers to be set
    let phoneNumberValidationResult = await phoneNumberValidator.validate(request.phoneNumbers);

    if (phoneNumberValidationResult) {
      return internalEventEmitter.emit(
        companyChannels.Internal.CreateCompletedEvent,
        {
          statusCode: 400,
          body: phoneNumberValidationResult
        }
      );
    }

    // Validate the request
    var companyValidationResult = await companyValidator.validateCreate(request);

    if (companyValidationResult) {
      return internalEventEmitter.emit(
        companyChannels.Internal.CreateCompletedEvent,
        {
          statusCode: 400,
          body: companyValidationResult
        }
      );
    }

    // Validate the representatives
    let personValidationResult = await personValidator.validate(request.representatives);
    if (personValidationResult) {
      return internalEventEmitter.emit(
        companyChannels.Internal.CreateCompletedEvent,
        {
          statusCode: 400,
          body: personValidationResult
        }
      );
    }

    // get address from the request and unset it so that we can create the Company model
    // Otherwise it will fail the Array of Ids schema validation
    let requestAddresses = request.addresses;

    request.addresses = [];

    let companyModel = null;

    try {
      companyModel = new Company(request);
    } catch (error) {
      return internalEventEmitter.emit(
        companyChannels.Internal.CreateCompletedEvent,
        {
          statusCode: 500,
          body: error
        }
      );
    }

    logging.logAction(
      logging.logLevels.INFO,
      'Attempting to save a new Company document'
    );

    await companyModel.save();

    let companyAddresses = null;

    try {
      companyAddresses = await addressManager.createAddresses(
        requestAddresses,
        companyModel.id,
        constants.address.ownerType.company
      );
    } catch (error) {

      let statusCode = 500;

      if (error.status === 400) {
        statusCode = 400;
      }

      // If there is an error creating the address, we should remove the company record as well
      await companyModel.remove();

      return internalEventEmitter.emit(
        companyChannels.Internal.CreateCompletedEvent,
        {
          statusCode: statusCode,
          body: error
        }
      );
    }

    // Now that we have created the addresses, we should set them on the user record
    // We only save the ids
    companyModel.addresses = companyAddresses.map((address) => {
      return address.id;
    });

    await companyModel.save();

    // Set the address objects back on for display
    companyModel.addresses = companyAddresses;

    return internalEventEmitter.emit(
      companyChannels.Internal.CreateCompletedEvent,
      {
        statusCode: 201,
        body: companyModel
      }
    );
  },

  /**
   * Returns all companies
   *
   * @param {object} request - The request arguments passed in from the controller
   */
  getAllCompanies: async function getAllCompanies(request) {
    //Validate the owner
    let ownerValidationResult = await ownerValidator.validateRequest(request.owner, ['user']);
    if (ownerValidationResult) {
      return internalEventEmitter.emit(
        companyChannels.Internal.CreateCompletedEvent,
        {
          statusCode: 400,
          body: ownerValidationResult
        }
      );
    }

    logging.logAction(
      logging.logLevels.INFO,
      'Attempting to retrieve all companies'
    );

    let companies = null;

    try {
      companies = await Company
        .find({'owner.item': request.owner.item})
        .populate('addresses')
        .populate('owner.item');

    } catch (err) {
      return internalEventEmitter.emit(
        companyChannels.Internal.GetAllCompletedEvent,
        {
          statusCode: 500,
          body: err
        }
      );
    }

    let statusCode = 200;

    // If the array is empty we need to return a 204 response.
    if (appUtil.isArrayEmpty(companies)) {
      statusCode = 204;
    }

    return internalEventEmitter.emit(
      companyChannels.Internal.GetAllCompletedEvent,
      {
        statusCode: statusCode,
        header: {
          resultCount: companies.length
        },
        body: companies
      }
    );
  },

  /**
   * Returns a single company
   *
   * @param {object} request - The request that was sent from the controller
   */
  getSingleCompany: async function getSingleCompany(request) {
    //Validate the owner
    let ownerValidationResult = await ownerValidator.validateRequest(request.owner, ['user']);
    if (ownerValidationResult) {
      return internalEventEmitter.emit(
        companyChannels.Internal.CreateCompletedEvent,
        {
          statusCode: 400,
          body: ownerValidationResult
        }
      );
    }

    logging.logAction(
      logging.logLevels.INFO,
      'Attempting to get a single company'
    );

    let company = null;

    try {
      company = await Company
        .findById(request.id)
        .populate('addresses')
        .populate('owner.item');

    } catch (err) {
      return internalEventEmitter.emit(
        companyChannels.Internal.GetSingleCompletedEvent,
        {
          statusCode: 500,
          body: err
        }
      );
    }

    if (appUtil.isNullOrUndefined(company)) {

      var notFoundError = new resourceNotFoundError(
        'Resource not found.',
        `No company with id [${request.id}] was found`
      );

      return internalEventEmitter.emit(
        companyChannels.Internal.GetSingleCompletedEvent,
        {
          statusCode: 404,
          body: notFoundError
        }
      );
    }

    // Validate the existing owner
    let existingOwnerValidationResult = await ownerValidator.validateExisting(
      request.owner.item,
      company.owner.item._id
    );

    if (existingOwnerValidationResult) {
      return internalEventEmitter.emit(
        companyChannels.Internal.CreateCompletedEvent,
        {
          statusCode: 401,
          body: existingOwnerValidationResult
        }
      );
    }

    return internalEventEmitter.emit(
      companyChannels.Internal.GetSingleCompletedEvent,
      {
        statusCode: 200,
        body: company
      }
    );
  },

  /**
   * Deletes a company
   *
   * @param {object} request - The request arguments passed in from the controller
   */
  deleteCompany: async function deleteCompany(request) {
    //Validate the owner
    let ownerValidationResult = await ownerValidator.validateRequest(request.owner, ['user']);
    if (ownerValidationResult) {
      return internalEventEmitter.emit(
        companyChannels.Internal.CreateCompletedEvent,
        {
          statusCode: 400,
          body: ownerValidationResult
        }
      );
    }

    let company = null;
    try {
      company = await Company
        .findById(request.id)
        .populate('addresses')
        .populate('owner.item');

    } catch (err) {
      return internalEventEmitter.emit(
        companyChannels.Internal.DeleteCompletedEvent,
        {
          statusCode: 500,
          body: err
        }
      );
    }

    if (appUtil.isNullOrUndefined(company)) {
      var modelValidationError = new validationError(
        'Some validation errors occurred.',
        [
          {
            code: errors.Company.COMPANY_NOT_FOUND,
            message: `No company with id [${request.id}] was found.`,
            path: ['id']
          }
        ]
      );

      return internalEventEmitter.emit(
        companyChannels.Internal.DeleteCompletedEvent,
        {
          statusCode: 400,
          body: modelValidationError
        }
      );
    }

    // Validate the existing owner
    let existingOwnerValidationResult = await ownerValidator.validateExisting(
      request.owner.item,
      company.owner.item._id
    );

    if (existingOwnerValidationResult) {
      return internalEventEmitter.emit(
        companyChannels.Internal.CreateCompletedEvent,
        {
          statusCode: 401,
          body: existingOwnerValidationResult
        }
      );
    }

    logging.logAction(
      logging.logLevels.INFO,
      'Attempting to remove a company document'
    );

    try {
      await company.remove();
    } catch (err) {
      return internalEventEmitter.emit(
        companyChannels.Internal.DeleteCompletedEvent,
        {
          statusCode: 500,
          body: err
        }
      );
    }

    return internalEventEmitter.emit(
      companyChannels.Internal.DeleteCompletedEvent,
      {
        statusCode: 200,
        body: company
      }
    );
  },

  /**
   * Updates a company
   *
   * @param {object} request - The request arguments passed in from the controller
   */
  updateCompany: async function updateCompany(request) {
    //Validate the owner
    let ownerValidationResult = await ownerValidator.validateRequest(request.owner, ['user']);
    if (ownerValidationResult) {
      return internalEventEmitter.emit(
        companyChannels.Internal.CreateCompletedEvent,
        {
          statusCode: 400,
          body: ownerValidationResult
        }
      );
    }

    let company = null;

    try {
      company = await Company
        .findById(request.id)
        .populate('addresses')
        .populate('owner.item');

    } catch (err) {
      return internalEventEmitter.emit(
        companyChannels.Internal.UpdateCompletedEvent,
        {
          statusCode: 500,
          body: err
        }
      );
    }

    // Validate the request
    var validationResult = await companyValidator.validateUpdate(company, request);

    if (validationResult) {
      return internalEventEmitter.emit(
        companyChannels.Internal.CreateCompletedEvent,
        {
          statusCode: 400,
          body: validationResult
        }
      );
    }

    // Validate the existing owner
    let existingOwnerValidationResult = await ownerValidator.validateExisting(
      request.owner.item,
      company.owner.item._id
    );

    if (existingOwnerValidationResult) {
      return internalEventEmitter.emit(
        companyChannels.Internal.CreateCompletedEvent,
        {
          statusCode: 401,
          body: existingOwnerValidationResult
        }
      );
    }

    if (request.branch) {
      company.branch = request.branch;
    }

    if (request.type) {
      company.type = request.type;
    }

    if (request.phoneNumbers) {
      // Validate the phone numbers
      let phoneNumberValidationResult = await phoneNumberValidator.validate(request.phoneNumbers);

      if (phoneNumberValidationResult) {
        return internalEventEmitter.emit(
          companyChannels.Internal.CreateCompletedEvent,
          {
            statusCode: 400,
            body: phoneNumberValidationResult
          }
        );
      }

      company.phoneNumbers = request.phoneNumbers;
    }

    if (request.representatives) {
      // Validate the representatives
      let personValidationResult = await personValidator.validate(request.representatives);
      if (personValidationResult) {
        return internalEventEmitter.emit(
          companyChannels.Internal.CreateCompletedEvent,
          {
            statusCode: 400,
            body: personValidationResult
          }
        );
      }
      company.representatives = request.representatives;
    }
    
    let companyAddresses = company.addresses;

    // First update the address
    if (request.addresses) {

      try {
        companyAddresses = await addressManager.updateAddresses(
          request.addresses,
          company.addresses,
          company.id,
          constants.address.ownerType.company
        );
      } catch (error) {

        let statusCode = 500;

        if (error.status === 400) {
          statusCode = 400;
        } 
        
        return internalEventEmitter.emit(
          companyChannels.Internal.UpdateCompletedEvent,
          {
            statusCode: statusCode,
            body: error
          }
        );
      }

      company.addresses = companyAddresses.map((address) => {
        return address.id;
      });
    }

    logging.logAction(
      logging.logLevels.INFO,
      `Attempting to update a company document with id [${company.id}]`
    );

    try {
      await company.save();
    } catch (err) {
      return internalEventEmitter.emit(
        companyChannels.Internal.UpdateCompletedEvent,
        {
          statusCode: 500,
          body: err
        }
      );
    }

    company.updatedAt = new Date();

    // set the address objects back on the display response
    company.addresses = companyAddresses;
    return internalEventEmitter.emit(
      companyChannels.Internal.UpdateCompletedEvent,
      {
        statusCode: 200,
        body: company
      }
    );
  }
};