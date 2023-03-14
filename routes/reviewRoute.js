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

router.get("/:id", getReview);

router.get("/", isAuth, isAdmin, getAllReviews);

router.get("/check/:id", isAuth, checkReview);

router.get("/byuser/:id", getReviewByUser);

router.get("/byproduct/:id", getReviewByProduct);

router.get("/rating/:id", getRatingByProduct);

router.put("/:id", isAuth, updateReview);

router.delete("/:id", isAuth, deleteReview);

module.exports = router;
