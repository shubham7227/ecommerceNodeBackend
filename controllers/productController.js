const mongoose = require("mongoose");
const productModel = require("../models/productModel");
const reviewModel = require("../models/reviewModel");
const { cloudinaryUpload } = require("../utils/cloudinary");
const fs = require("fs");
const categoryModel = require("../models/categoryModel");
const brandModel = require("../models/brandModel");
const ObjectId = mongoose.Types.ObjectId;

const addProduct = async (req, res) => {
  try {
    const {
      title,
      brand,
      category,
      price,
      MRP,
      quantity,
      feature,
      description,
    } = req.body;

    const checkDuplicate = await productModel.find({
      title: title,
      brandId: brand,
      active: true,
    });

    const files = req.files;

    if (files.length === 0) {
      res.status(402).json({ message: "Image is required" });
      return;
    }
    if (checkDuplicate.length > 0) {
      res.status(402).json({ message: "Product already exists" });
      return;
    }

    const newImageURLs = [];

    for (const file of files) {
      const { path } = file;
      const recevData = await cloudinaryUpload(path, "Products");
      newImageURLs.push(recevData.secure_url);
      fs.unlinkSync(path);
    }

    const newProduct = await productModel.create({
      title,
      brandId: brand,
      categoryId: category,
      price,
      MRP,
      quantity,
      feature,
      description,
      imageURL: newImageURLs,
      imageURLHighRes: newImageURLs,
    });
    res.status(200).json({ data: newProduct });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const searchProduct = async (req, res) => {
  try {
    let { query, order } = req.query;
    let price = req.query.price;
    let categories = req.query.categories;
    let brands = req.query.brands;
    let page = req.query.page || 1;
    let limit = req.query.limit || 12;

    page = parseInt(page);
    limit = parseInt(limit);

    // To create a dynamic query based on request query fields
    const aggregateQuery = [];

    // If search query is provided
    if (query) {
      aggregateQuery.push({
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
      });
    }

    // Dynamic match filter based on request query
    const matchQuery = { active: true };

    if (categories) {
      const objectIdconvertedCategories = new ObjectId(categories);
      matchQuery["categoryId"] = objectIdconvertedCategories;
      const categoriesData = await categoryModel.aggregate([
        {
          $match: {
            _id: objectIdconvertedCategories,
          },
        },
        {
          $project: {
            _id: 0,
            value: "$_id",
            label: "$title",
          },
        },
      ]);

      categories = categoriesData[0];
    } else {
      categories = null;
    }

    if (brands) {
      const _brands = brands.split(",");
      const objectIdconvertedBrands = _brands.map(
        (entry) => new ObjectId(entry)
      );
      matchQuery["brandId"] = { $in: objectIdconvertedBrands };

      brands = await brandModel.aggregate([
        {
          $match: {
            _id: { $in: objectIdconvertedBrands },
          },
        },
        {
          $project: {
            _id: 0,
            value: "$_id",
            label: "$title",
          },
        },
      ]);
    } else {
      brands = [];
    }

    // Calculate the minimum and maximum price after brand/category and search query filter are applied
    const minmaxPrice = await productModel.aggregate([
      ...aggregateQuery,
      {
        $group: {
          _id: null,
          maxPrice: { $max: "$price" },
          minPrice: { $min: "$price" },
        },
      },
    ]);

    const minPrice = Math.floor(minmaxPrice[0]?.minPrice || 0);
    const maxPrice = Math.ceil(minmaxPrice[0]?.maxPrice || 0);

    if (price) {
      price = price.split(",");
      const minPrice = parseInt(price[0]);
      const maxPrice = parseInt(price[1]);
      price = [minPrice, maxPrice];
      matchQuery["price"] = { $gte: minPrice, $lte: maxPrice };
    }

    aggregateQuery.push({ $match: matchQuery });

    // Get the total documents that matches all the above filters
    const countResults = await productModel.aggregate([
      ...aggregateQuery,
      {
        $count: "count",
      },
    ]);

    // If sortOrder is not provided then apply the limit early to get a faster result
    if (!order) {
      aggregateQuery.push({ $skip: (page - 1) * limit }, { $limit: limit });
    }

    // Projection and lookup
    aggregateQuery.push(
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
          price: { $round: ["$price", 2] },
          MRP: { $round: ["$MRP", 2] },
          imageUrl: 1,
          category: 1,
          rating: { $round: ["$rating", 1] },
          totalReviews: { $size: "$reviews" },
        },
      }
    );

    // SOrt order is provided then sort accordingly then limit
    if (order) {
      const sortOrder = JSON.parse(order);
      aggregateQuery.push(
        {
          $sort: { ...sortOrder, totalReviews: -1 },
        },
        { $skip: (page - 1) * limit },
        { $limit: limit }
      );
    }

    const products = await productModel.aggregate([...aggregateQuery]);

    res.status(200).json({
      data: products,
      page,
      limit,
      categories,
      brands,
      price: price ? price : [minPrice, maxPrice],
      totalResults: countResults[0]?.count || 0,
      priceRange: [minPrice, maxPrice],
      sortOrder: order,
      query,
    });
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
          from: "brands",
          localField: "brandId",
          foreignField: "_id",
          as: "brandData",
          pipeline: [
            {
              $project: {
                _id: 0,
                label: "$title",
                value: "$_id",
              },
            },
          ],
        },
      },
      {
        $lookup: {
          from: "categories",
          localField: "categoryId",
          foreignField: "_id",
          as: "categoryData",
          pipeline: [
            {
              $project: {
                _id: 0,
                value: "$_id",
                label: "$title",
              },
            },
          ],
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
          brand: {
            $first: "$brandData",
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
          description: 1,
          feature: 1,
          imageURL: 1,
          imageURLHighRes: 1,
          category: "$categoryData",
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
          firstCategory: {
            $first: "$productData.categoryId",
          },
        },
      },
      {
        $lookup: {
          from: "brands",
          localField: "productData.brandId",
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
        $addFields: {
          imageUrl: {
            $first: "$productData.imageURLHighRes",
          },
          brand: {
            $first: "$brandData.title",
          },
          category: {
            $first: "$categoryData.title",
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

const getSearchedProducts = async (req, res) => {
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

    const productsData = await productModel.aggregate([
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
          value: "$_id",
          label: "$title",
        },
      },
    ]);

    res.status(200).json({ data: productsData });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllProducts = async (req, res) => {
  try {
    let sortOrder = req.query.sortOrder;

    let nameQuery = req.query.nameQuery;
    let page = req.query.page || 1;
    let limit = req.query.limit || 10;

    page = parseInt(page);
    limit = parseInt(limit);
    const searchQuery = [];

    if (nameQuery) {
      searchQuery.push({
        $match: {
          title: new RegExp(nameQuery, "i"),
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

    const productsData = await productModel.aggregate([
      ...searchQuery,
      {
        $match: { active: true },
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
        },
      },
      {
        $project: {
          _id: 1,
          title: 1,
          imageUrl: 1,
          category: 1,
          brand: 1,
          quantity: 1,
          price: 1,
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

    const allProductsData = productsData[0].data;
    const totalProducts = productsData[0].totalCount[0];

    res.status(200).json({
      data: allProductsData,
      totalProducts: totalProducts?.total || 0,
      currentPage: page,
      limit: limit,
      nameQuery: nameQuery,
      sortOrder: sortOrder,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateProduct = async (req, res) => {
  try {
    const id = req.params.id;
    const {
      title,
      brand,
      category,
      price,
      MRP,
      quantity,
      feature,
      description,
      imageURLHighRes,
    } = req.body;
    const files = req.files;

    if (
      files.length === 0 &&
      (!imageURLHighRes || imageURLHighRes.length === 0)
    ) {
      res.status(402).json({ message: "Image is required" });
      return;
    }

    const newImageURLs = [];

    for (const file of files) {
      const { path } = file;
      const recevData = await cloudinaryUpload(path, "Products");
      newImageURLs.push(recevData.secure_url);
      fs.unlinkSync(path);
    }
    if (imageURLHighRes && Array.isArray(imageURLHighRes)) {
      newImageURLs.push(...imageURLHighRes);
    } else if (imageURLHighRes) {
      newImageURLs.push(imageURLHighRes);
    }

    const toUpdateData = await productModel.findById(id);

    toUpdateData.title = title || toUpdateData.title;
    toUpdateData.brandId = brand || toUpdateData.brandId;
    toUpdateData.categoryId = category || toUpdateData.categoryId;
    toUpdateData.price = price || toUpdateData.price;
    toUpdateData.MRP = MRP || toUpdateData.MRP;
    toUpdateData.quantity = quantity || toUpdateData.quantity;
    toUpdateData.feature = feature || toUpdateData.feature;
    toUpdateData.description = description || toUpdateData.description;
    toUpdateData.imageURL = newImageURLs || toUpdateData.imageURL;
    toUpdateData.imageURLHighRes = newImageURLs || toUpdateData.imageURLHighRes;

    const updatedData = await toUpdateData.save();

    const categoryData = await categoryModel.find(
      { _id: { $in: category } },
      { _id: 1, title: 1 }
    );
    const brandData = await brandModel.findById(brand, { _id: 1, title: 1 });

    const _category = categoryData.map((entry) => ({
      value: entry._id,
      label: entry.title,
    }));
    const _brand = { value: brandData._id, label: brandData.title };

    const newData = {
      title: updatedData.title,
      brand: _brand,
      category: _category,
      price: updatedData.price,
      MRP: updatedData.MRP,
      quantity: updatedData.quantity,
      feature: updatedData.feature,
      description: updatedData.description,
      imageURLHighRes: updatedData.imageURLHighRes,
    };
    res.status(200).json({ data: newData });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteProduct = async (req, res) => {
  try {
    const id = req.params.id;
    await productModel.findByIdAndUpdate(id, { active: false });
    res.status(200).json({ id: id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  addProduct,
  searchProduct,
  getProduct,
  getSearchedProducts,
  getAllProducts,
  updateProduct,
  deleteProduct,
  getFeaturedProducts,
  bestSelling,
};
