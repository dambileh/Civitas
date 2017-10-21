'use strict';

var communityService = require('../services/CommunityService');

/**
 * The community controller module
 *
 * @module community
 */
module.exports = {

  /**
   * Calls the corresponding service layer method to create a community
   *
   * @param {ClientRequest} request - The http request object
   * @param {IncomingMessage} response - The http response object
   * @param {function} next The callback used to pass control to the next action/middleware
   */
  createCommunity: function createCommunity(request, response, next) {
    communityService.createCommunity(request.swagger.params, response, next);
  },

  /**
   * Calls the corresponding service layer method to get all communities
   *
   * @param {ClientRequest} request - The http request object
   * @param {IncomingMessage} response - The http response object
   * @param {function} next The callback used to pass control to the next action/middleware
   */
  getAllCommunities: function getAllCommunities(request, response, next) {
    communityService.getAllCommunities(request.swagger.params, response, next);
  },

  /**
   * Calls the corresponding service layer method to delete a community
   *
   * @param {ClientRequest} request - The http request object
   * @param {IncomingMessage} response - The http response object
   * @param {function} next The callback used to pass control to the next action/middleware
   */
  deleteCommunity: function deleteCommunity(request, response, next) {
    communityService.deleteCommunity(request.swagger.params, response, next);
  },

  /**
   * Calls the corresponding service layer method to get a single community
   *
   * @param {ClientRequest} request - The http request object
   * @param {IncomingMessage} response - The http response object
   * @param {function} next The callback used to pass control to the next action/middleware
   */
  getSingleCommunity: function getSingleCommunity(request, response, next) {
    communityService.getSingleCommunity(request.swagger.params, response, next);
  },

  /**
   * Calls the corresponding service layer method to update a community
   *
   * @param {ClientRequest} request - The http request object
   * @param {IncomingMessage} response - The http response object
   * @param {function} next The callback used to pass control to the next action/middleware
   */
  updateCommunity: function updateCommunity(request, response, next) {
    communityService.updateCommunity(request.swagger.params, response, next);
  }
};