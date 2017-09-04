'use strict';

var logging = require('../utilities/Logging');
var validationChain = require('../../libs/ValidationChain');
var validationError = require('../../libs/error/ValidationError');
var errors = require('../../ErrorCodes');

module.exports = {
  createAddresses: async function (addresses) {

    return new Promise(async function (resolve, reject) {
      var chain = new validationChain();

      var validationResult = await chain
        .add(
          _addressValidator,
          {
            parameters: [addresses],
            error: new validationError(
              'Some validation errors occurred.',
              [
                {
                  code: errors.Address.EITHER_DETAIL_OR_LOCATION_MUST_BE_SET,
                  message: `Either [detail] or [location] property needs to be set for all addresses.`,
                  path: ['addresses']
                }
              ]
            )
          }
        )
        .add(
          _isPrimaryValidator,
          {
            parameters: [addresses],
            error: new validationError(
              'Some validation errors occurred.',
              [
                {
                  code: errors.Address.EXACTLY_ONE_PRIMARY_ADDRESS_MUST_BE_SET,
                  message: `Exactly one primary address must be set`,
                  path: ['addresses']
                }
              ]
            )
          }
        )
        .add(
          _locationValidator,
          {
            parameters: [addresses],
            async: true,
            error: new validationError(
              'Some validation errors occurred.',
              [
                {
                  code: errors.Address.INCORRECT_COORDINATE_FORMAT,
                  message: `the passed in coordinates are not in correct format`,
                  path: ['addresses', 'location', 'coordinates']
                }
              ]
            )
          }
        )
        .add(
          _addressDetailEitherProvinceOrStateValidator,
          {
            parameters: [addresses],
            async: true,
            error: new validationError(
              'Some validation errors occurred.',
              [
                {
                  code: errors.Address.EITHER_STATE_OR_PROVINCE_MUST_BE_SET,
                  message: `Either [state] or [province] property needs to be set for all addresses.`,
                  path: ['addresses', 'detail']
                }
              ]
            )
          }
        )
        .add(
          _addressDetailOnlyProvinceOrStateValidator,
          {
            parameters: [addresses],
            async: true,
            error: new validationError(
              'Some validation errors occurred.',
              [
                {
                  code: errors.Address.ONLY_ONE_Of_STATE_OR_PROVINCE_MUST_BE_SET,
                  message: `Only one of the [state] or [province] property must be set for all addresses.`,
                  path: ['addresses', 'detail']
                }
              ]
            )
          }
        )
        .validate({mode: 'exitOnError'});

      if (validationResult) {
        return reject(validationResult);
      }

      return resolve({});
    });

  }
};

let _addressValidator = function (addresses) {

  for(let address of addresses) {
    // Either location or address property needs to be set
    if (!(address.location || address.detail)) {
      return false;
    }
  }

  return true;
};

let _addressDetailEitherProvinceOrStateValidator = function (addresses) {

  for(let address of addresses) {
    if (address.detail) {
      // Either state or province property needs to be set
      if (!(address.detail.province || address.detail.state)) {
        return false;
      }
    }

  }

  return true;
};

let _addressDetailOnlyProvinceOrStateValidator = function (addresses) {

  for(let address of addresses) {
    if (address.detail) {
      // Only one of the state or province property must be set
      if ((address.detail.province && address.detail.state)) {
        return false;
      }
    }
  }

  return true;
};

let _isPrimaryValidator = function (addresses) {

  let primaryCounter = 0;

  for(let address of addresses) {
    if (address.isPrimary) {
      primaryCounter++;
    }
  }

  return (primaryCounter === 1);
};

let _locationValidator = function (addresses) {

  for(let address of addresses) {
    if (address.location) {
      if (address.location.coordinates.length !== 2) {
        return false;
      } else {
        // https://docs.mongodb.com/manual/reference/geojson/
        // Valid longitude values are between -180 and 180, both inclusive.
        //  Valid latitude values are between -90 and 90 (both inclusive).
        const longitude = address.location.coordinates[0];
        const latitude = address.location.coordinates[1];

        if ((longitude < -180) || (longitude > 180)) {
          return false;
        }

        if ((latitude < -90) || (latitude > 90)) {
          return false;
        }

      }
    }
  }

  return true;
};
