const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const cartSchema = Schema({
  userId: {
    type: String,
    required: true,
    ref: "User",
  },
  products: [
    {
      id: {
        type: String,
        required: true,
        ref: "Product",
      },
      quantity: {
        type: Number,
        required: true,
      },
    },
  ],
});

module.exports = mongoose.model("Cart", cartSchema);
