const express = require("express");
const {
  addWishlist,
  deleteWishlist,
  getAllWishlistUser,
} = require("../controllers/wishlistController");
const router = express.Router();

const { isAuth } = require("../middlewares/verifyToken");

router.post("/add", isAuth, addWishlist);

router.get("/user", isAuth, getAllWishlistUser);

router.delete("/:id", isAuth, deleteWishlist);

module.exports = router;
