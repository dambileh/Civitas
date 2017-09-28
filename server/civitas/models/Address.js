'use strict';

var mongoose = require('mongoose');
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
    "owner": {
      "kind": {type: String, required: true, enum: ownerType},
      "item": { type: schema.ObjectId, refPath: "owner.kind" }
    },
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

/**
 * Defines the schema for the address model
 */
module.exports = mongoose.model('address', address);


/*
 // Example of dynamically passing the DbRef type
 // here we passing user as the DbRef type

 let addresses = null;
 try {
 addresses = await Address.
 find({}).
 populate('owner', null, 'user');
 } catch (err) {
 return subscriptionManager.emitInternalResponseEvent(
 {
 statusCode: 500,
 body: err
 },
 userChannels.Internal.GetAllCompletedEvent
 );
 }
 */

