'use strict';

var util = require('util');

/**
 * The Server Error module
 *
 * @author Hossein Shayesteh <hsh_85@yahoo.com>
 * @since  14 Aug 2017
 *
 * @module ServerError
 */
module.exports = function ServerError(err) {
  Error.call(this);
  this.code = 'INTERNAL_SERVER_ERROR';
  var errorMessage = 'Server encountered an internal error and was unable to complete your request';

  if (err.message !== undefined) {
    errorMessage = err.message;
  }
  this.message = errorMessage;

  if (err.stack !== undefined) {
    this.stack = err.stack;
  }
};

util.inherits(module.exports, Error);
