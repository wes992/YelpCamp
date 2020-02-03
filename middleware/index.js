var Campground = require('../models/campground');
var Comment = require('../models/comment');
var middlewareObj = {};

middlewareObj.chkOwnership = function(req, res, next){
	if(req.isAuthenticated()){
		Campground.findById(req.params.id, function(err, foundCampground){
			if(err || !foundCampground){
				req.flash('error', 'Campground was not found on the Database..');
				res.redirect('back');
			} else {
				// does user own campground?
				if(foundCampground.author.id.equals(req.user._id) || req.user.isAdmin){
					next();
				} else {
					req.flash('info', "Uhh-ohh, Looks like you don't have permission to do that...");
					res.redirect('back');
				}
			}
		});
	} else {
		req.flash('error', 'Oops, you need to be logged in to do that..')
		res.redirect('back');
	}
}

middlewareObj.chkCommentOwnership = function(req, res, next){
	if(req.isAuthenticated()){
		Comment.findById(req.params.comment_id, function(err, foundComment){
			if(err || !foundComment){
				req.flash('error', "Well, that didn't quite work. Error creating commment..");
				res.redirect('back');
			} else {
				// does user own comment?
				if(foundComment.author.id.equals(req.user._id) || req.user.isAdmin){
					next();
				} else {
					req.flash('info', "Uhh-ohh, Looks like you don't have permission to do that...");
					res.redirect('back');
				}
			}
		});
	} else {
		req.flash('error', 'Oops, you need to be logged in to do that..')
		res.redirect('back');
	}
}
//MIDDLEWARE

middlewareObj.isLoggedIn =function (req, res, next){
	if(req.isAuthenticated()){
		return next()
	} 
	req.flash("error", "Oops, you need to be logged in to do that..");
	res.redirect('/login');
}

module.exports = middlewareObj;