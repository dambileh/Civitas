'use strict';
const validationError = require('../../libs/error/ValidationError');
const errors = require('../../ErrorCodes');
const validationChain = require('../../libs/ValidationChain');

module.exports = {
  /**
   * Validates that the http request
   * 
   * @param {Object} req - The http request object
   * @param {Object} res - The http response object
   * @param {function} next - An instance of Express next method
   */
  validate: async function (req, res, next) {
    let error = await new validationChain()
      .add(
        _validateHeader,
        {
          parameters: [req]
        }
      )
      .add(
        _validateIdInRequest,
        {
          parameters: [req]
        }
      )
      .validate({mode: validationChain.modes.EXIT_ON_ERROR});

    if (error) {
      res.statusCode = 400;
      res.setHeader('Content-Type', 'application/json');
      return res.end(
        JSON.stringify(
          error
        )
      );
    } else {
      return next();
    }

  }
};

/**
 * Validates that the required header parameters are set on the request
 *
 * @param {Object} request - The http request object that carries the header
 *
 * @returns {Object|null} - Error
 */
function _validateHeader(request) {

  if (request.swagger) {

    // If the context is expected, ensure that it is set
    if (request.swagger.params.context) {
      if (!request.swagger.params['context-id'].value || !request.swagger.params.context.value) {
        return new validationError(
          'Some validation errors occurred.',
          [
            {
              code: errors.Global.REQUIRED_HEADER_PARAMS_NOT_SET,
              message: `The required [context] or [context-id] header parameters not set`
            }
          ]
        );
      }
    }
  }

  return null;
}

/**
 * Validates that the passed in in the request is a valid mongo id
 *
 * @param {Object} request - The http request object that carried the header
 *
 * @returns {Object|null} - Error
 */
function _validateIdInRequest(request) {
  let error = null;

  if (request.swagger) {
    const uuidRegEx = /^(?=[a-f\d]{24}$)(\d+[a-f]|[a-f]+\d)/i;

    for (let [key, param] of request.swagger.params.getProperties()) {
      // do something with key|value
      if (param.schema && param.schema.format && (param.schema.format === 'uuid')) {
        if(!uuidRegEx.test(param.value)) {
          error = new validationError(
            'Some validation errors occurred.',
            [
              {
                code: errors.Global.ID_IN_REQUEST_NOT_VALID,
                message: `Invalid [id] found in path or header`
              }
            ]
          );
        }
      }
    }
  }

  return error;
}
