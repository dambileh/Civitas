var constants = require('../../Constants');
var message = require('../../libs/PubSub/Message');
var pubSub = require('../../libs/PubSub/PubSubAdapter');

/**
 * Emits the passed message as an internal CRUD events
 *
 * @param {object} message - The message that will be emitted
 * @param {string} channelDetails - Contains the external channelDetails details
 * @param {string} internalEmitter - An instance of the internal emitter
 */
function emitCRUDEvents(message, channelDetails, internalEmitter) {

  internalEmitter.on(channelDetails.Internal.CreateCompletedEvent, function(response){
    _sendCrudCompleted(message, response, channelDetails, constants.pubSub.messageAction.create, internalEmitter);
  });

  internalEmitter.on(channelDetails.Internal.UpdateCompletedEvent, function(response) {
    _sendCrudCompleted(message, response, channelDetails, constants.pubSub.messageAction.update, internalEmitter);
  });

  internalEmitter.on(channelDetails.Internal.DeleteCompletedEvent, function(response){
    _sendCrudCompleted(message, response, channelDetails, constants.pubSub.messageAction.delete, internalEmitter);
  });

  internalEmitter.on(channelDetails.Internal.GetSingleCompletedEvent, function(response){
    _sendCrudCompleted(message, response, channelDetails, constants.pubSub.messageAction.getSingle, internalEmitter);
  });

  internalEmitter.on(channelDetails.Internal.GetAllCompletedEvent, function(response){
    _sendCrudCompleted(message, response, channelDetails, constants.pubSub.messageAction.getAll, internalEmitter);
  });

  switch (message.action) {
    case constants.pubSub.messageAction.create:
      internalEmitter.emit(channelDetails.Internal.CreateEvent, message.payload);
      break;
    case constants.pubSub.messageAction.update:
      internalEmitter.emit(channelDetails.Internal.UpdateEvent, message.payload);
      break;
    case constants.pubSub.messageAction.delete:
      internalEmitter.emit(channelDetails.Internal.DeleteEvent, message.payload);
      break;
    case constants.pubSub.messageAction.getSingle:
      internalEmitter.emit(channelDetails.Internal.GetSingleEvent, message.payload);
      break;
    case constants.pubSub.messageAction.getAll:
      internalEmitter.emit(channelDetails.Internal.GetAllEvent, message.payload);
      break;
    default:
      logging.logAction(logging.logLevels.ERROR, `Type [${message.type}] is not supported`)
  }
}

/**
 * Publishes an external CRUD completed event
 *
 * @param {object} request - The original CRUD request object
 * @param {object} response - The CRUD response object
 * @param {string} channelDetails - Contains the external channelDetails details
 * @param {string} action - The CRUD action that was specified on the request
 * @param {object} internalEmitter - An instance of the internal event emitter
 *
 * @private
 */
function _sendCrudCompleted(request, response, channelDetails, action, internalEmitter) {

  // pass the same messageId that was set on the request so that the gateway can map the completed event back to 
  // the original event
  var completedResponse = new message(
    channelDetails.External.CompletedEvent,
    constants.pubSub.messageType.crud,
    action,
    response,
    request.header.messageId 
  );

  pubSub.publish(completedResponse, channelDetails.External.CompletedEvent);
  _removeAllCRUDListeners(channelDetails, internalEmitter);
}

/**
 * Removed the internal event listeners
 *
 * @param {string} channelDetails - Contains the external channelDetails details
 * @param {object} internalEmitter - An instance of the internal event emitter
 *
 * @private
 */
function _removeAllCRUDListeners(channelDetails, internalEmitter) {
  internalEmitter.removeAllListeners(channelDetails.Internal.CreateCompletedEvent);
  internalEmitter.removeAllListeners(channelDetails.Internal.UpdateCompletedEvent);
  internalEmitter.removeAllListeners(channelDetails.Internal.DeleteCompletedEvent);
  internalEmitter.removeAllListeners(channelDetails.Internal.GetSingleCompletedEvent);
  internalEmitter.removeAllListeners(channelDetails.Internal.GetAllCompletedEvent);
}

module.exports = {
  emitCRUDEvents: emitCRUDEvents
};
