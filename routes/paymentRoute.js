const express = require("express");
const {
  createStripeIntent,
  createCryptoIntent,
} = require("../controllers/paymentController");
const { isAuth } = require("../middlewares/verifyToken");

const router = express.Router();

router.post("/stripe", isAuth, createStripeIntent);

router.post("/crypto", isAuth, createCryptoIntent);

module.exports = router;
