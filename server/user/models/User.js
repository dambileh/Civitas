var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var statusEnum = [
  'active',
  'inactive'
];

var User = new Schema(
  {
    firstName: {type: String, required: true},
    lastName: {type: String, required: true},
    cellNumber: {type: String, required: true},
    email: {type: String, required: false},
    status: {type: String, required: true, enum: statusEnum}
  },
  {timestamps: {createdAt: 'createdAt', updatedAt: 'updatedAt'}}
);

/**
 * Defines the schema for the user model
 */
module.exports = mongoose.model('user', User);