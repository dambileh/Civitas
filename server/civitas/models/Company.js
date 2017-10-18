'use strict';

var mongoose = require('mongoose');
var schema = mongoose.Schema;
var Address = require('../models/Address');

let phoneEnum = ['personal', 'business', 'home'];

let phone = new schema(
  {
    number: {type: String, required: true},
    type: {type: String, required: true, enum: phoneEnum},
    isPrimary: {type: Boolean, required: false}
  },
  {timestamps: {createdAt: 'createdAt', updatedAt: 'updatedAt'}}
);

let representative = new schema(
  {
    name: {type: String, required: true},
    phoneNumbers: [phone],
    email: {type: String, required: true},
    isPrimary: {type: Boolean, required: false}
  },
  {timestamps: {createdAt: 'createdAt', updatedAt: 'updatedAt'}}
);

let ownerType = [
  'user'
];

let companyEnum = ['ar'];

let company = new schema(
  {
    owner: {
      kind: {type: String, required: true, enum: ownerType},
      item: { type: schema.ObjectId, refPath: 'owner.kind' }
    },
    name: {type: String, required: true},
    branch: {type: String, required: true},
    type: {type: String, required: true, enum: companyEnum},
    addresses: [{ type: schema.ObjectId, ref: 'address'}],
    phoneNumbers: [phone],
    representatives: [representative]
  },
  {timestamps: {createdAt: 'createdAt', updatedAt: 'updatedAt'}}
);

company.pre('remove', function(next) {
  // Remove all the addresses created for this user
  Address.remove({'owner.item': this._id}).exec();
  next();
});


/**
 * Defines the schema for the company model
 */
module.exports = mongoose.model('company', company);