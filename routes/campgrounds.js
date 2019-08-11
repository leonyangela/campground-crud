var express = require("express");
var router  = express.Router();
var Campground = require("../models/campground");
var Comment = require("../models/comment");
var Review = require("../models/review");
var middleware = require("../middleware");
// no need to /index.js because index.js is a special name
// so it will be include automatically

//INDEX - show all campgrounds
router.get("/", function(req, res){
    // Get all campgrounds from DB
	var perPage = 8;
	var pageQuery = parseInt(req.query.page);
	var pageNumber = pageQuery ? pageQuery : 1;
	
    Campground.find({}).skip((perPage * pageNumber) - perPage).limit(perPage).exec(function(err, allCampgrounds){
		Campground.count().exec(function(err, count){
		   if(err){
			   console.log(err);
		   } else {
			  res.render("campgrounds/index",{
				 campgrounds:allCampgrounds,
				 current: pageNumber,
				 pages: Math.ceil(count / perPage)
			  });  //RES.RENDER
			}
		});
    });
});

//CREATE - add new campground to DB
router.post("/", middleware.isLoggedIn, function(req, res){
    // get data from form and add to campgrounds array
    var name = req.body.name;
    var price = req.body.price;
    var image = req.body.image;
    var desc = req.body.description;
    var author = {
        id: req.user._id,
        username: req.user.username
    };
    var newCampground = { name: name, price: price, image: image, description: desc, author:author };
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

//NEW - show form to create new campground
router.get("/new", middleware.isLoggedIn, function(req, res){
   res.render("campgrounds/new"); 
});

// SHOW - shows more info about one campground
router.get("/:id", function(req, res){
    //find the campground with provided ID
    Campground.findById(req.params.id).populate("comments").populate({
		path: "reviews",
		options: {sort: {createdAt: -1}}
	}).exec(function(err, foundCampground){
        if(err){
            console.log(err);
        } else {
            // console.log(foundCampground);
            //render show template with that campground
            res.render("campgrounds/show", {campground: foundCampground});
        }
    });
});

//EDIT with middleware
router.get("/:id/edit", middleware.checkCampgroundOwnership, function(req, res) {
    Campground.findById(req.params.id, function(err, foundCampground){
        res.render("campgrounds/edit", {campground: foundCampground});
    });
});

//UPDATE
router.put("/:id", middleware.checkCampgroundOwnership,function(req, res) {
    //find and update the correct campground
    Campground.findByIdAndUpdate(req.params.id, req.body.campground, req.body.campground.rating, function(err, updatedCampground){
       if(err){
           res.redirect("/campgrounds");
       } else {
           res.redirect("/campgrounds/" + req.params.id);
       }
    });
});

//destroy route
router.delete("/:id", middleware.checkCampgroundOwnership, function (req, res) {
    Campground.findById(req.params.id, function (err, campground) {
        if (err) {
            res.redirect("/campgrounds");
        } else {
            // deletes all comments associated with the campground
            Comment.remove({"_id": {$in: campground.comments}}, function (err) {
                if (err) {
                    console.log(err);
                    return res.redirect("/campgrounds");
                }
                // deletes all reviews associated with the campground
                Review.remove({"_id": {$in: campground.reviews}}, function (err) {
                    if (err) {
                        console.log(err);
                        return res.redirect("/campgrounds");
                    }
                    //  delete the campground
                    campground.remove();
                    req.flash("success", "Campground deleted successfully!");
                    res.redirect("/campgrounds");
                });
            });
        }
    });
});


module.exports = router;



//EDIT before middleware
// router.get("/:id/edit", checkCampgroundOwnership, function(req, res) {
//     //is user logged in
//     if(req.isAuthenticated()){
//          Campground.findById(req.params.id, function(err, foundCampground){
//             if(err){
//                 res.redirect("/campgrounds")
//             } else {
//                 //does user own the campground?
//                 if(foundCampground.author.id.equals()(req.user._id)){
//                     res.render("campgrounds/edit", {campground: foundCampground});
//                 } else {
//                   //otherwise, redirect
//                   res.send("You don't have permission to do that");
//                 }
//             }
//         });
//     } else {
//         console.log("You need to be logged in to do that");
//         res.send("You need to be logged in to do that");
//     }
// });


