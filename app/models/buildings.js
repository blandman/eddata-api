var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var timestamps = require('mongoose-timestamp');
var autoIncrement = require('mongoose-auto-increment');
var passportLocalMongoose = require('passport-local-mongoose');

/*
  Schema from old data:
  
  `building_code` int(11) NOT NULL,
  `acronym` varchar(4) NOT NULL,
  `latitude` float(10,6) NOT NULL,
  `longitude` float(10,6) NOT NULL,
  `full_name` varchar(45) NOT NULL,
  `street` varchar(45) NOT NULL,
  `city` varchar(15) NOT NULL,
  `zip_code` varchar(8) NOT NULL,
  `level` varchar(45) DEFAULT NULL,
  `floors` int(11) DEFAULT NULL,
  `groundFloor` int(11) DEFAULT NULL,
  `modification_date` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP
  
*/

var BuildingSchema = new Schema({
	buildingCode: Number,
	acronym: String,
	latitude: Number,
	longitude: Number,
	name: String,
	street: String,
	city: String,
	zip: String,
	level: String,
	floors: Number
});

BuildingSchema.plugin(timestamps);
BuildingSchema.plugin(autoIncrement.plugin, { model: 'Buildings', field: 'id' });
BuildingSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('Building', BuildingSchema);