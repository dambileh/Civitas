var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var User = new Schema(
  {
    name: {type: String, required: true}
  },
  {timestamps: {createdAt: 'created_at', updatedAt: 'updated_at'}}
);

/**
 * Defines the schema for the user model
 */
module.exports = mongoose.model('user', User);