var mongoose               = require('mongoose'),
	passportLocalMongoose  = require('passport-local-mongoose');
	
	UserSchema               = new mongoose.Schema({
		username:              {type: String, unique: true, required: true},
		password:              String,
		avatar:				   String,
		firstName:			   String,
		lastName:			   String,
		email:				   {type: String, unique: true, required: true},
		resetPasswordToken:    String,
		resetPasswordExpires:  Date,
		isAdmin:               {type: Boolean, default: false}
	});

UserSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model('user', UserSchema);