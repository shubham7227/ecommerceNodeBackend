const mongoose = require("mongoose");
const reviewModel = require("../models/reviewModel");
const userModel = require("../models/userModel");
const ObjectId = mongoose.Types.ObjectId;

const addReview = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { id, rating, reviewText } = req.body;
    if (!id || !rating || !reviewText) {
      res.status(404).json({ message: "Missing data" });
      return;
    }

    const userDetails = await userModel.findById(userId, { name: 1 });
    const reviewerName = userDetails.name;

    const checkDuplicate = await reviewModel.findOne({
      ProductID: id,
      UserID: userId,
    });

    if (checkDuplicate) {
      res.status(402).json({ messsage: "Review already exists" });
      return;
    }

    const newReview = await reviewModel.create({
      ProductID: id,
      UserID: userId,
      Rating: rating,
      reviewerName,
      reviewText,
    });

    const timeConverted = new Date(newReview.Time * 1000).toISOString();
    const data = {
      _id: newReview._id,
      Rating: newReview.Rating,
      Time: timeConverted,
      reviewerName: newReview.reviewerName,
      reviewText: newReview.reviewText,
    };

    res.status(200).json({ data: data });
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

const checkReview = async (req, res) => {
  try {
    const { userId } = req.user;
    const id = req.params.id;
    const reviewData = await reviewModel.aggregate([
      {
        $match: {
          ProductID: id,
          UserID: userId,
        },
      },
      {
        $project: {
          Rating: 1,
          Time: {
            $toLong: {
              $toDate: {
                $multiply: ["$Time", 1000],
              },
            },
          },
          reviewerName: 1,
          reviewText: 1,
        },
      },
    ]);

    const found = reviewData.length > 0 ? true : false;
    const data = found ? reviewData[0] : "";

    res.status(200).json({ data: data, found });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getReviewByProduct = async (req, res) => {
  try {
    const id = req.params.id;

    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit);
    const sortField = req.query.field || "Rating";
    const sortOrder = req.query.order || "DESC";

    const ReviewData = await reviewModel.aggregate([
      {
        $match: {
          ProductID: id,
        },
      },
      {
        $project: {
          Rating: 1,
          Time: {
            $toLong: {
              $toDate: {
                $multiply: ["$Time", 1000],
              },
            },
          },
          reviewerName: 1,
          reviewText: 1,
        },
      },
      {
        $sort: {
          [sortField]: sortOrder === "DESC" ? -1 : 1,
        },
      },
      {
        $facet: {
          data: [{ $skip: (page - 1) * limit }, { $limit: limit }],
          totalCount: [
            {
              $count: "total",
            },
          ],
        },
      },
    ]);

    const toSendData = ReviewData[0].data;
    const toSendTotal = ReviewData[0].totalCount[0];

    res.status(200).json({
      data: toSendData,
      count: toSendTotal?.total || 0,
      page: page,
      limit,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getRatingByProduct = async (req, res) => {
  try {
    const id = req.params.id;
    const ratingData = await reviewModel.aggregate([
      { $match: { ProductID: id } },
      {
        $group: {
          _id: "$Rating",
          count: { $sum: 1 },
        },
      },
      {
        $sort: { _id: -1 },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$count" },
          weightedRating: { $sum: { $multiply: ["$_id", "$count"] } },
          ratings: { $push: { id: "$_id", count: "$count" } },
        },
      },
      {
        $addFields: {
          averageRating: { $divide: ["$weightedRating", "$total"] },
        },
      },
      {
        $project: {
          _id: 0,
          total: 1,
          averageRating: { $round: ["$averageRating", 1] },
          ratings: 1,
        },
      },
    ]);

    res.status(200).json({ data: ratingData[0] });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getReviewByUser = async (req, res) => {
  try {
    const id = req.user.userId;

    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit);

    const totalCount = await reviewModel
      .find({
        UserID: id,
      })
      .countDocuments();

    const ReviewData = await reviewModel.aggregate([
      { $match: { UserID: id } },
      {
        $sort: {
          Time: -1,
        },
      },
      {
        $skip: (page - 1) * limit,
      },
      {
        $limit: limit,
      },
      {
        $lookup: {
          from: "products",
          localField: "ProductID",
          foreignField: "_id",
          as: "productData",
        },
      },
      {
        $unwind: "$productData",
      },
      {
        $project: {
          title: "$productData.title",
          ProductID: 1,
          Rating: 1,
          reviewText: 1,
          Time: {
            $toLong: {
              $toDate: {
                $multiply: ["$Time", 1000],
              },
            },
          },
        },
      },
    ]);
    res
      .status(200)
      .json({ data: ReviewData, count: totalCount, page: page, limit });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllReviews = async (req, res) => {
  try {
    const allReviews = await reviewModel.find();
    res.status(200).json({ data: allReviews });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateReview = async (req, res) => {
  try {
    const userId = req.user.userId;
    const reviewId = req.params.id;
    const { rating, reviewText } = req.body;

    const userDetails = await userModel.findById(userId, { name: 1 });
    const reviewerName = userDetails.name;

    const toUpdateData = await reviewModel.findById(reviewId);

    if (!toUpdateData) {
      res.status(404).json({ message: "Review not found" });
      return;
    }

    toUpdateData.Rating = rating || toUpdateData.Rating;
    toUpdateData.reviewerName = reviewerName || toUpdateData.reviewerName;
    toUpdateData.reviewText = reviewText || toUpdateData.reviewText;

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
  checkReview,
  getReviewByProduct,
  getRatingByProduct,
  getReviewByUser,
  getAllReviews,
  updateReview,
  deleteReview,
};
