var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var statusEnum = [
  'active',
  'inactive'
];

var User = new Schema(
  {
    firstname: {type: String, required: true},
    lastname: {type: String, required: true},
    cellnumber: {type: String, required: true},
    email: {type: String, required: false},
    status: {type: String, required: true, enum: statusEnum}
  },
  {timestamps: {createdAt: 'created_at', updatedAt: 'updated_at'}}
);

/**
 * Defines the schema for the user model
 */
module.exports = mongoose.model('user', User);