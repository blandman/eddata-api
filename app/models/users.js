var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var timestamps = require('mongoose-timestamp');
var autoIncrement = require('mongoose-auto-increment');
var passportLocalMongoose = require('passport-local-mongoose');

var UserSchema = new Schema({
  name: String,
  email: String,
  phone: String,
  username: String,
  token: String,
  user_type: String
});

UserSchema.plugin(timestamps);
UserSchema.plugin(autoIncrement.plugin, { model: 'Users', field: 'id' });
UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', UserSchema);