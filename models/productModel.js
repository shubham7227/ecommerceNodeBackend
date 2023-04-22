const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const productSchema = Schema(
  {
    _id: {
      type: String,
      default: () => new mongoose.Types.ObjectId().toString(),
    },
    title: {
      type: String,
      required: true,
    },
    brandId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: "Brand",
    },
    feature: {
      type: String,
      required: true,
    },
    categoryId: [
      {
        type: Schema.Types.ObjectId,
        required: true,
        ref: "Category",
      },
    ],
    imageURL: [
      {
        type: String,
        required: true,
      },
    ],
    imageURLHighRes: [
      {
        type: String,
        required: true,
      },
    ],
    description: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    MRP: {
      type: Number,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    active: {
      type: Boolean,
      required: true,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
