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

var addressType = [
  'physical',
  'postal'
];

let entityAddress = {
  "line1": {type: String, required: true},
  "line2": {type: String, required: false},
  "city": {type: String, required: true},
  "province": {type: String, required: false},
  "state": {type: String, required: false},
  "country": {type: String, required: true},
  "postalCode": {type: String, required: true},
  "type": {type: String, required: true, enum: addressType}
};

let entity = new schema(
  {
    name: {type: String, required: true},
    branch: {type: String, required: true},
    addresses: [entityAddress],
    phoneNumbers: [phone],
    representatives: [representative]
  }
);

let community = new schema(
  {
    owner: {
      kind: {type: String, required: true, enum: ownerType},
      item: { type: schema.ObjectId, refPath: 'owner.kind' }
    },
    name: {type: String, required: true},
    address: { type: schema.ObjectId, ref: 'address'},
    representatives: [representative],
    entities: [entity]
  },
  {timestamps: {createdAt: 'createdAt', updatedAt: 'updatedAt'}}
);

community.pre('remove', function(next) {
  // Remove all the addresses created for this community
  Address.remove({'owner.item': this._id}).exec();
  next();
});


/**
 * Defines the schema for the community model
 */
module.exports = mongoose.model('community', community);