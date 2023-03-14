const mongoose = require("mongoose");
const productModel = require("../models/productModel");
const reviewModel = require("../models/reviewModel");
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
    // console.log(query);

    const products = await productModel.aggregate([
      {
        $search: {
          index: "searchIndex",
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
      // {
      //   $limit: 10,
      // },
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
    const ProductData = await productModel.aggregate([
      {
        $match: {
          _id: id,
        },
      },
      {
        $lookup: {
          from: "reviews",
          localField: "_id",
          foreignField: "ProductID",
          as: "reviews",
        },
      },
      {
        $addFields: {
          rating: {
            $avg: "$reviews.Rating",
          },
        },
      },
      {
        $project: {
          _id: 1,
          title: 1,
          brand: 1,
          price: { $round: ["$price", 2] },
          MRP: { $round: ["$MRP", 2] },
          description: 1,
          feature: 1,
          imageURL: 1,
          imageURLHighRes: 1,
          mainCategory: 1,
          category: 1,
          quantity: 1,
          rating: { $round: ["$rating", 1] },
          totalReviews: { $size: "$reviews" },
        },
      },
    ]);

    if (ProductData.length === 0) {
      res.status(404).json({ message: "No product found" });
      return;
    }
    res.status(200).json({ data: ProductData[0] });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getFeaturedProducts = async (req, res) => {
  try {
    const ProductData = await productModel.aggregate([
      {
        $match: {
          active: true,
        },
      },
      {
        $sample: { size: 5 },
      },
      {
        $lookup: {
          from: "reviews",
          localField: "_id",
          foreignField: "ProductID",
          as: "reviews",
        },
      },
      {
        $addFields: {
          imageUrl: {
            $first: "$imageURLHighRes",
          },
          category: {
            $first: "$category",
          },
          rating: {
            $avg: "$reviews.Rating",
          },
        },
      },
      {
        $project: {
          _id: 1,
          title: 1,
          brand: 1,
          price: { $round: ["$price", 2] },
          MRP: { $round: ["$MRP", 2] },
          imageUrl: 1,
          category: 1,
          rating: { $round: ["$rating", 1] },
        },
      },
    ]);
    res.status(200).json({ data: ProductData });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const bestSelling = async (req, res) => {
  try {
    const products = await reviewModel.aggregate([
      {
        $group: {
          _id: "$ProductID",
          count: { $count: {} },
          rating: { $avg: "$Rating" },
        },
      },
      {
        $sort: { count: -1 },
      },
      {
        $limit: 10,
      },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "productData",
        },
      },
      {
        $unwind: "$productData",
      },
      {
        $addFields: {
          imageUrl: {
            $first: "$productData.imageURLHighRes",
          },
          category: {
            $first: "$productData.category",
          },
        },
      },
      {
        $project: {
          _id: "$productData._id",
          title: "$productData.title",
          brand: "$productData.brand",
          price: { $round: ["$productData.price", 2] },
          MRP: { $round: ["$productData.MRP", 2] },

          // price: { $round: ["$productData.price", 2] },
          // MRP: { $round: ["$productData.MRP", 2] },
          imageUrl: 1,
          category: 1,
          rating: { $round: ["$rating", 1] },
          count: 1,
        },
      },
    ]);
    res.status(200).json({ data: products });
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
  getFeaturedProducts,
  bestSelling,
};
