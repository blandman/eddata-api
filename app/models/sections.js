var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var timestamps = require('mongoose-timestamp');
var autoIncrement = require('mongoose-auto-increment');
var passportLocalMongoose = require('passport-local-mongoose');

var SectionSchema = new Schema({
  psId: Number,
  buildingStateCode: Number,
  courseName: String,
  expression: String,
  sectionNumber: Number,
  courseNumber: String,
  term: Number,
  studentCount: Number,
  room: String,
  maxEnrollment: Number,
  courseCode: String,
  teachers: Array,
  firstDay: Date,
  lastDay: Date,
  refreshAccount: Boolean
});

SectionSchema.plugin(timestamps);
SectionSchema.plugin(autoIncrement.plugin, { model: 'Sections', field: 'id' });
SectionSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('Section', SectionSchema);