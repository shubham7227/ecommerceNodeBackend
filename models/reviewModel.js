const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const reviewSchema = Schema({
  ProductID: {
    type: String,
    required: true,
  },
  UserID: {
    type: String,
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
  user: {
    type: Number,
  },
  product_id: {
    type: Number,
  },
  reviewerName: {
    type: String,
    required: true,
  },
  reviewText: {
    type: String,
    required: true,
  },
  summary: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("Review", reviewSchema);
