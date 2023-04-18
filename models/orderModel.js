const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const orderSchema = Schema({
  userId: {
    type: String,
    required: true,
    ref: "User",
  },
  addressId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Address",
  },
  paymentMethod: {
    type: String,
    required: true,
  },
  paymentId: {
    type: String,
    required: true,
  },
  orderId: {
    type: String,
    unique: true,
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
      price: {
        type: Number,
        required: true,
      },
      subTotal: {
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
  cancelledDate: {
    type: Date,
  },
  status: {
    type: String,
    enum: ["Processing", "Delivered", "Cancelled", "Placed"],
    default: "Placed",
  },
});

orderSchema.pre("save", async function (next) {
  const count = await mongoose.model("Order", orderSchema).countDocuments();
  if (!this.orderId) {
    const newOrderId = (count + 1).toString();
    this.orderId = "Order" + "-" + newOrderId;
    next();
  } else {
    next();
  }
});

module.exports = mongoose.model("Order", orderSchema);
