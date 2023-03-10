const express = require("express");
const router = express.Router();

const {
  addProduct,
  searchProduct,
} = require("../controllers/productController");
const { isAuth, isAdmin } = require("../middlewares/verifyToken");

router.post("/add", addProduct);

router.get("/search", searchProduct);

module.exports = router;
