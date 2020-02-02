require('dotenv').config();

var express        = require('express'),
	app            = express(),
	bodyParser     = require('body-parser'),
	mongoose       = require('mongoose'),
	Campground     = require('./models/campground'),
	Comment        = require('./models/comment'),
	User           = require('./models/user'),
	passport       = require('passport'),
	localStrat     = require('passport-local'),
	methodOverride = require('method-override'),
	flash          = require('connect-flash'),
	seedDB         = require('./seeds');
	
	
var campgroundRoutes  = require('./routes/campgrounds'),
    commentRoutes     = require('./routes/comments'),
    authRoutes        = require('./routes/index');


mongoose.set("useUnifiedTopology", true);
mongoose.connect("mongodb://localhost/yelp_camp", {useNewUrlParser: true});
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname + '/public'));
app.use(methodOverride('_method'));
app.use(flash());
// seedDB();  //seed the DB

app.use(require('express-session')({
	secret: 'this is my secret',
	resave: false,
	saveUninitialized: false
}));

app.locals.moment = require('moment');
app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrat(User.authenticate()));
passport.serializeUser(User.serializeUser());;
passport.deserializeUser(User.deserializeUser());
app.use(function(req,res,next){
	res.locals.currentUser = req.user;
	res.locals.error = req.flash('error');
	res.locals.info = req.flash('info');
	res.locals.success = req.flash('success');
	next();
});

app.use('/campgrounds', campgroundRoutes);
app.use('/campgrounds/:id/comments', commentRoutes);
app.use(authRoutes);

app.listen(process.env.PORT || 3000 , process.env.IP, function(){
		   console.log('YelpCamp Server Started!');
});