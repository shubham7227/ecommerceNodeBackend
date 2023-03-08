const express = require("express");
const { addReview } = require("../controllers/reviewController");
const router = express.Router();

const { isAuth, isAdmin } = require("../middlewares/verifyToken");

router.post("/add", addReview);

module.exports = router;
