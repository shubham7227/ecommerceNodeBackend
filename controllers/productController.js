const mongoose = require("mongoose");
const productModel = require("../models/productModel");
const ObjectId = mongoose.Types.ObjectId;

const addProduct = async (req, res) => {
  try {
    const {
      title,
      brand,
      feature,
      imageURL,
      imageURLHighRes,
      description,
      price,
      MRP,
      quantity,
    } = req.body;
    const newProduct = await productModel.create({
      title,
      brand,
      feature,
      imageURL,
      imageURLHighRes,
      description,
      price,
      MRP,
      quantity,
    });
    res.status(201).json({ data: newProduct });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  addProduct,
};
