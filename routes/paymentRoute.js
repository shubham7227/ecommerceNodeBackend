const express = require("express");
const { createStripeIntent } = require("../controllers/paymentController");
const { isAuth } = require("../middlewares/verifyToken");

const router = express.Router();

router.post("/stripe", isAuth, createStripeIntent);

module.exports = router;
