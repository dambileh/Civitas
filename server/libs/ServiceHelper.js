'use strict';

var validationError = require('./error/ValidationError');
var resourceNotFoundError = require('./error/ResourceNotFoundError');
var authorizationError = require('./error/AuthorizationError');
var runtimeError = require('./error/RuntimeError');
var appUtil = require('./AppUtil');

/**
 * An instance of the service helper
 *
 * @author Hossein Shayesteh <hsh_85@yahoo.com>
 * @since  14 Aug 2017
 *
 * @module ServiceHelper
 */
module.exports = {

  /**
   * Create a context object from the context header
   *
   * @param {string} contextString - The context header value
   *
   * @author Hadi Shayesteh <Hadishayesteh@gmail.com>
   * @since  14 Aug 2017
   *
   * @returns {Object} - A context object in the format {'id': '123', 'type': 'Agency'}
   */
  createContext: function createContext(contextString) {
    var id = '';
    var type = contextString;
    if (contextString.indexOf(' ') != -1) {
      id = contextString.substring(contextString.indexOf(' ') + 1);
      type = contextString.substring(0, contextString.indexOf(' '));
    }
    return {
      'id': id,
      'type': type
    };
  },

  /**
   * This will handle the response errors that we received from the authorization request
   *
   * Some of the errors will be returned to the client and the rest will result in a server side error
   *
   * @param {object} resError - The response error object
   *
   * @author Hadi Shayesteh <Hadishayesteh@gmail.com>
   * @since  14 Aug 2017
   *
   * @return {Error} Return error that will be shown to user
   */
  handleGetListResponseErrors: function handleGetListResponseErrors(resError) {
    // Here we need to decide which of the response errors should be returned back to the client and which one
    // of those should result in a server error
    var triageErrorResponse = resError.body;
    switch (resError.statusCode) {
      case 400:
        return new validationError(triageErrorResponse.message);
      case 401:
        return new authorizationError(triageErrorResponse.message);
      default:
        if (
          !appUtil.isNullOrUndefined(triageErrorResponse) &&
          !appUtil.isNullOrUndefined(triageErrorResponse.message) &&
          !appUtil.isNullOrUndefined(triageErrorResponse.exception)
        ) {
          return new runtimeError(triageErrorResponse.message, triageErrorResponse.exception);
        }
        return new runtimeError('Some unexpected error has happened. Error: ' + JSON.stringify(resError));
    }
  },
  /**
   * This will handle the Triage specific response errors
   *
   * @param {object} resError - The response error object
   *
   * @author Hadi Shayesteh <Hadishayesteh@gmail.com>
   * @since  14 Aug 2017
   *
   * @return {Error} Return error that will be shown to user
   */
  handleTriageGetListResponseErrors: function handleTriageGetListResponseErrors(resError) {
    if (resError.statusCode == 404 && !appUtil.isNullOrUndefined(resError) && !appUtil.isNullOrUndefined(resError.body)) {
      var triageErrorResponse = resError.body;
      return new resourceNotFoundError(
        triageErrorResponse.message,
        triageErrorResponse.exception_message
      );
    }
    return this.handleGetListResponseErrors(resError);
  }
};
