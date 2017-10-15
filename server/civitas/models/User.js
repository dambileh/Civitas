'use strict';

var mongoose = require('mongoose');
var schema = mongoose.Schema;
var Address = require('../models/Address');

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
    friends: [{ type: schema.ObjectId, ref: 'user'}],
    addresses: [{ type: schema.ObjectId, ref: 'address'}]
  },
  {timestamps: {createdAt: 'createdAt', updatedAt: 'updatedAt'}}
);

user.pre('remove', function(next) {
  // Remove all the addresses created for this user 
  Address.remove({'owner.item': this._id}).exec();
  next();
});

/**
 * Defines the schema for the user model
 */
module.exports = mongoose.model('user', user);