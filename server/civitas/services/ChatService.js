'use strict';

const Chat = require('../models/Chat');
const resourceNotFoundError = require('../../libs/error/ResourceNotFoundError');
const validationError = require('../../libs/error/ValidationError');
const appUtil = require('../../libs/AppUtil');
const logging = require('../utilities/Logging');
const config = require('config');
const internalEventEmitter = require('../../libs/InternalEventEmitter');
const chatChannels = require('../../PubSubChannels').Chat;
const errors = require('../../ErrorCodes');
const ownerValidator = require('../validators/OwnerValidator');
const chatValidator = require('../validators/ChatValidator');
const chatParticipantValidator = require('../validators/ChatParticipantValidator');

/**
 * The Chat Service module
 */
module.exports = {

  /**
   * Creates a chat
   *
   * @param {object} request - The request that was sent from the controller
   */
  createChat: async function createChat(request) {
    //Validate the owner
    let ownerValidationResult = await ownerValidator.validateRequest(request.owner, ['user', 'community']);

    if (ownerValidationResult) {
      return internalEventEmitter.emit(
        chatChannels.Internal.CreateCompletedEvent,
        {
          statusCode: 400,
          body: ownerValidationResult
        }
      );
    }

    // Validate the request
    var chatValidationResult = await chatValidator.validateCreate(request);

    if (chatValidationResult) {
      return internalEventEmitter.emit(
        chatChannels.Internal.CreateCompletedEvent,
        {
          statusCode: 400,
          body: chatValidationResult
        }
      );
    }

    // Validate the participants
    var chatParticipantValidationResult = await chatParticipantValidator.validate(request);

    if (chatParticipantValidationResult) {
      return internalEventEmitter.emit(
        chatChannels.Internal.CreateCompletedEvent,
        {
          statusCode: 400,
          body: chatParticipantValidationResult
        }
      );
    }

    let chatModel = null;

    try {
      chatModel = new Chat(request);
    } catch (error) {
      return internalEventEmitter.emit(
        chatChannels.Internal.CreateCompletedEvent,
        {
          statusCode: 500,
          body: error
        }
      );
    }

    logging.logAction(
      logging.logLevels.INFO,
      'Attempting to save a new Chat document'
    );

    await chatModel.save();

    return internalEventEmitter.emit(
      chatChannels.Internal.CreateCompletedEvent,
      {
        statusCode: 201,
        body: chatModel
      }
    );
  },

  /**
   * Returns all chats
   *
   * @param {object} request - The request arguments passed in from the controller
   */
  getAllChats: async function getAllCommunites(request) {
    //Validate the owner
    let ownerValidationResult = await ownerValidator.validateRequest(request.owner, ['user', 'community']);
    if (ownerValidationResult) {
      return internalEventEmitter.emit(
        chatChannels.Internal.CreateCompletedEvent,
        {
          statusCode: 400,
          body: ownerValidationResult
        }
      );
    }

    logging.logAction(
      logging.logLevels.INFO,
      'Attempting to retrieve all chats'
    );

    let chats = null;

    try {
      chats = await Chat
        .find({'owner.item': request.owner.item})
        .populate('participants')
        .populate('owner.item');

    } catch (err) {
      return internalEventEmitter.emit(
        chatChannels.Internal.GetAllCompletedEvent,
        {
          statusCode: 500,
          body: err
        }
      );
    }

    let statusCode = 200;

    // If the array is empty we need to return a 204 response.
    if (appUtil.isArrayEmpty(chats)) {
      statusCode = 204;
    }

    return internalEventEmitter.emit(
      chatChannels.Internal.GetAllCompletedEvent,
      {
        statusCode: statusCode,
        header: {
          resultCount: chats.length
        },
        body: chats
      }
    );
  },

  /**
   * Returns a single chat
   *
   * @param {object} request - The request that was sent from the controller
   */
  getSingleChat: async function getSingleChat(request) {
    //Validate the owner
    let ownerValidationResult = await ownerValidator.validateRequest(request.owner, ['user', 'community']);
    if (ownerValidationResult) {
      return internalEventEmitter.emit(
        chatChannels.Internal.CreateCompletedEvent,
        {
          statusCode: 400,
          body: ownerValidationResult
        }
      );
    }

    logging.logAction(
      logging.logLevels.INFO,
      'Attempting to get a single chat'
    );

    let chat = null;

    try {
      chat = await Chat
        .findById(request.id)
        .populate('participants')
        .populate('owner.item');

    } catch (err) {
      return internalEventEmitter.emit(
        chatChannels.Internal.GetSingleCompletedEvent,
        {
          statusCode: 500,
          body: err
        }
      );
    }

    if (appUtil.isNullOrUndefined(chat)) {

      var notFoundError = new resourceNotFoundError(
        'Resource not found.',
        `No chat with id [${request.id}] was found`
      );

      return internalEventEmitter.emit(
        chatChannels.Internal.GetSingleCompletedEvent,
        {
          statusCode: 404,
          body: notFoundError
        }
      );
    }

    // Validate the existing owner
    let existingOwnerValidationResult = await ownerValidator.validateExisting(
      request.owner.item,
      chat.owner.item._id
    );

    if (existingOwnerValidationResult) {
      return internalEventEmitter.emit(
        chatChannels.Internal.CreateCompletedEvent,
        {
          statusCode: 401,
          body: existingOwnerValidationResult
        }
      );
    }

    return internalEventEmitter.emit(
      chatChannels.Internal.GetSingleCompletedEvent,
      {
        statusCode: 200,
        body: chat
      }
    );
  },

  /**
   * Deletes a chat
   *
   * @param {object} request - The request arguments passed in from the controller
   */
  deleteChat: async function deleteChat(request) {
    //Validate the owner
    let ownerValidationResult = await ownerValidator.validateRequest(request.owner, ['user', 'community']);
    if (ownerValidationResult) {
      return internalEventEmitter.emit(
        chatChannels.Internal.CreateCompletedEvent,
        {
          statusCode: 400,
          body: ownerValidationResult
        }
      );
    }

    let chat = null;
    try {
      chat = await Chat
        .findById(request.id)
        .populate('participants')
        .populate('owner.item');

    } catch (err) {
      return internalEventEmitter.emit(
        chatChannels.Internal.DeleteCompletedEvent,
        {
          statusCode: 500,
          body: err
        }
      );
    }

    if (appUtil.isNullOrUndefined(chat)) {
      var modelValidationError = new validationError(
        'Some validation errors occurred.',
        [
          {
            code: errors.Chat.CHAT_NOT_FOUND,
            message: `No chat with id [${request.id}] was found.`,
            path: ['id']
          }
        ]
      );

      return internalEventEmitter.emit(
        chatChannels.Internal.DeleteCompletedEvent,
        {
          statusCode: 400,
          body: modelValidationError
        }
      );
    }

    // Validate the existing owner
    let existingOwnerValidationResult = await ownerValidator.validateExisting(
      request.owner.item,
      chat.owner.item._id
    );

    if (existingOwnerValidationResult) {
      return internalEventEmitter.emit(
        chatChannels.Internal.CreateCompletedEvent,
        {
          statusCode: 401,
          body: existingOwnerValidationResult
        }
      );
    }

    logging.logAction(
      logging.logLevels.INFO,
      'Attempting to remove a chat document'
    );

    try {
      await chat.remove();
    } catch (err) {
      return internalEventEmitter.emit(
        chatChannels.Internal.DeleteCompletedEvent,
        {
          statusCode: 500,
          body: err
        }
      );
    }

    return internalEventEmitter.emit(
      chatChannels.Internal.DeleteCompletedEvent,
      {
        statusCode: 200,
        body: chat
      }
    );
  },

  /**
   * Updates a chat
   *
   * @param {object} request - The request arguments passed in from the controller
   */
  updateChat: async function updateChat(request) {
    //Validate the owner
    let ownerValidationResult = await ownerValidator.validateRequest(request.owner, ['user', 'community']);
    if (ownerValidationResult) {
      return internalEventEmitter.emit(
        chatChannels.Internal.CreateCompletedEvent,
        {
          statusCode: 400,
          body: ownerValidationResult
        }
      );
    }

    let chat = null;

    try {
      chat = await Chat
        .findById(request.id)
        .populate('participants')
        .populate('owner.item');

    } catch (err) {
      return internalEventEmitter.emit(
        chatChannels.Internal.UpdateCompletedEvent,
        {
          statusCode: 500,
          body: err
        }
      );
    }

    var validationResult = await chatValidator.validateUpdate(chat, request);

    if (validationResult) {
      return internalEventEmitter.emit(
        chatChannels.Internal.CreateCompletedEvent,
        {
          statusCode: 400,
          body: validationResult
        }
      );
    }

    // Validate the existing owner
    let existingOwnerValidationResult = await ownerValidator.validateExisting(
      request.owner.item,
      chat.owner.item._id
    );

    if (existingOwnerValidationResult) {
      return internalEventEmitter.emit(
        chatChannels.Internal.CreateCompletedEvent,
        {
          statusCode: 401,
          body: existingOwnerValidationResult
        }
      );
    }

    if (request.participants) {
      // Set the existing chat type on the request since it is required for validation
      request.type = chat.type;
      
      // Validate the the participants
      var chatParticipantValidationResult = await chatParticipantValidator.validate(request);

      if (chatParticipantValidationResult) {
        return internalEventEmitter.emit(
          chatChannels.Internal.CreateCompletedEvent,
          {
            statusCode: 400,
            body: chatParticipantValidationResult
          }
        );
      }

      chat.participants = request.participants;
    }

    if (request.name) {
      chat.name = request.name;
    }

    if (request.description) {
      chat.description = request.description;
    }

    if (request.avatarId) {
      chat.avatarId = request.avatarId;
    }

    logging.logAction(
      logging.logLevels.INFO,
      `Attempting to update a chat document with id [${chat.id}]`
    );

    try {
      await chat.save();
    } catch (err) {
      return internalEventEmitter.emit(
        chatChannels.Internal.UpdateCompletedEvent,
        {
          statusCode: 500,
          body: err
        }
      );
    }

    chat.updatedAt = new Date();

    // set the address objects back on the display response
    return internalEventEmitter.emit(
      chatChannels.Internal.UpdateCompletedEvent,
      {
        statusCode: 200,
        body: chat
      }
    );
  }
};