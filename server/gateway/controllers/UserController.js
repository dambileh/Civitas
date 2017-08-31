'use strict';

var userService = require('../services/UserService');

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
  createUser: function createUser(request, response, next) {
    userService.createUser(request.swagger.params, response, next);
  },

  /**
   * Calls the corresponding service layer method to get all users
   *
   * @param {ClientRequest} request - The http request object
   * @param {IncomingMessage} response - The http response object
   * @param {function} next The callback used to pass control to the next action/middleware
   */
  getAllUsers: function getAllUsers(request, response, next) {
    userService.getAllUsers(request.swagger.params, response, next);
  },

  /**
   * Calls the corresponding service layer method to delete a user
   *
   * @param {ClientRequest} request - The http request object
   * @param {IncomingMessage} response - The http response object
   * @param {function} next The callback used to pass control to the next action/middleware
   */
  deleteUser: function deleteUser(request, response, next) {
    userService.deleteUser(request.swagger.params, response, next);
  },

  /**
   * Calls the corresponding service layer method to get a single user
   *
   * @param {ClientRequest} request - The http request object
   * @param {IncomingMessage} response - The http response object
   * @param {function} next The callback used to pass control to the next action/middleware
   */
  getSingleUser: function getSingleUser(request, response, next) {
    userService.getSingleUser(request.swagger.params, response, next);
  },

  /**
   * Calls the corresponding service layer method to update a user
   *
   * @param {ClientRequest} request - The http request object
   * @param {IncomingMessage} response - The http response object
   * @param {function} next The callback used to pass control to the next action/middleware
   */
  updateUser: function updateUser(request, response, next) {
    userService.updateUser(request.swagger.params, response, next);
  }
};