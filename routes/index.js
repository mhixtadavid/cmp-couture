var express = require("express");
var router = express.Router();
var passport = require("passport");
var Product = require("../models/products");
var path = require("path")
var middleware  = require("../middleware");
var User = require("../models/user");
var nodemailer = require("nodemailer");
var flash = require("connect-flash");
const user = require("../models/user");

router.get("/", function(req, res){
    Product.aggregate([{$sample:{size:12}}], function(err, allProduct){
        if (err){
            console.log(err)
        } else {
            res.render("index", {products: allProduct})
        }
    });
});

router.get("/contact", function(req, res){
    res.render("contact")
})

router.get("/register", function(req, res){
    res.render("register");
});

//HANDLING SIGN UP (REGISTER)
router.post("/register", function(req, res){
   var newUser = new User({
       username: req.body.username,
       email: req.body.email,
       firstName: req.body.fname,
       lastName: req.body.lname,
       phone: req.body.phone,
   });
   User.register(newUser, req.body.password, function(err, user){
       if(err){
           req.flash("error", err.message);
           return res.redirect("register");
       }
       passport.authenticate("local")(req, res, function(){
           req.flash("success", "Welcome to CMP Couture " + user.username);
           res.redirect("/");
       });
   });
});

//HANDLING SIGN IN (LOGIN)
router.get("/login", function(req, res){
   res.render("login");
});

//LOGIN LOGIC
router.post("/login", passport.authenticate("local",
   {
       successRedirect: "/",
       failureRedirect: "/login"
   }), function(req, res){
});

//LOGOUT ROUTE
router.get("/logout", function(req, res, next){
   req.logout();
   req.flash("success", "Logout Successful!");
   res.redirect("/");
});

router.get("/profile", middleware.isLoggedIn, function(req, res){
    res.render("profile")
});

router.get("/AboutUs", function(req, res){
    res.render("about")
});

router.post("/contact", function(req, res){
    var transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 587,
            secure: false, // true for 587, false for other ports
            requireTLS: true,
            auth: {
                user: process.env.EMAIL, 
                pass: process.env.PASSWORD, 
            },
        });
    
    
    
    // setup e-mail data with unicode symbols
    var mailOptions = {
        from: req.body.email, // sender address
        to: process.env.R_EMAIL, // list of receivers
        subject: "Customer Issues", // Subject line
        //text: req.body.message, // plaintext body
        html: req.body.message + ", - " + req.body.name + ", " + req.body.phone + ", " + req.body.email  // html body
    };
    
    // send mail with defined transport object
    transporter.sendMail(mailOptions, function(error, info){
        if(error){
            return console.log(error);
        }
        console.log('Message sent: ' + info.response);
    });
      req.flash("success", "Message sent successfully! You'll receive a reply shortly");
      res.redirect("/contact");
    });


module.exports = router;