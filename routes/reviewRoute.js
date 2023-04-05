const express = require("express");
const {
  addReview,
  getReview,
  getAllReviews,
  updateReview,
  deleteReview,
  getReviewByUser,
  getReviewByProduct,
  getRatingByProduct,
  checkReview,
} = require("../controllers/reviewController");

const router = express.Router();

const { isAuth, isAdmin } = require("../middlewares/verifyToken");

router.post("/add", isAuth, addReview);

router.get("/", isAuth, isAdmin, getAllReviews);

router.get("/byuser", isAuth, getReviewByUser);

router.get("/single/:id", getReview);

router.get("/check/:id", isAuth, checkReview);

router.get("/byproduct/:id", getReviewByProduct);

router.get("/rating/:id", getRatingByProduct);

router.put("/:id", isAuth, updateReview);

router.delete("/:id", isAuth, deleteReview);

module.exports = router;
