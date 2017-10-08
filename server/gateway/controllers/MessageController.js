'use strict';

var url = require('url');
var messageService = require('../services/MessageService');

/**
 * Calls the corresponding service layer method to get system status
 *
 * @param {ClientRequest} req - The http request object
 * @param {IncomingMessage} res - The http response object
 * @param {function} next The callback used to pass control to the next action/middleware
 *
 * @author Hadi Shayesteh <Hadishayesteh@gmail.com>
 * @since  14 Aug 2017
 */
module.exports.sendMessage = function sendMessage(req, res, next) {
  messageService.sendMessage(req.swagger.params, res, next);
};
