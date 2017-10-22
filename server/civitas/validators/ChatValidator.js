'use strict';

var validationChain = require('../../libs/ValidationChain');
var validationError = require('../../libs/error/ValidationError');
var errors = require('../../ErrorCodes');
var constants = require('../../Constants');
const Chat = require('../models/Chat');
const User = require('../models/User');

module.exports = {

  /**
   * Validates that no chat with the same name and owner already exist
   *
   * @param {Object} request - The new chat request that will be validated
   *
   * @returns {boolean} - If the validation was successful
   */
  newChatValidator: async function newChatValidator(request) {
    let chat = null;
    try {
      chat = await Chat.findOne(
        {
          name: request.name,
          'owner.item': request.owner.item
        }
      );
    } catch (err) {
      return false;
    }

    return !(chat);
  },

  /**
   * Validates that all the participants exist and their status is active
   *
   * @param {Array} participants - The chat participants that will be validated
   *
   * @returns {boolean} - If the validation was successful
   */
  chatParticipantsValidator: async function chatParticipantsValidator(participants) {
    try {
      for (let userId of participants) {
        let user = await User.findById(userId);
        if(!user || user.status !== constants.user.status.active) {
          return false;
        }
      }

    } catch (err) {
      return false;
    }

    return true;
  },

  /**
   * Validates the chat already exist
   *
   * @param {Object} chat - The chat entity that will be validated
   *
   * @returns {boolean} - If the validation was successful
   */
  existingChatValidator: function existingChatValidator(chat) {
    return (chat ? true : false);
  },

  /**
   * Executes all chat create validations
   *
   * @param {Object} request - The new chat request that will be validated
   *
   * @returns {Object|null} - Validation error
   */
  validateCreate: async function validateCreate(request) {
    let that = this;

    return await new validationChain()
      .add(
        that.newChatValidator,
        {
          parameters: [request],
          error: new validationError(
            'Some validation errors occurred.',
            [
              {
                code: errors.Chat.CHAT_ALREADY_EXISTS,
                message: `A chat with the same name and owner already exists.`,
                path: ['name']
              }
            ]
          ),
          async: true
        }
      )
      .add(
        that.chatParticipantsValidator,
        {
          parameters: [request.participants],
          error: new validationError(
            'Some validation errors occurred.',
            [
              {
                code: errors.Chat.COMMUNITY_ALREADY_EXISTS,
                message: `A chat with the same name already exists.`,
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
   * @param {Chat} chat - The existing chat
   * @param {Object} request - The new user entity that will be validated
   *
   * @returns {Object|null} - Validation error
   */
  validateUpdate: async function validateCreate(chat, request) {
    let that = this;
    return await new validationChain()
      .add(
        that.existingChatValidator,
        {
          parameters: [chat],
          error: new validationError(
            'Some validation errors occurred.',
            [
              {
                code: errors.Chat.COMMUNITY_NOT_FOUND,
                message: `No chat with id [${request.id}] was found.`,
                path: ['id']
              }
            ]
          )
        }
      ).validate({mode: validationChain.modes.EXIT_ON_ERROR});

  }
};