const express = require("express");
const {
  addCategory,
  getCategory,
  getAllCategory,
  updateCategory,
  deleteCategory,
  getFeaturedCategory,
  getFilteredCategory,
  getSearchedCategory,
  getCategoryProductsAdmin,
  getCategoryAdmin,
} = require("../controllers/categoryController");

const router = express.Router();

const { isAuth, isAdmin } = require("../middlewares/verifyToken");
const { upload } = require("../middlewares/multer");

router.post("/add", isAuth, isAdmin, upload.single("image"), addCategory);

router.get("/", getAllCategory);

router.get("/featured", getFeaturedCategory);

router.get("/search", getFilteredCategory);

router.get("/select-search", getSearchedCategory);

router.get("/:id", getCategory);

router.get("/single/:id", isAuth, isAdmin, getCategoryAdmin);

router.get("/products/:id", isAuth, isAdmin, getCategoryProductsAdmin);

router.put("/:id", isAuth, isAdmin, upload.single("image"), updateCategory);

router.delete("/:id", isAuth, isAdmin, deleteCategory);

module.exports = router;
