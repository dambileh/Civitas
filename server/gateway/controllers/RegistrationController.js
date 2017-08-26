/**
 * Created by kevinfeng on 2017/08/26.
 */

'use strict';

var RegistrationService = require('../services/RegistrationService');

/**
 * The Registration controller module
 *
 * @module Registration
 */
module.exports = {

    /**
     * Calls the corresponding service layer method to confirm registration
     *
     * @param {ClientRequest} request - The http request object
     * @param {IncomingMessage} response - The http response object
     * @param {function} next The callback used to pass control to the next action/middleware
     */
    confirmRegistration: function confirmRegistration(request, response, next) {
        RegistrationService.confirmRegistration(request.swagger.params, response, next);
    }
};