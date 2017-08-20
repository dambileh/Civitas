var constants = require('../../constants');
var Message = require('../../libs/PubSub/Message');
var PubSub = require('../../libs/PubSub/PubSubAdapter');

function _emitCRUDEvents(message, channel, internalEmitter) {

  internalEmitter.on(channel.Internal.CreateCompletedEvent, function(response){
    _sendCrudCompleted(response, channel, constants.pub_sub.message_action.create, internalEmitter);
  });

  internalEmitter.on(channel.Internal.UpdateCompletedEvent, function(response) {
    _sendCrudCompleted(response, channel, constants.pub_sub.message_action.update, internalEmitter);
  });

  internalEmitter.on(channel.Internal.DeleteCompletedEvent, function(response){
    _sendCrudCompleted(response, channel, constants.pub_sub.message_action.delete, internalEmitter);
  });

  internalEmitter.on(channel.Internal.GetSingleCompletedEvent, function(response){
    _sendCrudCompleted(response, channel, constants.pub_sub.message_action.getSingle, internalEmitter);
  });

  internalEmitter.on(channel.Internal.GetAllCompletedEvent, function(response){
    _sendCrudCompleted(response, channel, constants.pub_sub.message_action.getAll, internalEmitter);
  });

  switch (message.action) {
    case "create":
      internalEmitter.emit(channel.Internal.CreateEvent, message);
      break;
    case "update":
      internalEmitter.emit(channel.Internal.UpdateEvent, message);
      break;
    case "delete":
      internalEmitter.emit(channel.Internal.DeleteEvent, message);
      break;
    case "getSingle":
      internalEmitter.emit(channel.Internal.GetSingleEvent, message);
      break;
    case "getAll":
      internalEmitter.emit(channel.Internal.GetAllEvent, message);
      break;
    default:
      logging.logAction(logging.logLevels.ERROR, "Type [%s] is not supported", message.type)
  }
}

function _sendCrudCompleted(response, channel, action, internalEmitter) {
  var completedResponse = new Message(
    channel.External.CompletedEvent,
    constants.pub_sub.message_type.crud,
    action,
    response
  );
  PubSub.publish(channel.External.CompletedEvent, completedResponse);
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
  emitCRUDEvents: _emitCRUDEvents
};
