var middlewareObj = {};
var Product = require("../models/products");

middlewareObj.isLoggedIn = function(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
    req.flash("error", "Please Login!");
    res.redirect("/login");
};

middlewareObj.checkProductOwnership = function(req, res, next){
    if(req.isAuthenticated()){
        Product.findById(req.params.id, function(err, foundProduct){
            if(err){
                req.flash("error", "Product not found!");
                res.redirect("back")
            } else {
                //check if the current user owns the course
                if(foundProduct.author.id.equals(req.user._id)){
                    next();                }
            }
        });
            } else {
                req.flash("error", "Permission denied!")
                res.redirect("back")
            }
        };

module.exports = middlewareObj