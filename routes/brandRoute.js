const express = require("express");
const {
  addBrand,
  getBrand,
  getAllBrand,
  updateBrand,
  deleteBrand,
  getFilteredBrand,
  getSearchedBrand,
  getBrandProductsAdmin,
  getBrandAdmin,
} = require("../controllers/brandController");

const router = express.Router();

const { isAuth, isAdmin } = require("../middlewares/verifyToken");
const { upload } = require("../middlewares/multer");

router.post("/add", isAuth, isAdmin, upload.single("image"), addBrand);

router.get("/search", getFilteredBrand);

router.get("/select-search", getSearchedBrand);

router.get("/:id", getBrand);

router.get("/single/:id", isAuth, isAdmin, getBrandAdmin);

router.get("/products/:id", isAuth, isAdmin, getBrandProductsAdmin);

router.get("/", getAllBrand);

router.put("/:id", isAuth, isAdmin, upload.single("image"), updateBrand);

router.delete("/:id", isAuth, isAdmin, deleteBrand);

module.exports = router;
