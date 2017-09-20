'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var verification = new Schema(
  {
    msisdn: {type: String, required: true},
    code: {type: String, required: true}
  },
  {timestamps: {createdAt: 'createdAt', updatedAt: 'updatedAt'}}
);

/**
 * Defines the schema for the registration model
 */
module.exports = mongoose.model('verification', verification);