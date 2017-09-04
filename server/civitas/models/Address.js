'use strict';

var mongoose = require('mongoose');
var autopopulate = require('mongoose-autopopulate');
var schema = mongoose.Schema;

var addressType = [
  'physical',
  'postal'
];

var locationType = [
  'Point'
];

var ownerType = [
  'company',
  'person',
  'user'
];

var address = new schema(
  {
    "ownerId": {type: schema.ObjectId, ref: 'user', autopopulate: true, required: true},
    "ownerType": {type: String, required: true, enum: ownerType},
    "detail": {
      "line1": {type: String, required: true},
      "line2": {type: String, required: false},
      "city": {type: String, required: true},
      "province": {type: String, required: false},
      "state": {type: String, required: false},
      "country": {type: String, required: true},
      "postalCode": {type: String, required: true},
      "type": {type: String, required: true, enum: addressType}
    },
    "isPrimary": {type: Boolean, required: false},
    "location": {
      "type": {type: String, required: true, enum: locationType},
      "coordinates": [{type: Number, required: true}]
    }
  },
  {timestamps: {createdAt: 'createdAt', updatedAt: 'updatedAt'}}
);

address.plugin(autopopulate);

/**
 * Defines the schema for the address model
 */
module.exports = mongoose.model('address', address);