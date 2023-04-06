const express = require("express");
const {
  addCategory,
  getCategory,
  getAllCategory,
  updateCategory,
  deleteCategory,
  getFeaturedCategory,
  getFilteredCategory,
} = require("../controllers/categoryController");

const router = express.Router();

const { isAuth, isAdmin } = require("../middlewares/verifyToken");

router.post("/add", isAuth, isAdmin, addCategory);

router.get("/", getAllCategory);

router.get("/featured", getFeaturedCategory);

router.get("/search", getFilteredCategory);

router.get("/:id", getCategory);

router.put("/:id", isAuth, isAdmin, updateCategory);

router.delete("/:id", isAuth, isAdmin, deleteCategory);

module.exports = router;
