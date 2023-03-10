const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const brandSchema = Schema(
  {
    title: {
      type: String,
      required: true,
      unique: true,
    },
    products: [
      {
        type: String,
        ref: "Product",
      },
    ],
    active: {
      type: Boolean,
      required: true,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Brand", brandSchema);
