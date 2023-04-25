const mongoose = require("mongoose");
const categoryModel = require("../models/categoryModel");
const productModel = require("../models/productModel");
const { cloudinaryUpload } = require("../utils/cloudinary");
const fs = require("fs");
const ObjectId = mongoose.Types.ObjectId;

const addCategory = async (req, res) => {
  try {
    const { title, products } = req.body;
    const file = req.file;

    if (!title || !file) {
      res
        .status(402)
        .json({ message: "Incomplete data. Title or image missing" });
      return;
    }

    const checkDuplicate = await categoryModel.findOne({ title });

    if (checkDuplicate) {
      res.status(402).json({ message: "Category already exists" });
      return;
    }

    let newImageUrl;
    if (file) {
      const { path } = file;
      const recevData = await cloudinaryUpload(path, "Category");
      newImageUrl = recevData.secure_url;
      fs.unlinkSync(path);
    }

    const newCategory = await categoryModel.create({
      title,
      featuredImage: newImageUrl,
    });

    const newId = newCategory._id;

    await productModel.updateMany(
      { _id: { $in: products } },
      {
        $push: { categoryId: newId },
      }
    );

    res.status(200).json({ data: newCategory });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getCategory = async (req, res) => {
  try {
    const id = req.params.id;

    const categoryData = await categoryModel.findById(id);

    const productData = await productModel.aggregate([
      {
        $match: {
          categoryId: new ObjectId(id),
          active: true,
        },
      },
      {
        $addFields: {
          firstCategory: {
            $first: "$categoryId",
          },
        },
      },
      {
        $lookup: {
          from: "brands",
          localField: "brandId",
          foreignField: "_id",
          as: "brandData",
        },
      },
      {
        $lookup: {
          from: "categories",
          localField: "firstCategory",
          foreignField: "_id",
          as: "categoryData",
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
          brand: {
            $first: "$brandData.title",
          },
          category: {
            $first: "$categoryData.title",
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

const getCategoryAdmin = async (req, res) => {
  try {
    const id = req.params.id;

    const categoryData = await categoryModel.findById(id, {
      _id: 1,
      title: 1,
      featuredImage: 1,
    });

    res.status(200).json({ data: categoryData });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getCategoryProductsAdmin = async (req, res) => {
  try {
    const id = req.params.id;
    let page = req.query.page || 1;
    let limit = req.query.limit || 10;

    page = parseInt(page);
    limit = parseInt(limit);

    const _productData = await productModel.aggregate([
      {
        $match: {
          categoryId: new ObjectId(id),
          active: true,
        },
      },
      {
        $addFields: {
          imageUrl: {
            $first: "$imageURLHighRes",
          },
        },
      },
      {
        $project: {
          _id: 1,
          title: 1,
          imageUrl: 1,
          price: 1,
          quantity: 1,
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

    const productData = _productData[0].data;
    const total = _productData[0].totalCount[0];

    res
      .status(200)
      .json({ data: productData, page, limit, total: total?.total || 0 });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getFeaturedCategory = async (req, res) => {
  try {
    const categories = await categoryModel.aggregate([
      {
        $project: {
          _id: 1,
          title: 1,
          featuredImage: 1,
        },
      },
      {
        $sample: { size: 5 },
      },
    ]);

    res.status(200).json({ data: categories });
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
        $project: {
          _id: 1,
          title: 1,
          featuredImage: 1,
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
          title: {
            $regex: searchQuery,
            $options: "i",
          },
        },
      });
    }

    const categoriesData = await categoryModel.aggregate([
      ...searchQueryAgg,
      { $limit: 10 },
      {
        $project: {
          _id: 0,
          value: "$_id",
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
          title: {
            $regex: searchQuery,
            $options: "i",
          },
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
        $project: {
          _id: 1,
          title: 1,
          featuredImage: 1,
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

    const checkDuplicate = await categoryModel.findOne({
      title,
      _id: { $ne: id },
    });

    if (checkDuplicate) {
      res
        .status(402)
        .json({ message: "Category with same title already exists" });
      return;
    }

    const file = req.file;

    let newImageUrl;
    if (file) {
      const { path } = file;
      const recevData = await cloudinaryUpload(path, "Category");
      newImageUrl = recevData.secure_url;
      fs.unlinkSync(path);
    }
    const toUpdateData = await categoryModel.findById(id);

    toUpdateData.title = title || toUpdateData.title;
    toUpdateData.featuredImage = newImageUrl || toUpdateData.featuredImage;

    const updatedData = await toUpdateData.save();
    res.status(200).json({
      id,
      data: {
        title: updatedData.title,
        featuredImage: updatedData.featuredImage,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteCategory = async (req, res) => {
  try {
    const id = req.params.id;

    const checkIfProductsExists = await productModel.findOne({
      categoryId: id,
      active: true,
    });

    if (checkIfProductsExists) {
      res
        .status(402)
        .json({ message: "Cannot delete. Product exists for given category" });
      return;
    }

    await categoryModel.findByIdAndDelete(id);
    res.status(200).json({ id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  addCategory,
  getCategory,
  getCategoryAdmin,
  getCategoryProductsAdmin,
  getAllCategory,
  updateCategory,
  deleteCategory,
  getFeaturedCategory,
  getFilteredCategory,
  getSearchedCategory,
};
