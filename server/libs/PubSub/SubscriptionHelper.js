var constants = require('../../Constants');
var Message = require('../../libs/PubSub/Message');
var PubSub = require('../../libs/PubSub/PubSubAdapter');

function emitCRUDEvents(message, channel, internalEmitter) {

  internalEmitter.on(channel.Internal.CreateCompletedEvent, function(response){
    _sendCrudCompleted(message, response, channel, constants.pubSub.messageAction.create, internalEmitter);
  });

  internalEmitter.on(channel.Internal.UpdateCompletedEvent, function(response) {
    _sendCrudCompleted(message, response, channel, constants.pubSub.messageAction.update, internalEmitter);
  });

  internalEmitter.on(channel.Internal.DeleteCompletedEvent, function(response){
    _sendCrudCompleted(message, response, channel, constants.pubSub.messageAction.delete, internalEmitter);
  });

  internalEmitter.on(channel.Internal.GetSingleCompletedEvent, function(response){
    _sendCrudCompleted(message, response, channel, constants.pubSub.messageAction.getSingle, internalEmitter);
  });

  internalEmitter.on(channel.Internal.GetAllCompletedEvent, function(response){
    _sendCrudCompleted(message, response, channel, constants.pubSub.messageAction.getAll, internalEmitter);
  });

  switch (message.action) {
    case "create":
      internalEmitter.emit(channel.Internal.CreateEvent, message.payload);
      break;
    case "update":
      internalEmitter.emit(channel.Internal.UpdateEvent, message.payload);
      break;
    case "delete":
      internalEmitter.emit(channel.Internal.DeleteEvent, message.payload);
      break;
    case "getSingle":
      internalEmitter.emit(channel.Internal.GetSingleEvent, message.payload);
      break;
    case "getAll":
      internalEmitter.emit(channel.Internal.GetAllEvent, message.payload);
      break;
    default:
      logging.logAction(logging.logLevels.ERROR, "Type [%s] is not supported", message.type)
  }
}

function _sendCrudCompleted(request, response, channel, action, internalEmitter) {

  // pass the same messageId that was set on the request so that the gateway can map the completed event back to 
  // the original event
  var completedResponse = new Message(
    channel.External.CompletedEvent,
    constants.pubSub.messageType.crud,
    action,
    response,
    request.header.messageId 
  );

  PubSub.publish(completedResponse, channel.External.CompletedEvent);
  _removeAllCRUDListeners(channel, internalEmitter);
}

function _removeAllCRUDListeners(channel, internalEmitter) {
  internalEmitter.removeAllListeners(channel.Internal.CreateCompletedEvent);
  internalEmitter.removeAllListeners(channel.Internal.UpdateCompletedEvent);
  internalEmitter.removeAllListeners(channel.Internal.DeleteCompletedEvent);
  internalEmitter.removeAllListeners(channel.Internal.GetSingleCompletedEvent);
  internalEmitter.removeAllListeners(channel.Internal.GetAllCompletedEvent);
}

module.exports = {
  emitCRUDEvents: emitCRUDEvents
};
