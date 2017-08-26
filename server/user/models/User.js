var mongoose = require('mongoose');
var autopopulate = require('mongoose-autopopulate');
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
    status: {type: String, required: true, enum: statusEnum},
    friends: [{ type: Schema.ObjectId, ref: 'user', autopopulate: true }]
  },
  {timestamps: {createdAt: 'createdAt', updatedAt: 'updatedAt'}}
);

User.plugin(autopopulate);

/**
 * Defines the schema for the user model
 */
module.exports = mongoose.model('user', User);