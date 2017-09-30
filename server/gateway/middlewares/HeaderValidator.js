'use strict';
const validationError = require('../../libs/error/ValidationError');
const errors = require('../../ErrorCodes');

module.exports = {
  /**
   * Validates that the required header parameters are set on the request
   * 
   * @param {Object} req - Teh http request object that carried the header
   * @param {Object} res - The http response object
   * @param {function} next - An instance of Express next method
   */
  validate: function (req, res, next) {

    if (req.swagger) {

      // If the context is expected, ensure that it is set
      if (req.swagger.params.context) {
        if (!req.swagger.params['context-id'].value || !req.swagger.params.context.value) {
          let contextValidationError = new validationError(
            'Some validation errors occurred.',
            [
              {
                code: errors.Global.REQUIRED_HEADER_PARAMS_NOT_SET,
                message: `The required [context] or [context-id] header parameters not set`
              }
            ]
          );

          res.statusCode = 400;
          res.setHeader('Content-Type', 'application/json');
          return res.end(
            JSON.stringify(
              contextValidationError
            )
          );
        }
      }

    }

    return next();
  }
};