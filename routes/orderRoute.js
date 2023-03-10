const express = require("express");
const {
  createOrder,
  getOrder,
  getAllOrder,
  updateOrder,
  deleteOrder,
  getAllUserOrder,
} = require("../controllers/orderController");

const router = express.Router();

const { isAuth, isAdmin } = require("../middlewares/verifyToken");

router.post("/add", isAuth, createOrder);

router.get("/:id", isAuth, getOrder);

router.get("/user/:id", isAuth, getAllUserOrder);

router.get("/", isAuth, isAdmin, getAllOrder);

router.put("/:id", isAuth, updateOrder);

router.delete("/:id", isAuth, deleteOrder);

module.exports = router;
