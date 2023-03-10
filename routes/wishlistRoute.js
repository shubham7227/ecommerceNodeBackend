const express = require("express");
const {
  addWishlist,
  getWishlist,
  getAllWishlist,
  updateWishlist,
  deleteWishlist,
  getAllWishlistUser,
} = require("../controllers/wishlistController");
const router = express.Router();

const { isAuth, isAdmin } = require("../middlewares/verifyToken");

router.post("/add", isAuth, addWishlist);

router.get("/:id", isAuth, getWishlist);

router.get("/user/:id", isAuth, getAllWishlistUser);

router.get("/", isAuth, isAdmin, getAllWishlist);

router.put("/:id", isAuth, updateWishlist);

router.delete("/:id", isAuth, deleteWishlist);

module.exports = router;
