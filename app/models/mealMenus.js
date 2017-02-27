var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var timestamps = require('mongoose-timestamp');
var autoIncrement = require('mongoose-auto-increment');
var passportLocalMongoose = require('passport-local-mongoose');

var MenuSchema = new Schema({
	menu: {type: Object},
	name: {type: String, required: true},
	group: {type: String, required: true}
});

MenuSchema.plugin(timestamps);
MenuSchema.plugin(autoIncrement.plugin, { model: 'MealMenus', field: 'id' });
MenuSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('MealMenu', MenuSchema);
