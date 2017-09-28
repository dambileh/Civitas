'use strict';

var errors = require('../../ErrorCodes');
var Address = require('../models/Address');
var entityHelper = require('../../libs/EntityHelper');
var addressValidator = require('../validators/AddressValidator');
var validationError = require('../../libs/error/ValidationError');

module.exports = {

  /**
   * Inserts the passed in addresses in the database
   *
   * @param {array} addresses - The array of new addresses
   * @param {string} ownerId - The id of address owner
   * @param {string} ownerType - The type of address owner
   * 
   * @returns {Promise}
   */
  createAddresses: async function (addresses, ownerId, ownerType) {

    return new Promise(async function (resolve, reject) {

      var validationResult = await addressValidator.validateCreate(addresses); 

      if (validationResult) {
        return reject(validationResult);
      }

      let addressEntities = [];

      for (let address of addresses) {
        try {

          var addressEntity = new Address(address);

          addressEntity.owner = {
            item: ownerId,
            kind: ownerType
          };

          addressEntities.push(addressEntity);
        } catch (error) {
          return reject(error);
        }
      }

      let savedAddresses = null;

      try {
        savedAddresses = await entityHelper.entityBatchUpdate(addressEntities);

      } catch (error) {
        return reject(error);
      }

      return resolve(savedAddresses);
    });

  },

  /**
   * Removes the passed in addresses from the database
   *
   * @param {array} addressIds - The ids  of the addresses that will be removed 
   *
   * @returns {Promise}
   */
  removeAddresses: async function (addressIds) {

    return new Promise(async function (resolve, reject) {

      for (let addressId of addressIds) {

        let address = null;
        try {
          address = await Address.findById(addressId);
        } catch (error) {
          // If there is an error, fail early and return
          return reject(error);
        }

        if (!address) {
          var modelValidationError = new validationError(
            'Some validation errors occurred.',
            [
              {
                code: errors.Address.ADDRESS_NOT_FOUND,
                message: `No Address with id [${addressId}] was found.`,
                path: ['id']
              }
            ]
          );
          
          return reject(modelValidationError);
        }

        try {
          await address.remove();
        } catch (error) {
          return reject(error);
        }
        
      }

      return resolve(addressIds);
    });

  }
};