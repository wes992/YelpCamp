var express    = require('express'),
	router     = express.Router(),
	passport   = require('passport'),
	User       = require('../models/user'),
	Campground = require('../models/campground');
	

router.get("/", function(req, res){
	res.render("landing");
});


router.get('/register', function(req,res){
	res.render('register', {page: 'register'});
});

router.post('/register', function(req,res){
	var newUser = new User(
		{
			username: req.body.username,
			firstName: req.body.firstName,
			lastName: req.body.lastName,
			avatar: req.body.avatar,
			email: req.body.email
		});
	if(req.body.adminCode === 'secretcode123') {
		newUser.isAdmin = true
	}
	User.register(newUser, req.body.password, function(err,user){
		if(err){
			console.log(err);
			return res.render("register", {error: err.message});
		}
		passport.authenticate('local')(req, res, function(){
			req.flash('info', 'Welcome to YelpCamp, ' + user.firstName+"!!");
			res.redirect('/campgrounds');
		});
	});
});

router.get('/login' , function(req, res){
	res.render('login', {page: 'login'});
});

router.post('/login', passport.authenticate('local', {
	successRedirect: '/campgrounds', 
	failureRedirect: '/login', 
	failureFlash: true,
	successFlash: 'Welcome back to Yelp Camp!'
}), function(req, res){
});

router.get('/logout', function(req,res){
	req.logout();
	req.flash('info', 'Successfully logged you out. Come back Soon!');
	res.redirect('/campgrounds');
});

// user profiles

router.get('/users/:id', function(req,res){
	User.findById(req.params.id, function(err, foundUser){
		if(err){
			req.flash('error', "Sorry, something didn't add up...");
			res.redirect('/campgrounds');
		}
		Campground.find().where('author.id').equals(foundUser._id).exec(function(err, campgrounds){
			if(err){
				req.flash('error', "Sorry, something didn't add up...");
				res.redirect('/campgrounds');
		}
		res.render('users/show', {user: foundUser, campgrounds: campgrounds});
		});
	});	
});
module.exports = router;