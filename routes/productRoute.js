const express = require("express");
const router = express.Router();

const {
  addProduct,
  searchProduct,
  getProduct,
  getAllProducts,
  updateProduct,
  deleteProduct,
} = require("../controllers/productController");

const { isAuth, isAdmin } = require("../middlewares/verifyToken");

router.post("/add", addProduct);

router.get("/search", searchProduct);

router.get("/", getAllProducts);

router.get("/:id", getProduct);

router.put("/:id", isAuth, isAdmin, updateProduct);

router.delete("/:id", isAuth, isAdmin, deleteProduct);

module.exports = router;
