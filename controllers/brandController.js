const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const brandModel = require("../models/brandModel");
const productModel = require("../models/productModel");
const { cloudinaryUpload } = require("../utils/cloudinary");
const fs = require("fs");

const addBrand = async (req, res) => {
  try {
    const { title, products } = req.body;

    const file = req.file;

    if (!title || !file) {
      res
        .status(402)
        .json({ message: "Incomplete data. Title or image missing" });
      return;
    }

    const checkDuplicate = await brandModel.findOne({ title });

    if (checkDuplicate) {
      res.status(402).json({ message: "Brand already exists" });
      return;
    }

    let newImageUrl;
    if (file) {
      const { path } = file;
      const recevData = await cloudinaryUpload(path, "Brand");
      newImageUrl = recevData.secure_url;
      fs.unlinkSync(path);
    }

    const newBrand = await brandModel.create({
      title,
      featuredImage: newImageUrl,
    });

    const newId = newBrand._id;

    await productModel.updateMany(
      { _id: { $in: products } },
      {
        brandId: newId,
      }
    );

    res.status(200).json({ data: newBrand });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getBrand = async (req, res) => {
  try {
    const id = req.params.id;

    const brandData = await brandModel.findById(id);

    const productData = await productModel.aggregate([
      {
        $match: {
          brandId: new ObjectId(id),
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

    res.status(200).json({ data: productData, title: brandData.title });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getBrandAdmin = async (req, res) => {
  try {
    const id = req.params.id;

    const brandData = await brandModel.findById(id, {
      _id: 1,
      title: 1,
      featuredImage: 1,
    });

    res.status(200).json({ data: brandData });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getBrandProductsAdmin = async (req, res) => {
  try {
    const id = req.params.id;
    let page = req.query.page || 1;
    let limit = req.query.limit || 10;

    page = parseInt(page);
    limit = parseInt(limit);

    const _productData = await productModel.aggregate([
      {
        $match: {
          brandId: new ObjectId(id),
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

const getAllBrand = async (req, res) => {
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

    const brandsData = await brandModel.aggregate([
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

    const allBrandsData = brandsData[0].data;
    const totalBrands = brandsData[0].totalCount[0];

    res.status(200).json({
      data: allBrandsData,
      totalBrands: totalBrands?.total || 0,
      currentPage: page,
      limit: limit,
      searchQuery: searchQuery,
      sortOrder: sortOrder,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getFilteredBrand = async (req, res) => {
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
          index: "brandsearch",
          text: {
            path: "title",
            query: query,
            fuzzy: {},
          },
        },
      });
    }

    const brands = await brandModel.aggregate([
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

    const toSendData = brands[0].data;
    const totalBrands = brands[0].totalCount[0];

    res.status(200).json({
      data: toSendData,
      searchQuery: query,
      limit,
      currentPage: page,
      totalBrands: totalBrands?.total || 0,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getSearchedBrand = async (req, res) => {
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

    const brandData = await brandModel.aggregate([
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

    res.status(200).json({ data: brandData });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateBrand = async (req, res) => {
  try {
    const id = req.params.id;
    const { title } = req.body;
    const checkDuplicate = await brandModel.findOne({
      title,
      _id: { $ne: id },
    });
    if (checkDuplicate) {
      res.status(402).json({ message: "Brand with same title already exists" });
      return;
    }
    const file = req.file;

    let newImageUrl;
    if (file) {
      const { path } = file;
      const recevData = await cloudinaryUpload(path, "Brand");
      newImageUrl = recevData.secure_url;
      fs.unlinkSync(path);
    }

    const toUpdateData = await brandModel.findById(id);

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

const deleteBrand = async (req, res) => {
  try {
    const id = req.params.id;
    const checkIfProductsExists = await productModel.findOne({
      brandId: id,
      active: true,
    });

    if (checkIfProductsExists) {
      res
        .status(402)
        .json({ message: "Cannot delete. Product exists for given brand" });
      return;
    }

    await brandModel.findByIdAndDelete(id);
    res.status(200).json({ id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  addBrand,
  getBrand,
  getBrandAdmin,
  getBrandProductsAdmin,
  getAllBrand,
  getFilteredBrand,
  getSearchedBrand,
  updateBrand,
  deleteBrand,
};
