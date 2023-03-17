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
    const CategoryData = await categoryModel.findById(id);
    res.status(200).json({ data: CategoryData });
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

const getAllCategory = async (req, res) => {
  try {
    const allCategory = await categoryModel
      .find({ active: true }, { title: 1 })
      .limit(10);
    res.status(200).json({ data: allCategory });
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
};
