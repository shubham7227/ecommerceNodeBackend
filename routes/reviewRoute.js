const express = require("express");
const {
  addReview,
  getReview,
  getAllReviews,
  updateReview,
  deleteReview,
  getReviewByUser,
  getReviewByProduct,
} = require("../controllers/reviewController");

const router = express.Router();

const { isAuth, isAdmin } = require("../middlewares/verifyToken");

router.post("/add", isAuth, addReview);

router.get("/:id", getReview);

router.get("/", isAuth, isAdmin, getAllReviews);

router.get("/byuser/:id", getReviewByUser);

router.get("/byproduct/:id", getReviewByProduct);

router.put("/:id", isAuth, updateReview);

router.delete("/:id", isAuth, deleteReview);

module.exports = router;
