var express    = require('express'),
	router     = express.Router(),
	passport   = require('passport'),
	User       = require('../models/user'),
	Campground = require('../models/campground');
var	async      = require('async');
var	nodemailer = require('nodemailer'),
	crypto     = require('crypto');
	

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

router.get('/forgot', (req,res) => {
	res.render('forgot');
});

router.post('/forgot', (req, res, next) => {
	async.waterfall([
		function(done) {
			crypto.randomBytes(20, (err, buf) => {
				var token= buf.toString('hex');
				done(err,token);
			});
		},
		(token, done) =>{
			User.findOne({email:req.body.email}, (err, user) => {
				if(!user) {
					req.flash('error', "No account with that email was found.");
					return res.redirect('/forgot');
				}
				
				user.resetPasswordToken = token;
				user.resetPasswordExpires = Date.now() + 3600000;
				
				user.save(function(err){
					done(err, token, user);
				});
			});
		},
		(token, user, done) => {
			var smtpTransport = nodemailer.createTransport({
				service: 'Gmail',
				auth: {
					user: 'wespipkin@gmail.com',
					pass: process.env.GPW
				}
			});
			var mailOptions = {
				to: user.email,
				from: 'wespipkin@gmail.com',
				subject: 'YelpCamp Password Reset',
				text: 'Hey ' + user.firstName + ","  + "\n\n" +
				'You are receiving this email because you (or somebody else) requested to reset your password for YelpCamp. ' +
				'Please click on the following link, or paste it into your browser to complete the password reset process within 1 hour of receiving this email. ' + '\n' +
				'https://' + req.headers.host + '/reset/' + token + "\n\n" + 
				'If you did not initiate this request, you can ignore this email and your password will remain unchanged.'
			};
			smtpTransport.sendMail(mailOptions, (err) => {
				console.log('mail sent');
				req.flash('info', 'An email has been sent to ' + user.email + ' with further instructions.');
				done(err, 'done');
			});
		}
		], (err) => {
			if(err) return next(err);
			res.redirect('/forgot');
		});
});

router.get('/reset/:token', (req,res)=> {
	User.findOne({resetPasswordToken:req.params.token, resetPasswordExpires: { $gt: Date.now() } }, (err, user) => {
		if(!user) {
			req.flash('error', 'Oops, that token is no longer valid..');
			return res.redirect('/forgot');
		}
		res.render('reset', {token: req.params.token});
	});
});

router.post('/reset/:token', (req, res)=> {
	async.waterfall([
		function (done) {
			User.findOne({resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, (err, user) => {
				if(!user) {
					req.flash('error', 'Oops, that token is no longer valid..');
					return res.redirect('back');
				}
				if(req.body.password === req.body.confirm) {

					user.setPassword(req.body.password, (err) => {
						user.resetPasswordToken = undefined;
						user.resetPasswordExpires = undefined;
						
						user.save((err)=> {
							req.login(user, (err)=>{
								done(err,user);
							});
						});
					})	
				} else {
					req.flash('error', "I'm sorry, but it seems that those passwords don't match. Try that again...");
					return res.redirect('back');
				}
			});
		}, (user,done) => {
			var smtpTransport = nodemailer.createTransport({
				service: 'Gmail',
				auth: {
					user: 'wespipkin@gmail.com',
					pass: process.env.GPW
				}
			});
			var mailOptions = {
				to: user.email,
				from: 'wespipkin@gmail.com',
				subject: 'YelpCamp password has been successfully reset!',
				text: 'Hey ' + user.firstName + ","  + "\n\n" +
				'This is a confirmation email, informing you that the password for your account ' + '\n\n' + user.email + '\n\n' +
				' has been successfully updated to the new password that you provided'
				
			};
			smtpTransport.sendMail(mailOptions, (err) => {
				console.log('mail sent');
				req.flash('info', 'Congrats, your password has been changes successfully!');
				done(err);
			});
		}
	], (err) => {
		res.redirect('/campgrounds');
	});
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