'use strict';

var companyService = require('../services/CompanyService');

/**
 * The Company controller module
 *
 * @module Company
 */
module.exports = {

  /**
   * Calls the corresponding service layer method to create a company
   *
   * @param {ClientRequest} request - The http request object
   * @param {IncomingMessage} response - The http response object
   * @param {function} next The callback used to pass control to the next action/middleware
   */
  createCompany: function createCompany(request, response, next) {
    companyService.createCompany(request.swagger.params, response, next);
  },

  /**
   * Calls the corresponding service layer method to get all companies
   *
   * @param {ClientRequest} request - The http request object
   * @param {IncomingMessage} response - The http response object
   * @param {function} next The callback used to pass control to the next action/middleware
   */
  getAllCompanies: function getAllCompanies(request, response, next) {
    companyService.getAllCompanies(request.swagger.params, response, next);
  },

  /**
   * Calls the corresponding service layer method to delete a company
   *
   * @param {ClientRequest} request - The http request object
   * @param {IncomingMessage} response - The http response object
   * @param {function} next The callback used to pass control to the next action/middleware
   */
  deleteCompany: function deleteCompany(request, response, next) {
    companyService.deleteCompany(request.swagger.params, response, next);
  },

  /**
   * Calls the corresponding service layer method to get a single company
   *
   * @param {ClientRequest} request - The http request object
   * @param {IncomingMessage} response - The http response object
   * @param {function} next The callback used to pass control to the next action/middleware
   */
  getSingleCompany: function getSingleCompany(request, response, next) {
    companyService.getSingleCompany(request.swagger.params, response, next);
  },

  /**
   * Calls the corresponding service layer method to update a company
   *
   * @param {ClientRequest} request - The http request object
   * @param {IncomingMessage} response - The http response object
   * @param {function} next The callback used to pass control to the next action/middleware
   */
  updateCompany: function updateCompany(request, response, next) {
    companyService.updateCompany(request.swagger.params, response, next);
  }
};