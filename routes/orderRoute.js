const express = require("express");
const {
  createOrder,
  getOrder,
  getAllOrder,
  updateOrder,
  deleteOrder,
  getAllUserOrder,
  cancelOrder,
  generateInvoice,
} = require("../controllers/orderController");

const router = express.Router();

const { isAuth, isAdmin } = require("../middlewares/verifyToken");

router.post("/create", isAuth, createOrder);

router.get("/single/:id", isAuth, getOrder);

router.get("/user", isAuth, getAllUserOrder);

router.get("/invoice/:id", isAuth, generateInvoice);

router.get("/", isAuth, isAdmin, getAllOrder);

router.put("/cancel/:id", isAuth, cancelOrder);

router.put("/:id", isAuth, updateOrder);

router.delete("/:id", isAuth, deleteOrder);

module.exports = router;
