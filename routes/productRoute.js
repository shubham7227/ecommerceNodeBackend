const express = require("express");
const router = express.Router();

const { addProduct } = require("../controllers/productController");
const { isAuth, isAdmin } = require("../middlewares/verifyToken");

router.post("/add", addProduct);

module.exports = router;
