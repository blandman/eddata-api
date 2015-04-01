var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var timestamps = require('mongoose-timestamp');
var autoIncrement = require('mongoose-auto-increment');
var passportLocalMongoose = require('passport-local-mongoose');

var EnrollmentSchema = new Schema({
  psId: Number,
  studentNumber: String,
  courseId: Number,
  refreshAccount: Boolean
});

EnrollmentSchema.plugin(timestamps);
EnrollmentSchema.plugin(autoIncrement.plugin, { model: 'Enrollments', field: 'id' });
EnrollmentSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('Enrollment', EnrollmentSchema);