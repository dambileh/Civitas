'use strict';

var UserService = require('../services/UserService');

/**
 * The User controller module
 *
 * @module User
 */
module.exports = {

  /**
   * Calls the corresponding service layer method to create a user
   *
   * @param {ClientRequest} request - The http request object
   * @param {IncomingMessage} response - The http response object
   * @param {function} next The callback used to pass control to the next action/middleware
   */
  createUser: function createNote(request, response, next) {
    UserService.createUser(request.swagger.params, response, next);
  },

  /**
   * Calls the corresponding service layer method to get all users
   *
   * @param {ClientRequest} request - The http request object
   * @param {IncomingMessage} response - The http response object
   * @param {function} next The callback used to pass control to the next action/middleware
   */
  getAllUsers: function getAllNotes(request, response, next) {
    UserService.getAllUsers(request.swagger.params, response, next);
  },

  /**
   * Calls the corresponding service layer method to delete a user
   *
   * @param {ClientRequest} request - The http request object
   * @param {IncomingMessage} response - The http response object
   * @param {function} next The callback used to pass control to the next action/middleware
   */
  deleteUser: function deleteNote(request, response, next) {
    UserService.deleteUser(request.swagger.params, response, next);
  },

  /**
   * Calls the corresponding service layer method to get a single user
   *
   * @param {ClientRequest} request - The http request object
   * @param {IncomingMessage} response - The http response object
   * @param {function} next The callback used to pass control to the next action/middleware
   */
  getSingleUser: function getNote(request, response, next) {
    UserService.getSingleUser(request.swagger.params, response, next);
  },

  /**
   * Calls the corresponding service layer method to update a user
   *
   * @param {ClientRequest} request - The http request object
   * @param {IncomingMessage} response - The http response object
   * @param {function} next The callback used to pass control to the next action/middleware
   */
  updateUser: function getNote(request, response, next) {
    UserService.updateUser(request.swagger.params, response, next);
  },

  /**
   * Calls the corresponding service layer method to update a user
   *
   * @param {ClientRequest} request - The http request object
   * @param {IncomingMessage} response - The http response object
   * @param {function} next The callback used to pass control to the next action/middleware
   */
  inviteUser: function getNote(request, response, next) {
    UserService.inviteUser(request.swagger.params, response, next);
  }
};