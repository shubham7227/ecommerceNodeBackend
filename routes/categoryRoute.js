const express = require("express");
const {
  addCategory,
  getCategory,
  getAllCategory,
  updateCategory,
  deleteCategory,
} = require("../controllers/categoryController");

const router = express.Router();

const { isAuth, isAdmin } = require("../middlewares/verifyToken");

router.post("/add", isAuth, isAdmin, addCategory);

router.get("/:id", isAuth, getCategory);

router.get("/", isAuth, getAllCategory);

router.put("/:id", isAuth, isAdmin, updateCategory);

router.delete("/:id", isAuth, isAdmin, deleteCategory);

module.exports = router;
