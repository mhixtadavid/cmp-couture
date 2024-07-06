var express     = require("express"),
    router      = express.Router(),
    path        = require("path"),
    Product     = require("../models/products"),
    middleware  = require("../middleware"),
    nodemailer  = require("nodemailer"),
    multer      = require("multer"),
    storage     = multer.diskStorage({
        destination: function(req, file, cb){
            cb(null, "public/designs")
        },
        filename: function(req, file, cb){
            const ext = path.extname(file.originalname);
            const id  = Date.now();
            const filePath = `${id}${ext}`
            cb(null, filePath);       
        }
    });
    var upload      = multer({storage: storage, limits: {
        fileSize: 1024 * 1024 * 50
    }});



router.get("/", function(req, res){
    Product.aggregate([{$sample:{size:21}}], function(err, allProduct){
        if (err){
            console.log(err)
        } else {
            res.render("products/index", {products: allProduct})
        }
    });
});

router.get("/AddDesign", middleware.isLoggedIn, function(req, res){
    res.render("products/new")
});

router.post("/", upload.single("image"), function(req, res){
    var name = req.body.name;
    var category = req.body.category;
    var description = req.body.description;
    var image = `/designs/${req.file.filename}`;
    var author = {
        id: req.user._id,
        username: req.user.username,
    };
    var newProduct = {
        name: name,
        category: category,
        description: description,
        image: image,
        author: author
    };
    Product.create(newProduct, function(err, newlycreated){
        if (err) {
            console.log(err)
        } else {
            res.redirect("/store/" + req.body.category)
        }
    });
});

router.get("/kids", function(req, res){
    Product.find({"category": "kids"}, function(err, allProduct){
        if (err){
            console.log(err)
        } else {
            res.render("products/kids", {products: allProduct})
        }
    });
});

router.get("/men", function(req, res){
    Product.find({"category": "men"}, function(err, allProduct){
        if (err){
            console.log(err)
        } else {
            res.render("products/men", {products: allProduct})
        }
    });
});

router.get("/women", function(req, res){
    Product.find({"category": "women"}, function(err, allProduct){
        if (err){
            console.log(err)
        } else {
            res.render("products/women", {products: allProduct})
        }
    });
});

router.get("/accessories", function(req, res){
    Product.find({"category": "accessories"}, function(err, allProduct){
        if (err){
            console.log(err)
        } else {
            res.render("products/accessories", {products: allProduct})
        }
    });
});

router.get("/:id", middleware.isLoggedIn, function(req, res){
    Product.findById(req.params.id, function(err, foundProduct){
        if (err){
            console.log(err)
        } else {
        res.render("products/show", {products: foundProduct})
        }
    });
});

router.get("/:id/edit", middleware.checkProductOwnership, function(req, res){
    Product.findById(req.params.id, function(err, foundProduct){
        res.render("products/edit", {product: foundProduct});
    });
});

//UPDATE COURSE ROUTE
router.put("/:id", middleware.checkProductOwnership, function(req, res){
    // find and update the correct course
    Product.findByIdAndUpdate(req.params.id, req.body.product, function(err, updatedProduct){
        if(err){
            res.redirect("/store");
        } else{
        //redirect somewhere(show page)
            res.redirect("/store/" + req.params.id)
        }
    });
});

//DESTROY COURSE ROUTE
router.delete("/:id", middleware.checkProductOwnership, function(req, res){
    Product.findByIdAndRemove(req.params.id, function(err){
        if(err){
            res.redirect("/store")
        } else {
        req.flash("Success", "Product deleted successfully!");
        res.redirect("/store")
        }
    });
});

router.post("/:id/order", middleware.isLoggedIn, function(req, res){
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
        subject: "Customer Order", // Subject line
        //text: req.body.message, // plaintext body
        html: req.body.fname + " " + req.body.lname + ", " + req.body.phone + ", " + req.body.email + ", " + ", " + req.body.pname + ", " + req.body.category,
            
    };
    
    // send mail with defined transport object
    transporter.sendMail(mailOptions, function(error, info){
        if(error){
            return console.log(error);
        }
    });
      req.flash("success", "Order placed successfully! You'll receive a reply shortly");
      res.redirect("/store");
    });


module.exports = router;