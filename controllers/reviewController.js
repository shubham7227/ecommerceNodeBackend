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
    res.status(200).json({ data: newReview });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getReview = async (req, res) => {
  try {
    const id = req.params.id;
    const ReviewData = await reviewModel.findById(id);
    res.status(200).json({ data: ReviewData });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllReviews = async (req, res) => {
  try {
    const allReviews = await reviewModel.find();
    res.status(200).json({ data: allReview });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateReview = async (req, res) => {
  try {
    const id = req.params.id;
    const { title } = req.body;
    const toUpdateData = await reviewModel.findById(id);

    toUpdateData.title = title || toUpdateData.title;

    await toUpdateData.save();
    res.status(200).json({ data: toUpdateData });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteReview = async (req, res) => {
  try {
    const id = req.params.id;
    const data = await reviewModel.findByIdAndDelete(id);
    res.status(200).json({ data: data });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  addReview,
  getReview,
  getAllReviews,
  updateReview,
  deleteReview,
};
