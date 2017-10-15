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
   * @param {Array} addresses - The array of new addresses
   * @param {string} ownerId - The id of address owner
   * @param {string} ownerType - The type of address owner
   * 
   * @returns {Promise}
   */
  createAddresses: async function (addresses, ownerId, ownerType) {

    return new Promise(async function (resolve, reject) {
      try {
        var validationResult = await addressValidator.validateCreate(addresses);

        if (validationResult) {
          return reject(validationResult);
        }

        let addressEntities = [];

        for (let address of addresses) {
          var addressEntity = new Address(address);

          addressEntity.owner = {
            item: ownerId,
            kind: ownerType
          };

          addressEntities.push(addressEntity);
        }

        let savedAddresses = await entityHelper.entityBatchCreate(addressEntities);

        return resolve(savedAddresses);
      } catch (error) {
        return reject(error);
      }
    });

  },

  /**
   * Inserts the passed in addresses in the database and removes the old ones
   *
   * @param {Array} newAddresses - The array of new addresses
   * @param {Array} oldAddresses - The array of old addresses
   * @param {string} ownerId - The id of address owner
   * @param {string} ownerType - The type of address owner
   *
   * @returns {Promise}
   */
  updateAddresses: async function (newAddresses, oldAddresses, ownerId, ownerType) {
    const that = this;
    
    return new Promise(async function (resolve, reject) {
        try {
          var validationResult = await addressValidator.validateUpdate(newAddresses);

          if (validationResult) {
            return reject(validationResult);
          }

          let newAddressEntities = [];

          for (let address of newAddresses) {
            var addressEntity = new Address(address);

            addressEntity.owner = {
              item: ownerId,
              kind: ownerType
            };

            newAddressEntities.push(addressEntity);
          }

          let savedAddresses = await entityHelper.entityBatchCreate(newAddressEntities);

          // Now remove the old address records
          if (oldAddresses.length > 0) {
            try {

              await that.removeAddresses(
                oldAddresses
              );
            } catch (error) {

              // If there is an error removing the old addresses, the new addresses should be removed as well
              if (savedAddresses.length > 0) {
                await that.removeAddresses(
                  savedAddresses.map((address) => {
                    return address.id;
                  })
                );
              }
              return reject(error);
            }
          }
          
          return resolve(savedAddresses);
        } catch (error) {
          return reject(error);
        }
    });

  },
  /**
   * Removes the passed in addresses from the database
   *
   * @param {Array} addressIds - The ids  of the addresses that will be removed 
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