const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const orderSchema = Schema({
  userId: {
    type: String,
    required: true,
    ref: "User",
  },
  address: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Address",
  },
  products: [
    {
      id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "Product",
      },
      quantity: {
        type: Number,
        required: true,
      },
      price: {
        type: Number,
        required: true,
      },
    },
  ],
  totalAmount: {
    type: Number,
    required: true,
  },
  orderDate: {
    type: Date,
    default: Date.now,
  },
  deliveredDate: {
    type: Date,
  },
  status: {
    type: String,
    enum: ["Processing", "Delivered", "Cancelled", "Placed"],
    default: "Placed",
  },
});

module.exports = mongoose.model("Order", orderSchema);
