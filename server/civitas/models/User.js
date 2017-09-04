'use strict';

var mongoose = require('mongoose');
var autopopulate = require('mongoose-autopopulate');
var schema = mongoose.Schema;

var statusEnum = [
  'active',
  'inactive'
];

var user = new schema(
  {
    firstName: {type: String, required: true},
    lastName: {type: String, required: true},
    msisdn: {type: String, required: true},
    email: {type: String, required: false},
    status: {type: String, required: true, enum: statusEnum},
    friends: [{ type: schema.ObjectId, ref: 'user', autopopulate: true }]
    // ,
    // addresses: [{ type: schema.ObjectId, ref: 'address', autopopulate: true }]
  },
  {timestamps: {createdAt: 'createdAt', updatedAt: 'updatedAt'}}
);

user.plugin(autopopulate);

/**
 * Defines the schema for the user model
 */
module.exports = mongoose.model('user', user);