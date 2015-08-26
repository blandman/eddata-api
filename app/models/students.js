var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var timestamps = require('mongoose-timestamp');
var autoIncrement = require('mongoose-auto-increment');
var passportLocalMongoose = require('passport-local-mongoose');

var StudentSchema = new Schema({
  nameId: Number,
  firstName: String,
  lastName: String,
  middleName: String,
  studentNumber: String,
  enrollStatus: String,
  gradeLevel: String,
  gender: String,
  birthdate: Date,
  street: String,
  city: String,
  state: String,
  zip: String,
  guardianEmail: String,
  homePhone: String,
  stateStudentNumber: String,
  buildingStateCode: String,
  buildingName: String,
  username: String,
  email: String,
  ethnicity: String,
  entryDate: Date,
  exitDate: Date,
  expectedGradYear: Number,
  primaryLanguage: String,
  mother: String,
  motherHome: String,
  father: String,
  fatherHome: String,
  ec1: String,
  ec1Relation: String,
  ec1Phone: String,
  ec2: String,
  ec2Relation: String,
  ec2Phone: String,
  refreshAccount: Boolean
});

StudentSchema.plugin(timestamps);
StudentSchema.plugin(autoIncrement.plugin, { model: 'Students', field: 'id' });
StudentSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('Student', StudentSchema);