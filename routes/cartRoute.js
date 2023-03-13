const express = require("express");
const {
  addItemCart,
  getCartItems,
  getForProductIds,
  removeCartItem,
} = require("../controllers/cartController");

const router = express.Router();

const { isAuth, isAdmin } = require("../middlewares/verifyToken");

router.post("/add", isAuth, addItemCart);

router.post("/by-productIds", getForProductIds);

router.get("/user", isAuth, getCartItems);

router.delete("/product/:id", isAuth, removeCartItem);

module.exports = router;
