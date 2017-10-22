'use strict';

var mongoose = require('mongoose');
var schema = mongoose.Schema;

let senderType = [
  'community',
  'user'
];

let contentType = [
  'text', 
  'image', 
  'audio', 
  'video'
];

let messageStatus = [
  'delivered',
  'sent',
  'read',
  'acknowledged',
  'failed'
];

let message = new schema(
  {
    content: {type: String, required: true},
    contentType: {type: String, required: true, enum: contentType},
    sender: {
      kind: {type: String, required: true, enum: senderType},
      item: { type: schema.ObjectId, refPath: 'sender.kind' }
    },
    status: {type: String, required: true, enum: messageStatus}
  },
  {timestamps: {createdAt: 'createdAt'}}
);

let chatType = [
  'friend',
  'group'
];

let chat = new schema(
  {
    owner: {
      kind: {type: String, required: true, enum: senderType},
      item: { type: schema.ObjectId, refPath: 'owner.kind' }
    },
    name: {type: String, required: false},
    description: {type: String, required: false},
    avatarId: {type: String, required: false},
    type: {type: String, required: true,  enum: chatType},
    participants: [{ type: schema.ObjectId, ref: 'user'}],
    messageLane: [message]
  },
  {timestamps: {createdAt: 'createdAt', updatedAt: 'updatedAt'}}
);



/**
 * Defines the schema for the chat model
 */
module.exports = mongoose.model('chat', chat);