var mongoose               = require('mongoose'),
	passportLocalMongoose  = require('passport-local-mongoose');
	
	UserSchema             = new mongoose.Schema({
		username:            String,
		password:            String,
		avatar:				 String,
		firstName:			 String,
		lastName:			 String,
		email:				 String,
		isAdmin:             {type: Boolean, default: false}
	});

UserSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model('user', UserSchema);