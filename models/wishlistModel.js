const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const wishlistSchema = Schema({
  productId: {
    type: String,
    ref: "Product",
    required: true,
  },
  userId: {
    type: String,
    ref: "User",
    required: true,
  },
  addedOn: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Wishlist", wishlistSchema);
