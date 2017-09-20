'use strict';

module.exports = {

  /**
   * Gets the system status
   *
   * @param {object} args - The request arguments passed in from the controller
   * @param {IncomingMessage} res - The http response object
   * @param {function} next - The callback used to pass control to the next action/middleware
   *
   * @author Hadi Shayesteh <Hadishayesteh@gmail.com>
   * @since  14 Aug 2017
   */
  getSystemStatus: function getSystemStatus(args, res, next) {
    var objStatus = {
      "up_time": process.uptime()
    };

    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(objStatus));

  }
};

