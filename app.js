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
// seedDB();  //seed the DB

app.use(require('express-session')({
	secret: 'this is my secret',
	resave: false,
	saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrat(User.authenticate()));
passport.serializeUser(User.serializeUser());;
passport.deserializeUser(User.deserializeUser());
app.use(function(req,res,next){
	res.locals.currentUser = req.user;
	next();
});

app.use('/campgrounds', campgroundRoutes);
app.use('/campgrounds/:id/comments', commentRoutes);
app.use(authRoutes);

app.listen(process.env.PORT || 3000 , process.env.IP, function(){
		   console.log('YelpCamp Server Started!');
});