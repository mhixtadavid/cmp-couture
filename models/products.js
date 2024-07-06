var mongoose = require("mongoose");

var productSchema = new mongoose.Schema({
    image: String,
    category: String,
    description: String,
    name: String,
    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
        },
        username: String,
    },
});

module.exports = mongoose.model("Product", productSchema);