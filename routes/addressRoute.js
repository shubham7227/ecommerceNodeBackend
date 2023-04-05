const express = require("express");
const {
  addAddress,
  getAddress,
  getAllAddress,
  updateAddress,
  deleteAddress,
  getAllAddressUser,
} = require("../controllers/addressController");
const router = express.Router();

const { isAuth, isAdmin } = require("../middlewares/verifyToken");

router.post("/add", isAuth, addAddress);

router.get("/single/:id", isAuth, getAddress);

router.get("/user", isAuth, getAllAddressUser);

router.get("/", isAuth, isAdmin, getAllAddress);

router.put("/:id", isAuth, updateAddress);

router.delete("/:id", isAuth, deleteAddress);

module.exports = router;
