var mongoose =require("mongoose");
var passportLocalMongoose = require("passport-local-mongoose")

var UserSchema =new mongoose.Schema({
	username: {
		type: String,
		required: true
	},
	password: {
		type:String,
		required: true
	},
	email:{
		type: String,
		required: true
	}
	// createdNotes:[{
	// 	type: schema.Types.ObjectId,
	// 	ref: 'Notes'
	// }]
});

UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User",UserSchema)