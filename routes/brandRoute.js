const express = require("express");
const {
  addBrand,
  getBrand,
  getAllBrand,
  updateBrand,
  deleteBrand,
  getFilteredBrand,
} = require("../controllers/brandController");

const router = express.Router();

const { isAuth, isAdmin } = require("../middlewares/verifyToken");

router.post("/add", isAuth, isAdmin, addBrand);

router.get("/search", getFilteredBrand);

router.get("/:id", getBrand);

router.get("/", isAuth, isAdmin, getAllBrand);

router.put("/:id", isAuth, isAdmin, updateBrand);

router.delete("/:id", isAuth, isAdmin, deleteBrand);

module.exports = router;
