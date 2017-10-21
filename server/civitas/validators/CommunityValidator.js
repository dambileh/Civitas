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
   * @returns {boolean} - If the validation was successful
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
      return false;
    }

    return !(community);
  },

  /**
   * Validates the community already exist
   *
   * @param {Object} community - The community entity that will be validated
   *
   * @returns {boolean} - If the validation was successful
   */
  existingCommunityValidator: function existingCommunityValidator(community) {
    return (community ? true : false);
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
          error: new validationError(
            'Some validation errors occurred.',
            [
              {
                code: errors.Community.COMMUNITY_ALREADY_EXISTS,
                message: `A community with the same name already exists.`,
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
          parameters: [community],
          error: new validationError(
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
      ).validate({mode: validationChain.modes.EXIT_ON_ERROR});

  }
};