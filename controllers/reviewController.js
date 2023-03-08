const mongoose = require("mongoose");
const reviewModel = require("../models/reviewModel");
const ObjectId = mongoose.Types.ObjectId;

const addReview = async (req, res) => {
  try {
    const {
      ProductID,
      UserID,
      Rating,
      user,
      product_id,
      reviewerName,
      reviewText,
      summary,
    } = req.body;
    const newReview = await reviewModel.create({
      ProductID,
      UserID,
      Rating,
      user,
      product_id,
      reviewerName,
      reviewText,
      summary,
    });
    res.status(201).json({ data: newReview });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  addReview,
};
