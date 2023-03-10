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
  time: {
    type: Date,
    default: Date.now,
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
