const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const brandModel = require("../models/brandModel");

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
    res.status(200).json({ data: brandData });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllBrand = async (req, res) => {
  try {
    const allBrands = await brandModel.find();
    res.status(200).json({ data: allBrand });
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
    const data = await brandModel.findByIdAndDelete(id);
    res.status(200).json({ data: data });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  addBrand,
  getBrand,
  getAllBrand,
  updateBrand,
  deleteBrand,
};
