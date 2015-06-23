var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var timestamps = require('mongoose-timestamp');
var autoIncrement = require('mongoose-auto-increment');
var passportLocalMongoose = require('passport-local-mongoose');

var ComputerSchema = new Schema({
  barcode: String,
  deviceModel: String,
  groups: Array,
  hardDrive: String,
  lastInventory: Date,
  location: String,
  manufacturer: String,
  name: String,
  notes: String,
  processor: String,
  purchaseDate: Date,
  ram: Number,
  room: String,
  serialNumber: String,
  vendor: String,
  warrantyExpiration: Date,
  lastIpAddress: String,
  currentUser: String,
  previousUsers: Array
});

ComputerSchema.plugin(timestamps);
ComputerSchema.plugin(autoIncrement.plugin, { model: 'Computers', field: 'id' });
ComputerSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('Computer', ComputerSchema);