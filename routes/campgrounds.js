var express = require('express');
var router  = express.Router();
var Campground  = require('../models/campground');
var middleware = require('../middleware');
var NodeGeocoder = require('node-geocoder');
 
var options = {
  provider: 'google',
  httpAdapter: 'https',
  apiKey: process.env.GEOCODER_API_KEY,
  formatter: null
};
 
var geocoder = NodeGeocoder(options);


//INDEX - show all campgrounds
router.get("/", function(req, res){
    // Get all campgrounds from DB
    Campground.find({}, function(err, allCampgrounds){
       if(err){
           console.log(err);
       } else {
          res.render("campgrounds/index",{campgrounds: allCampgrounds, page: 'campgrounds'});
       }
    });
});


//CREATE - add new campground to DB
router.post("/", middleware.isLoggedIn, function(req, res){
  // get data from form and add to campgrounds array
  var name = req.body.name;
  var cost = req.body.cost;
  var image = req.body.image;
  var desc = req.body.description;
  var author = {
      id: req.user._id,
      username: req.user.username
  }
  geocoder.geocode(req.body.location, function (err, data) {
    if (err || !data.length) {
		console.log(err);
      req.flash('error', 'Invalid address, please try again');
      return res.redirect('back');
    }
    var lat = data[0].latitude;
    var lng = data[0].longitude;
    var location = data[0].formattedAddress;
    var newCampground = {name: name, image: image, description: desc, cost: cost, author:author, location: location, lat: lat, lng: lng};
    // Create a new campground and save to DB
    Campground.create(newCampground, function(err, newlyCreated){
        if(err){
            console.log(err);
        } else {
            //redirect back to campgrounds page
            console.log(newlyCreated);
            res.redirect("/campgrounds");
        }
    });
  });
});


// NEW - show form to create new campgrounds
router.get("/new", middleware.isLoggedIn, function(req, res){
	res.render("campgrounds/new");
});


// SHOW- shows more info about one campground
router.get("/:id", function(req, res){
	
	// find campgeound with provided ID
	Campground.findById(req.params.id).populate('comments').exec(function(err, foundCampground){
		if(err || !foundCampground){
			req.flash('error', "Sorry, we couldn't find a campground there...");
			res.redirect('/campgrounds');
		} else {
			//render show temple with that campground
			console.log(foundCampground);
			res.render('campgrounds/show', {campground: foundCampground});	
			
		}
	});	

})

// EDIT CAMPGROUND ROUTE
router.get('/:id/edit', middleware.chkOwnership, function(req,res){
	Campground.findById(req.params.id, function(err, foundCampground){	
		res.render('campgrounds/edit', {campground: foundCampground});
	});
});

//UPDATE CAMPGROUND ROUTE

router.put('/:id', middleware.chkOwnership, function(req,res){
	//find and update campground
	var newData = {name: req.body.name, image: req.body.image, cost: req.body.cost, description: req.body.description};
  geocoder.geocode(req.body.location, function (err, data) {
    if (err || !data.length) {
      req.flash('error', 'Invalid address');
      return res.redirect('back');
    }
    req.body.campground.lat = data[0].latitude;
    req.body.campground.lng = data[0].longitude;
    req.body.campground.location = data[0].formattedAddress;
	  
	  console.log(data[0].formattedAddress);

    Campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err, campground){
        if(err){
            req.flash("error", err.message);
            res.redirect("back");
        } else {
            req.flash("success","Successfully added your campground!");
            res.redirect("/campgrounds/" + campground._id);
        }
    });
  });
});

// DESTROY CAMPGROUND ROUTE
router.delete('/:id', middleware.chkOwnership, function(req,res){
	Campground.findByIdAndRemove(req.params.id, function(err){
		if(err){
			res.redirect('/campgrounds');
		} else {
			res.redirect('/campgrounds');
		}
	});
});




module.exports = router;
