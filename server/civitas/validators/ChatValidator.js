'use strict';

const validationChain = require('../../libs/ValidationChain');
const validationError = require('../../libs/error/ValidationError');
const errors = require('../../ErrorCodes');
const Chat = require('../models/Chat');

module.exports = {

  /**
   * Validates that no chat with the same name and owner already exist
   *
   * @param {Object} request - The new chat request that will be validated
   *
   * @returns {Object|null} - Error
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
      return err;
    }
    
    if (chat) {
      return new validationError(
        'Some validation errors occurred.',
        [
          {
            code: errors.Chat.CHAT_ALREADY_EXISTS,
            message: `A chat with the same name [${request.name}] and owner [${request.owner.item}] already exists.`,
            path: ['name']
          }
        ]
      );
    }

    return null;
  },

  /**
   * Validates the chat already exist
   *
   * @param {Object} chat - The chat entity that will be validated
   * @param {Object} request - The new user entity that will be validated
   * 
   * @returns {Object|null} - Error
   */
  existingChatValidator: function existingChatValidator(chat, request) {
    if (!chat) {
      return new validationError(
        'Some validation errors occurred.',
        [
          {
            code: errors.Chat.CHAT_NOT_FOUND,
            message: `No chat with id [${request.id}] was found.`,
            path: ['id']
          }
        ]
      );
    }
    
    return null;
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
    
    let chain = new validationChain();

    chain.add(
      that.existingChatValidator,
      {
        parameters: [chat, request]
      }
    );

    if (request.name) {
      chain.add(
        that.newChatValidator,
        {
          parameters: [request],
          async: true
        }
      )
    }
    
    return await chain.validate({mode: validationChain.modes.EXIT_ON_ERROR});
  }
};