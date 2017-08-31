'use strict';

var contactService = require('../services/ContactService');

/**
 * The User Contact controller module
 *
 * @module User
 */
module.exports = {

  /**
   * Calls the corresponding service layer method to create a Contact
   *
   * @param {ClientRequest} request - The http request object
   * @param {IncomingMessage} response - The http response object
   * @param {function} next The callback used to pass control to the next action/middleware
   *
   * @author Hadi Shayesteh <hadishayesteh@gmail.com>
   * @since 23 Aug 2017
   */
  createContact: function createContact(request, response, next) {
    contactService.createContact(request.swagger.params, response, next);
  }

};