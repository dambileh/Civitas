'use strict';

const validationChain = require('../../libs/ValidationChain');
const validationError = require('../../libs/error/ValidationError');
const errors = require('../../ErrorCodes');
const constants = require('../../Constants');
const User = require('../models/User');

module.exports = {

  /**
   * Validates that the minimum number of participants have been passed
   *
   * @param {Object} request - The new chat request that will be validated
   *
   * @returns {Object|null} - Error
   */
  hasMinimumParticipantsValidator: function hasMinimumParticipantsValidator(request) {

    if (!(request.participants.length > 1)) {
      return new validationError(
        'Some validation errors occurred.',
        [
          {
            code: errors.Chat.PARTICIPANTS_MINIMUM_LIMIT_NOT_REACHED,
            message: `A chat must have at least [2] participants, found [${request.participants.length}] instead`,
            path: ['participants']
          }
        ]
      );
    }

    return null;
  },


  /**
   * Validates that the no duplicate participant has been passed
   *
   * @param {Object} request - The new chat request that will be validated
   *
   * @returns {Object|null} - Error
   */
  hasUniqueParticipantsValidator: function hasUniqueParticipantsValidator(request) {

    if (request.participants.length !== request.participants.unique().length) {
      return new validationError(
        'Some validation errors occurred.',
        [
          {
            code: errors.Chat.DUPLICATE_PARTICIPANTS_FOUND,
            message: `Duplicate participants found`,
            path: ['participants']
          }
        ]
      );
    }

    return null;
  },

  /**
   * Validates that all the participants exist and their status is active
   *
   * @param {Object} request - The new chat request that will be validated
   *
   * @returns {Object|null} - Error
   */
  participantsExistValidator: async function participantsExistValidator(request) {
    try {
      for (let userId of request.participants) {
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
   * Validates that a friend chat can only have 2 participants
   *
   * @param {Object} request - The new chat request that will be validated
   *
   * @returns {Object|null} - Error
   */
  friendChatParticipantsValidator: function friendChatParticipantsValidator(request) {
    if (
      request.type === constants.chat.chatTypes.friend &&
        request.participants.length !== 2
    ) {
      return new validationError(
        'Some validation errors occurred.',
        [
          {
            code: errors.Chat.PARTICIPANTS_MAXIMUM_LIMIT_REACHED,
            message: `A [friend] chat must have [2] participants, found [${request.participants.length}] instead`,
            path: ['participants']
          }
        ]
      );
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
        that.hasMinimumParticipantsValidator,
        {
          parameters: [request]
        }
      )
      .add(
        that.hasUniqueParticipantsValidator,
        {
          parameters: [request]
        }
      )
      .add(
        that.participantsExistValidator,
        {
          parameters: [request],
          async: true
        }
      )
      .add(
        that.friendChatParticipantsValidator,
        {
          parameters: [request]
        }
      )
      .validate({mode: validationChain.modes.EXIT_ON_ERROR});
  }

};