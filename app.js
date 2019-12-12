var express      = require('express'),
	app          = express(),
	bodyParser   = require('body-parser'),
	mongoose     = require('mongoose'),
	Campground   = require('./models/campground'),
	Comment      = require('./models/comment'),
	User         = require('./models/user'),
	passport     = require('passport'),
	localStrat   = require('passport-local'),
	seedDB       = require('./seeds');


mongoose.set("useUnifiedTopology", true);
mongoose.connect("mongodb://localhost/yelp_camp", {useNewUrlParser: true});
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname + '/public'));
seedDB();

app.use(require('express-session')({
	secret: 'this is my secret',
	resave: false,
	saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrat(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/", function(req, res){
	res.render("landing");
});


// INDEX - show all campgrounds
app.get("/campgrounds", function(req,res){
	// Get all campgrounds from DB
	Campground.find({}, function(err, allCampgrounds){
		if(err){
			console.log(err)
		} else{
			res.render("campgrounds/index", {campgrounds:allCampgrounds});
		}
	});
});


// CREATE - add new campground to DB
app.post("/campgrounds", function(req,res){
	
	// get data from form and add to camapgrounds array
	var name  = req.body.name,
		image = req.body.image,
		desc  = req.body.description,
		newCampground = {name:name, image:image, description: desc};
	
	//create a new campground and save to DB
	Campground.create(newCampground, function(err, newlyCreated){
		if(err){
			console.log(err);
		} else {
			//redirect back to campgrounds page
			res.redirect('/campgrounds');
		}
	})

});


// NEW - show form to create new campgrounds
app.get("/campgrounds/new", function(req, res){
	res.render("campgrounds/new");
});


// SHOW- shows more info about one campground
app.get("/campgrounds/:id", function(req, res){
	
	// find campgeound with provided ID
	Campground.findById(req.params.id).populate('comments').exec(function(err, foundCampground){
		if(err){
			console.log(err);
		} else {
			//render show temple with that campground
			console.log(foundCampground);
			res.render('campgrounds/show', {campground: foundCampground});	
			
		}
	});	

})

//================
// Comments Routes
//================

app.get('/campgrounds/:id/comments/new', function(req, res){
	//find campground by id
	Campground.findById(req.params.id, function(err, campground){
		if(err){
		   console.log(err);
		   } else {
				res.render('comments/new', {campground: campground});
		   }
	})
});

app.post('/campgrounds/:id/comments/', function(req,res){
	// Look up using ID
	Campground.findById(req.params.id, function(err, campground){
		if(err){
			console.log(err)
			res.redirect('/campgrounds')
		} else {
		//create new comment
		Comment.create(req.body.comment, function(err, comment){
			if(err){
				console.log(err);
			} else {
				// console.log(req.body.comment);
				campground.comments.push(comment);
				campground.save();
				res.redirect('/campgrounds/' + campground._id);
			}
		});
		}
	})
})


// =============
//  Auth Routes
// =============
app.get('/register', function(req,res){
	res.render('register');
});

app.post('/register', function(req,res){
	var newUser = new User({username: req.body.username});
	User.register(newUser, req.body.password, function(err,user){
		if(err){
			console.log(err);
			return res.render('register');
		}
		passport.authenticate('local')(req,res, function(){
			res.redirect('/campgrounds');
		});
	});
});

app.get('/login' , function(req, res){
	res.render('login');
});

app.post('/login', passport.authenticate('local', {
	successRedirect: '/campgrounds', 
	failureRedirect: '/login'}), 
	function(req, res){
});

app.get('/logout', function(req,res){
	req.logout();
	res.redirect('/campgrounds');
})
app.listen(process.env.PORT || 3000 , process.env.IP, function(){
		   console.log('YelpCamp Server Started!');
});

