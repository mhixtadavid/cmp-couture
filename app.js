var express         = require("express"),
    app             = express(),
    mongoose        = require("mongoose"),
    flash           = require("connect-flash"),
    passport        = require("passport"),
    LocalStrategy   = require("passport-local"),
    session         = require("express-session"),
    methodOverride  = require("method-override"),
    nodemailer      = require("nodemailer"),
    multer          = require("multer"),
    dotenv          = require("dotenv").config(),
    Product         = require("./models/products"),
    User            = require("./models/user");

var indexRoutes = require("./routes/index"),
    storeRoutes = require("./routes/products");


var mongoDB = process.env.MONGODB_URL;
mongoose.connect(mongoDB, { useNewUrlParser: true , useUnifiedTopology: true});
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(flash());

//User Passport Config
app.use(require("express-session")({
    secret: process.env.SECRET,
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

app.use(indexRoutes);
app.use("/store", storeRoutes);
app.use(function(req, res){
    res.send ("Error finding page")
})

const port = process.env.PORT;
app.listen (port, function(){
    console.log ("Server Active");
});