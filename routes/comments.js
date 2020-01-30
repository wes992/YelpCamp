var express = require('express'),
	router  = express.Router({mergeParams: true}),
	Campground = require('../models/campground'),
	Comment = require('../models/comment'),
	middleware = require('../middleware');

// ==============
// Comment Routes
// ==============
router.get('/new', middleware.isLoggedIn, function(req, res){
	//find campground by id
	Campground.findById(req.params.id, function(err, campground){
		if(err){
		   console.log(err);
		   } else {
				res.render('comments/new', {campground: campground});
		   }
	});
});

router.post('/', middleware.isLoggedIn, function(req,res){
	// Look up using ID
	Campground.findById(req.params.id, function(err, campground){
		if(err){
			console.log(err)
			res.redirect('/campgrounds')
		} else {
		//create new comment
		Comment.create(req.body.comment, function(err, comment){
			if(err){
				req.flash('error', "Well, that didn't quite work. Error creating commment..");
				console.log(err);
			} else {
				// add username
				comment.author.id = req.user._id;
				comment.author.username = req.user.username;
				// save comment
				comment.save();
				campground.comments.push(comment);
				campground.save();
				console.log(comment);
				req.flash('info', 'Woo, comment created successfully!');
				res.redirect('/campgrounds/' + campground._id);
			}
		});
		}
	});
});

// comments edit route
router.get('/:comment_id/edit', middleware.chkCommentOwnership, function(req, res){
	Campground.findById(req.params.id, function(err, foundCampground) {
		if(err || !foundCampground){
			req.flash('error', 'Oops, we cannot find that Campground');
			return res.redirect('back');
		}
		Comment.findById(req.params.comment_id, function(err, foundComment){
			if(err){
				res.redirect('back');
			} else {
				res.render('comments/edit', {campground_id: req.params.id, comment: foundComment});
			}
		});
	});
});

//comments update route
router.put('/:comment_id', middleware.chkCommentOwnership, function(req,res){
	Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err,updatedComment){
		if(err){
			res.redirect('back');
		} else {
			// redirect to campground page
			req.flash('info', 'Woo, comment updated successfully!');			
			res.redirect('/campgrounds/' + req.params.id);
		}
	});
	
});

//destroy route
router.delete('/:comment_id', middleware.chkCommentOwnership, function(req,res){
	Comment.findByIdAndRemove(req.params.comment_id, function(err){
		if(err){
			res.redirect('back');
		} else {
			req.flash('success', 'Sucessfully deleted comment!');
			res.redirect('/campgrounds/' + req.params.id);
		}
	});
});



module.exports = router;



