'use strict';

var validationChain = require('../../libs/ValidationChain');
var validationError = require('../../libs/error/ValidationError');
var errors = require('../../ErrorCodes');

module.exports = {

  /**
   * Address detail validator
   * 
   * @param {array} addresses - the address entities that will be validated
   * 
   * @returns {Object|null} - Error
   */
  addressEitherLocationOrDetailValidator: function addressEitherLocationOrDetailValidator(addresses) {

    for (let address of addresses) {
      // Either location or address property needs to be set
      if (!(address.location || address.detail)) {
        return new validationError(
          'Some validation errors occurred.',
          [
            {
              code: errors.Address.EITHER_DETAIL_OR_LOCATION_MUST_BE_SET,
              message: `Either [detail] or [location] property needs to be set for all addresses.`,
              path: ['addresses']
            }
          ]
        );
      }
    }

    return null;
  },

  /**
   * Address detail state or province validator
   *
   * @param {array} addresses - the address entities that will be validated
   * 
   * @returns {Object|null} - Error
   */
  addressDetailEitherProvinceOrStateValidator: function addressDetailEitherProvinceOrStateValidator(addresses) {

    for (let address of addresses) {
      if (address.detail) {
        // Either state or province property needs to be set
        if (!(address.detail.province || address.detail.state)) {
          return new validationError(
            'Some validation errors occurred.',
            [
              {
                code: errors.Address.EITHER_STATE_OR_PROVINCE_MUST_BE_SET,
                message: `Either [state] or [province] property needs to be set for all addresses.`,
                path: ['addresses', 'detail']
              }
            ]
          );
        }
      }

    }

    return null;
  },

  /**
   * Address detail state or province validator
   *
   * @param {array} addresses - the address entities that will be validated
   * 
   * @returns {Object|null} - Error
   */
  addressDetailOnlyProvinceOrStateValidator: function addressDetailOnlyProvinceOrStateValidator(addresses) {

    for (let address of addresses) {
      if (address.detail) {
        // Only one of the state or province property must be set
        if ((address.detail.province && address.detail.state)) {
          return new validationError(
            'Some validation errors occurred.',
            [
              {
                code: errors.Address.ONLY_ONE_Of_STATE_OR_PROVINCE_MUST_BE_SET,
                message: `Only one of the [state] or [province] property must be set for all addresses.`,
                path: ['addresses', 'detail']
              }
            ]
          );
        }
      }
    }

    return null;
  },

  /**
   * Primary address validator
   *
   * @param {array} addresses - the address entities that will be validated
   * 
   * @returns {Object|null} - Error
   */
  hasPrimaryValidator: function hasPrimaryValidator(addresses) {

    let primaryCounter = 0;

    for (let address of addresses) {
      if (address.isPrimary) {
        primaryCounter++;
      }
    }

    if (primaryCounter !== 1) {
      return new validationError(
        'Some validation errors occurred.',
        [
          {
            code: errors.Address.EXACTLY_ONE_PRIMARY_ADDRESS_MUST_BE_SET,
            message: `Exactly one primary address must be set. [${primaryCounter}] found instead.`,
            path: ['addresses']
          }
        ]
      );
    }

    return null;
  },

  /**
   * Location validator
   *
   * @param {array} addresses - the address entities that will be validated
   *
   * @returns {Object|null} - Error
   */
  locationValidator: function locationValidator(addresses) {

    for (let address of addresses) {
      if (address.location) {
        if (address.location.coordinates.length !== 2) {
          return new validationError(
            'Some validation errors occurred.',
            [
              {
                code: errors.Address.INCORRECT_COORDINATE_FORMAT,
                message: `Incorrect coordinates format. Both [longitude] and [latitude] must be set`,
                path: ['addresses', 'location', 'coordinates']
              }
            ]
          );
        } else {
          // https://docs.mongodb.com/manual/reference/geojson/
          // Valid longitude values are between -180 and 180, both inclusive.
          //  Valid latitude values are between -90 and 90 (both inclusive).
          const longitude = address.location.coordinates[0];
          const latitude = address.location.coordinates[1];

          if ((longitude < -180) || (longitude > 180)) {
            return new validationError(
              'Some validation errors occurred.',
              [
                {
                  code: errors.Address.INCORRECT_COORDINATE_FORMAT,
                  message: `Incorrect coordinates format. Longitude [${longitude}] is not within allowed range`,
                  path: ['addresses', 'location', 'coordinates']
                }
              ]
            );
          }

          if ((latitude < -90) || (latitude > 90)) {
            return new validationError(
              'Some validation errors occurred.',
              [
                {
                  code: errors.Address.INCORRECT_COORDINATE_FORMAT,
                  message: `Incorrect coordinates format. Latitude [${latitude}] is not within allowed range`,
                  path: ['addresses', 'location', 'coordinates']
                }
              ]
            );
          }

        }
      }
    }

    return null;
  },

  /**
   * Executes all address create validations 
   *
   * @param {Array} addresses - the address entities that will be validated
   *
   * @returns {Object|null} - Validation error
   */
  validateCreate: async function validateCreate(addresses) {
    let that = this;
    return await new validationChain()
      .add(
        that.addressEitherLocationOrDetailValidator,
        {
          parameters: [addresses]
        }
      )
      .add(
        that.hasPrimaryValidator,
        {
          parameters: [addresses]
        }
      )
      .add(
        that.locationValidator,
        {
          parameters: [addresses],
          async: true
        }
      )
      .add(
        that.addressDetailEitherProvinceOrStateValidator,
        {
          parameters: [addresses],
          async: true
        }
      )
      .add(
        that.addressDetailOnlyProvinceOrStateValidator,
        {
          parameters: [addresses],
          async: true
        }
      )
      .validate({mode: validationChain.modes.EXIT_ON_ERROR});
  },

  /**
   * Executes all address update validations 
   *
   * @param {Array} addresses - the address entities that will be validated
   *
   * @returns {Object|null} - Validation error
   */
  validateUpdate: async function validateUpdate(addresses) {
    let that = this;
    return await new validationChain()
      .add(
        that.addressEitherLocationOrDetailValidator,
        {
          parameters: [addresses]
        }
      )
      .add(
        that.hasPrimaryValidator,
        {
          parameters: [addresses]
        }
      )
      .add(
        that.locationValidator,
        {
          parameters: [addresses],
          async: true
        }
      )
      .add(
        that.addressDetailEitherProvinceOrStateValidator,
        {
          parameters: [addresses],
          async: true
        }
      )
      .add(
        that.addressDetailOnlyProvinceOrStateValidator,
        {
          parameters: [addresses],
          async: true
        }
      )
      .validate({mode: validationChain.modes.EXIT_ON_ERROR});
  }
};



