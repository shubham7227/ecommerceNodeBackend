const mongoose = require("mongoose");
const categoryModel = require("../models/categoryModel");
const productModel = require("../models/productModel");
const ObjectId = mongoose.Types.ObjectId;

const addCategory = async (req, res) => {
  try {
    const {} = req.body;
    const newCategory = await categoryModel.create({});
    res.status(200).json({ data: newCategory });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getCategory = async (req, res) => {
  try {
    const id = req.params.id;

    const categoryData = await categoryModel.findById(id);

    const productIds = categoryData.products;

    const productData = await productModel.aggregate([
      {
        $match: {
          _id: { $in: productIds },
          active: true,
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
          price: 1,
          MRP: 1,
          imageUrl: 1,
          category: 1,
          rating: { $round: ["$rating", 1] },
        },
      },
    ]);

    res.status(200).json({ data: productData, title: categoryData.title });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getFeaturedCategory = async (req, res) => {
  try {
    const categories = await categoryModel.aggregate([
      {
        $match: {
          active: true,
        },
      },
      {
        $project: {
          _id: 1,
          title: 1,
          products: 1,
          count: {
            $cond: {
              if: { $isArray: "$products" },
              then: { $size: "$products" },
              else: "0",
            },
          },
        },
      },
      { $match: { count: { $gt: 100 } } },
      {
        $sample: { size: 5 },
      },
    ]);

    const data = [];

    for (const entry of categories) {
      const randomInt = Math.floor(Math.random() * entry.count);
      const randomProduct = entry.products[randomInt];

      const productData = await productModel.findById(randomProduct, {
        imageURLHighRes: 1,
      });

      data.push({
        _id: entry._id,
        count: entry.count,
        title: entry.title,
        imageUrl: productData.imageURLHighRes[0],
      });
    }

    res.status(200).json({ data: data });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getFilteredCategory = async (req, res) => {
  try {
    let query = req.query.query;
    let page = req.query.page || 1;
    let limit = req.query.limit || 20;

    page = parseInt(page);
    limit = parseInt(limit);

    const searchQuery = [];

    if (query) {
      searchQuery.push({
        $search: {
          index: "categorysearch",
          text: {
            path: "title",
            query: query,
            fuzzy: {},
          },
        },
      });
    }

    const categories = await categoryModel.aggregate([
      ...searchQuery,
      {
        $match: {
          active: true,
        },
      },
      {
        $addFields: {
          product: { $arrayElemAt: ["$products", 0] },
        },
      },
      {
        $lookup: {
          from: "products",
          localField: "product",
          foreignField: "_id",
          as: "productData",
        },
      },
      {
        $unwind: "$productData",
      },
      {
        $project: {
          _id: 1,
          title: 1,
          imageUrl: { $arrayElemAt: ["$productData.imageURLHighRes", 0] },
          count: {
            $cond: {
              if: { $isArray: "$products" },
              then: { $size: "$products" },
              else: "0",
            },
          },
        },
      },
      {
        $facet: {
          data: [{ $skip: (page - 1) * limit }, { $limit: limit }],
          totalCount: [
            {
              $count: "total",
            },
          ],
        },
      },
    ]);

    const toSendData = categories[0].data;
    const totalCategories = categories[0].totalCount[0];

    res.status(200).json({
      data: toSendData,
      searchQuery: query,
      limit,
      currentPage: page,
      totalCategories: totalCategories?.total || 0,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getSearchedCategory = async (req, res) => {
  try {
    const { searchQuery } = req.query;

    const searchQueryAgg = [];

    if (searchQuery) {
      searchQueryAgg.push({
        $match: {
          title: new RegExp(searchQuery, "i"),
        },
      });
    }

    const categoriesData = await categoryModel.aggregate([
      ...searchQueryAgg,
      {
        $match: {
          active: true,
        },
      },
      { $limit: 10 },
      {
        $project: {
          _id: 0,
          value: "$title",
          label: "$title",
        },
      },
    ]);

    res.status(200).json({ data: categoriesData });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllCategory = async (req, res) => {
  try {
    let sortOrder = req.query.sortOrder;

    let searchQuery = req.query.searchQuery;
    let page = req.query.page || 1;
    let limit = req.query.limit || 10;

    page = parseInt(page);
    limit = parseInt(limit);

    const searchQueryAgg = [];

    if (searchQuery) {
      searchQueryAgg.push({
        $match: {
          title: new RegExp(searchQuery, "i"),
        },
      });
    }

    const sortQueryAgg = [];
    if (sortOrder) {
      const _sortOrder = JSON.parse(sortOrder);
      sortQueryAgg.push({
        $sort: { ..._sortOrder },
      });
    }

    const categoriesData = await categoryModel.aggregate([
      ...searchQueryAgg,
      {
        $match: {
          active: true,
        },
      },
      {
        $addFields: {
          product: { $arrayElemAt: ["$products", 0] },
        },
      },
      {
        $lookup: {
          from: "products",
          localField: "product",
          foreignField: "_id",
          as: "productData",
        },
      },
      {
        $unwind: "$productData",
      },
      {
        $project: {
          _id: 1,
          title: 1,
          imageUrl: { $arrayElemAt: ["$productData.imageURLHighRes", 0] },
          count: {
            $cond: {
              if: { $isArray: "$products" },
              then: { $size: "$products" },
              else: "0",
            },
          },
        },
      },
      ...sortQueryAgg,
      {
        $facet: {
          data: [{ $skip: (page - 1) * limit }, { $limit: limit }],
          totalCount: [
            {
              $count: "total",
            },
          ],
        },
      },
    ]);

    const allCategoriesData = categoriesData[0].data;
    const totalCategories = categoriesData[0].totalCount[0];

    res.status(200).json({
      data: allCategoriesData,
      totalCategories: totalCategories?.total || 0,
      currentPage: page,
      limit: limit,
      searchQuery: searchQuery,
      sortOrder: sortOrder,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateCategory = async (req, res) => {
  try {
    const id = req.params.id;
    const { title } = req.body;
    const toUpdateData = await categoryModel.findById(id);

    toUpdateData.title = title || toUpdateData.title;

    await toUpdateData.save();
    res.status(200).json({ data: toUpdateData });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const id = req.params.id;
    const data = await productModel.findByIdAndUpdate(id, { active: false });
    res.status(200).json({ data: data });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  addCategory,
  getCategory,
  getAllCategory,
  updateCategory,
  deleteCategory,
  getFeaturedCategory,
  getFilteredCategory,
  getSearchedCategory,
};
