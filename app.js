var express     = require("express"),
    app         = express(),
    bodyParser  = require("body-parser"),
    mongoose    = require("mongoose"),
    flash       = require("connect-flash"),
    passport    = require("passport"),
    LocalStrategy = require("passport-local"),
    methodOverride = require("method-override"),
    Campground  = require("./models/campground"),
    Comment     = require("./models/comment"),
    User        = require("./models/user"),
    seedDB      = require("./seeds");
    
const PORT = 3000;

//requiring routes
var commentRoutes    = require("./routes/comments"),
    reviewRoutes     = require("./routes/review"),
    campgroundRoutes = require("./routes/campgrounds"),
    indexRoutes      = require("./routes/index");
  
 //local c9 database
// console.log(process.env.DATABASEURL);
// mongoose.connect("mongodb://localhost/yelp_camp_v10");
// mongoose.connect(process.env.DATABASEURL);

// YelpCamp-DeployApp -> Database name
//admin : admin -> username password in mongodb Atlas
//mongoatlas database
// mongoose.connect("mongodb+srv://admin:admin@cluster0-bizty.mongodb.net/YelpCamp-DeployApp?retryWrites=true&w=majority", {useNewUrlParser: true});
mongoose.connect("mongodb+srv://admin:admin@cluster0-bizty.mongodb.net/YelpCamp-DeployApp?retryWrites=true&w=majority", {
	useNewUrlParser: true,
	useCreateIndex: true
}).then(() => {
	console.log("Connected to DB Mongo Atlas!");
}).catch(err => {
	console.log("ERROR:", err.message);
});


app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
//require moment
app.locals.moment = require("moment");
// seedDB(); //seed the database

app.use(flash());

// PASSPORT CONFIGURATION
app.use(require("express-session")({
    secret: "Once again Rusty wins cutest dog!",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next){
   res.locals.currentUser = req.user;
   res.locals.error = req.flash("error");
   res.locals.success = req.flash("success");
   next();
});



app.use("/", indexRoutes);
app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/comments", commentRoutes);
app.use("/campgrounds/:id/reviews", reviewRoutes);

app.listen(3000, () => {
   console.log("The YelpCamp Server Has Started.");
});
// app.listen(process.env.PORT, process.env.IP, function(){
//    console.log("The YelpCamp Server Has Started!");
// });