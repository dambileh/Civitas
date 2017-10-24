'use strict';

var chatService = require('../services/ChatService');

/**
 * The chat controller module
 *
 * @module chat
 */
module.exports = {

  /**
   * Calls the corresponding service layer method to create a chat
   *
   * @param {ClientRequest} request - The http request object
   * @param {IncomingMessage} response - The http response object
   * @param {function} next The callback used to pass control to the next action/middleware
   */
  createChat: function createChat(request, response, next) {
    chatService.createChat(request.swagger.params, response, next);
  },

  /**
   * Calls the corresponding service layer method to get all chats
   *
   * @param {ClientRequest} request - The http request object
   * @param {IncomingMessage} response - The http response object
   * @param {function} next The callback used to pass control to the next action/middleware
   */
  getAllChats: function getAllChats(request, response, next) {
    chatService.getAllChats(request.swagger.params, response, next);
  },

  /**
   * Calls the corresponding service layer method to delete a chat
   *
   * @param {ClientRequest} request - The http request object
   * @param {IncomingMessage} response - The http response object
   * @param {function} next The callback used to pass control to the next action/middleware
   */
  deleteChat: function deleteChat(request, response, next) {
    chatService.deleteChat(request.swagger.params, response, next);
  },

  /**
   * Calls the corresponding service layer method to get a single chat
   *
   * @param {ClientRequest} request - The http request object
   * @param {IncomingMessage} response - The http response object
   * @param {function} next The callback used to pass control to the next action/middleware
   */
  getSingleChat: function getSingleChat(request, response, next) {
    chatService.getSingleChat(request.swagger.params, response, next);
  },

  /**
   * Calls the corresponding service layer method to update a chat
   *
   * @param {ClientRequest} request - The http request object
   * @param {IncomingMessage} response - The http response object
   * @param {function} next The callback used to pass control to the next action/middleware
   */
  updateChat: function updateChat(request, response, next) {
    chatService.updateChat(request.swagger.params, response, next);
  }
};