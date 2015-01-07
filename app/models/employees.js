var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var timestamps = require('mongoose-timestamp');
var autoIncrement = require('mongoose-auto-increment');
var passportLocalMongoose = require('passport-local-mongoose');

var EmployeeSchema = new Schema({
  nameId: Number,
  nalphakey: String,
  username: String,
  startDate: Date,
  building: Number,
  buildingStateCode: Number,
  buildingName: String,
  firstName: String,
  middleName: String,
  lastName: String,
  psdSSN: String,
  phone1: String,
  phone2: String,
  phone3: String,
  birthdate: Date,
  gender: String,
  raceCode: String,
  streetDir: String,
  streetNumber: String,
  streetName: String,
  streetApartment: String,
  poBox: String,
  zipCode: String,
  zipPlus4: String,
  city: String,
  state: String,
  workDays: Number,
  certNumber: String,
  title: String,
  refreshAccount: Boolean
});

EmployeeSchema.plugin(timestamps);
EmployeeSchema.plugin(autoIncrement.plugin, { model: 'Employees', field: 'id' });
EmployeeSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('Employee', EmployeeSchema);