'use strict';

var validationChain = require('../../libs/ValidationChain');
var validationError = require('../../libs/error/ValidationError');
var errors = require('../../ErrorCodes');
const Community = require('../models/Community');

module.exports = {

  /**
   * Validates that no community with the same name already exist
   *
   * @param {string} name - The name of the community that will be validated
   *
   * @returns {Object|null} - Error
   */
  newCommunityValidator: async function newCommunityValidator(name) {
    let community = null;
    try {
      community = await Community.findOne(
        {
          name: name
        }
      );
    } catch (err) {
      return err;
    }

    if (community) {
      return new validationError(
        'Some validation errors occurred.',
        [
          {
            code: errors.Community.COMMUNITY_ALREADY_EXISTS,
            message: `A community with the same name [${name}] already exists.`,
            path: ['name']
          }
        ]
      )
    }

    return null;
  },

  /**
   * Validates the community already exist
   *
   * @param {Object} community - The community entity that will be validated
   * @param {Object} request - The new user entity that will be validated
   *
   * @returns {Object|null} - Error
   */
  existingCommunityValidator: function existingCommunityValidator(community, request) {

    if (!community) {
      return new validationError(
        'Some validation errors occurred.',
        [
          {
            code: errors.Community.COMMUNITY_NOT_FOUND,
            message: `No community with id [${request.id}] was found.`,
            path: ['id']
          }
        ]
      )
    }

    return null;
  },

  /**
   * Executes all community create validations
   *
   * @param {Object} request - The new community request that will be validated
   *
   * @returns {Object|null} - Validation error
   */
  validateCreate: async function validateCreate(request) {
    let that = this;

    return await new validationChain()
      .add(
        that.newCommunityValidator,
        {
          parameters: [request.name],
          async: true
        }
      )
      .validate({mode: validationChain.modes.EXIT_ON_ERROR});
  },

  /**
   * Executes all user update validations
   *
   * @param {Community} community - The existing community
   * @param {Object} request - The new user entity that will be validated
   *
   * @returns {Object|null} - Validation error
   */
  validateUpdate: async function validateCreate(community, request) {
    let that = this;
    return await new validationChain()
      .add(
        that.existingCommunityValidator,
        {
          parameters: [community, request]
        }
      ).validate({mode: validationChain.modes.EXIT_ON_ERROR});

  }
};