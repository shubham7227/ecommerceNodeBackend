const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const paymentSchema = Schema(
  {
    userId: {
      type: String,
      required: true,
      ref: "User",
    },
    processed: {
      type: Boolean,
      default: false,
    },
    totalAmount: {
      type: Number,
      required: true,
    },
    totalDAI: {
      type: Number,
    },
    clientAddress: {
      type: String,
    },
    blockHash: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Payment", paymentSchema);
