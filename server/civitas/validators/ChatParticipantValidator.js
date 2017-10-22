'use strict';

const validationChain = require('../../libs/ValidationChain');
const validationError = require('../../libs/error/ValidationError');
const errors = require('../../ErrorCodes');
const constants = require('../../Constants');
const User = require('../models/User');

module.exports = {

  /**
   * Validates that all the participants exist and their status is active
   *
   * @param {Array} participants - The chat participants that will be validated
   *
   * @returns {Object|null} - Error
   */
  participantsExistValidator: async function participantsExistValidator(participants) {
    try {
      for (let userId of participants) {
        let user = await User.findById(userId);

        // TODO put the status check back in once https://github.com/dambileh/Civitas/issues/22 is completed
        // if(!user || user.status !== constants.user.status.active) {
        if(!user) {
          return new validationError(
            'Some validation errors occurred.',
            [
              {
                code: errors.Chat.PARTICIPANT_NOT_AVAILABLE,
                message: `Chat participant [${userId}] could not be found or is not active`,
                path: ['participants']
              }
            ]
          );
        }
      }

    } catch (err) {
      return err;
    }

    return null;
  },

  /**
   * Executes all chat participant validations
   *
   * @param {Object} request - The new chat request that will be validated
   *
   * @returns {Object|null} - Validation error
   */
  validate: async function validate(request) {
    let that = this;

    return await new validationChain()
      .add(
        that.participantsExistValidator,
        {
          parameters: [request.participants],
          async: true
        }
      )
      .validate({mode: validationChain.modes.EXIT_ON_ERROR});
  }

};