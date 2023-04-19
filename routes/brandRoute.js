const express = require("express");
const {
  addBrand,
  getBrand,
  getAllBrand,
  updateBrand,
  deleteBrand,
  getFilteredBrand,
  getSearchedBrand,
} = require("../controllers/brandController");

const router = express.Router();

const { isAuth, isAdmin } = require("../middlewares/verifyToken");

router.post("/add", isAuth, isAdmin, addBrand);

router.get("/search", getFilteredBrand);

router.get("/select-search", getSearchedBrand);

router.get("/:id", getBrand);

router.get("/", getAllBrand);

router.put("/:id", isAuth, isAdmin, updateBrand);

router.delete("/:id", isAuth, isAdmin, deleteBrand);

module.exports = router;
