const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const reviewSchema = Schema({
  ProductID: {
    type: String,
    ref: "Product",
    required: true,
  },
  UserID: {
    type: String,
    ref: "User",
    required: true,
  },
  Rating: {
    type: Number,
    required: true,
  },
  Time: {
    type: Number,
    default: () => Math.floor(Date.now() / 1000),
  },
  reviewerName: {
    type: String,
    required: true,
  },
  reviewText: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("Review", reviewSchema);
