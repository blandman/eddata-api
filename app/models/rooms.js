var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var timestamps = require('mongoose-timestamp');
var autoIncrement = require('mongoose-auto-increment');
var passportLocalMongoose = require('passport-local-mongoose');

/*
	
  `room_id` int(11) NOT NULL AUTO_INCREMENT,
  `building_code` int(11) NOT NULL,
  `room_name` varchar(45) NOT NULL,
  `floor` int(11) DEFAULT NULL,
  `modification_date` timestamp NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,

*/


var RoomSchema = new Schema({
	building: {type: Number, ref: "Building"},

	name: String,
	floor: Number,
	
	speakers: [],
	computers: []
});

RoomSchema.plugin(timestamps);
RoomSchema.plugin(autoIncrement.plugin, { model: 'Rooms', field: 'id' });
RoomSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('Room', RoomSchema);
