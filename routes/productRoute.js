const express = require("express");
const router = express.Router();

const {
  addProduct,
  searchProduct,
  getProduct,
  getAllProducts,
  updateProduct,
  deleteProduct,
  getFeaturedProducts,
  bestSelling,
  getSearchedProducts,
} = require("../controllers/productController");

const { isAuth, isAdmin } = require("../middlewares/verifyToken");
const { upload } = require("../middlewares/multer");

router.post("/add", isAuth, isAdmin, upload.array("images"), addProduct);

router.get("/search", searchProduct);

router.get("/", isAuth, isAdmin, getAllProducts);

router.get("/featured", getFeaturedProducts);

router.get("/best-selling", bestSelling);

router.get("/select-search", getSearchedProducts);

router.get("/:id", getProduct);

router.put("/:id", isAuth, isAdmin, upload.array("images"), updateProduct);

router.delete("/:id", isAuth, isAdmin, deleteProduct);

module.exports = router;
