'use strict';

var resourceNotFoundError = require('../../libs/error/ResourceNotFoundError');
var appUtil = require('../../libs/AppUtil');
var logging = require('../utilities/Logging');
var config = require('config');
var _ = require('lodash');
var internalEventEmitter = require('../../libs/InternalEventEmitter');
var messageHubChannels = require('../../PubSubChannels').MessageHub;
var errors = require('../../ErrorCodes');
var constants = require('../../Constants');
let socketManager = require('../managers/SocketManager');
/**
 * The User Service module
 */
module.exports = {
  /**
   * Updates a user
   *
   * @param {object} request - The request arguments passed in from the controller
   */
  sendMessage: async function sendMessage(request) {
    console.log("REQUEST:", request);
    const io_s = socketManager.getSocket();
    const io = io_s.of('mynamespace');

    io.emit("my-channel", request);


    return internalEventEmitter.emit(
      messageHubChannels.Internal.SendMessageCompletedEvent,
      {
        statusCode: 200,
        body: {
          status: request.message
        }
      }
    );
  }
};