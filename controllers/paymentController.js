const paymentModel = require("../models/paymentModel");

require("dotenv").config();
const stripe = require("stripe")(process.env.STRIPE_PRIVATE_KEY);

const createStripeIntent = async (req, res) => {
  try {
    const { totalAmount } = req.body;

    const formattedAmount = parseFloat(
      (parseFloat(totalAmount) * 100).toFixed(0)
    );
    const payment = await stripe.paymentIntents.create({
      amount: formattedAmount,
      currency: "inr",
    });

    res.status(200).json({ clientSecret: payment.client_secret });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const createCryptoIntent = async (req, res) => {
  try {
    const userId = req.user.userId;

    const { totalAmount } = req.body;

    const paymentData = await paymentModel.create({
      userId: userId,
      totalAmount: totalAmount,
    });

    res.status(200).json({ paymentId: paymentData._id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createStripeIntent,
  createCryptoIntent,
};
