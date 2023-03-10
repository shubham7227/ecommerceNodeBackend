const mongoose = require("mongoose");
const productModel = require("../models/productModel");
const ObjectId = mongoose.Types.ObjectId;

const addProduct = async (req, res) => {
  try {
    const {
      title,
      Product,
      feature,
      imageURL,
      imageURLHighRes,
      description,
      price,
      MRP,
      quantity,
      category,
    } = req.body;
    const newProduct = await productModel.create({
      title,
      Product,
      feature,
      imageURL,
      imageURLHighRes,
      description,
      price,
      MRP,
      quantity,
      category,
    });
    res.status(200).json({ data: newProduct });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const searchProduct = async (req, res) => {
  try {
    const query = req.query.query;
    console.log(query);

    const products = await productModel.aggregate([
      {
        $search: {
          index: "productIndex",
          text: {
            path: "title",
            // path: ["title", "Product"],
            query: query,
            fuzzy: {
              maxEdits: 1,
              maxExpansions: 100,
            },
          },
        },
      },
      {
        $limit: 10,
      },
      {
        $project: {
          _id: 0,
          title: 1,
          score: { $meta: "searchScore" },
        },
      },
    ]);

    res.status(200).json({ data: products });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getProduct = async (req, res) => {
  try {
    const id = req.params.id;
    const ProductData = await productModel.find({ _id: id });
    res.status(200).json({ data: ProductData });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllProducts = async (req, res) => {
  try {
    const allProducts = await productModel.find();
    res.status(200).json({ data: allProducts });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateProduct = async (req, res) => {
  try {
    const id = req.params.id;
    const { title } = req.body;
    const toUpdateData = await productModel.findById(id);

    toUpdateData.title = title || toUpdateData.title;

    await toUpdateData.save();
    res.status(200).json({ data: toUpdateData });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const id = req.params.id;
    const data = await productModel.findByIdAndUpdate(id, { active: false });
    res.status(200).json({ data: data });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  addProduct,
  searchProduct,
  getProduct,
  getAllProducts,
  updateProduct,
  deleteProduct,
};
