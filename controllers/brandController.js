const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const brandModel = require("../models/brandModel");
const productModel = require("../models/productModel");

const addBrand = async (req, res) => {
  try {
    const {} = req.body;
    const newBrand = await brandModel.create({});
    res.status(200).json({ data: newBrand });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getBrand = async (req, res) => {
  try {
    const id = req.params.id;

    const brandData = await brandModel.findById(id);

    const productIds = brandData.products;

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

    res.status(200).json({ data: productData, title: brandData.title });
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

    const brandsData = await brandModel.aggregate([
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

const updateBrand = async (req, res) => {
  try {
    const id = req.params.id;
    const { title } = req.body;
    const toUpdateData = await brandModel.findById(id);

    toUpdateData.title = title || toUpdateData.title;

    await toUpdateData.save();
    res.status(200).json({ data: toUpdateData });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteBrand = async (req, res) => {
  try {
    const id = req.params.id;
    const data = await productModel.findByIdAndUpdate(id, { active: false });
    res.status(200).json({ data: data });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  addBrand,
  getBrand,
  getAllBrand,
  getFilteredBrand,
  updateBrand,
  deleteBrand,
};
