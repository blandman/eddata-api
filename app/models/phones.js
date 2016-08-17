var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var timestamps = require('mongoose-timestamp');
var autoIncrement = require('mongoose-auto-increment');
var passportLocalMongoose = require('passport-local-mongoose');

/*
	`id` int(11) unsigned NOT NULL AUTO_INCREMENT,
    `extension` int(4) NOT NULL,
    `display_name` varchar(30) DEFAULT NULL,
    `bldg_code` int(2) NOT NULL,
    `modification_date` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
*/

var PhoneSchema = new Schema({
	building: {
		type: Number, 
		ref: "Building"
	},

	extension: Number

	displayName: String
	macAddress: String,
	room: {type: Number, ref: "Room"}
});

PhoneSchema.plugin(timestamps);
PhoneSchema.plugin(autoIncrement.plugin, { model: 'Phones', field: 'id' });
PhoneSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('Phone', PhoneSchema);