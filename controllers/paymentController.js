require("dotenv").config();
const stripe = require("stripe")(process.env.STRIPE_PRIVATE_KEY);

const createStripeIntent = async (req, res) => {
  try {
    const { totalAmount } = req.body;

    const payment = await stripe.paymentIntents.create({
      amount: totalAmount * 100,
      currency: "inr",
    });

    res.status(200).json({ clientSecret: payment.client_secret });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createStripeIntent,
};
