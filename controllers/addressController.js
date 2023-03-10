const mongoose = require("mongoose");
const addressModel = require("../models/addressModel");
const ObjectId = mongoose.Types.ObjectId;

const addAddress = async (req, res) => {
  try {
    const {} = req.body;
    const newAddress = await addressModel.create({});
    res.status(200).json({ data: newAddress });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAddress = async (req, res) => {
  try {
    const id = req.params.id;
    const AddressData = await addressModel.findById(id);
    res.status(200).json({ data: AddressData });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllAddressUser = async (req, res) => {
  try {
    const id = req.params.id;
    const allAddressData = await addressModel.find({ userId: id });
    res.status(200).json({ data: allAddressData });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllAddress = async (req, res) => {
  try {
    const allAddress = await addressModel.find();
    res.status(200).json({ data: allAddress });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateAddress = async (req, res) => {
  try {
    const id = req.params.id;
    const { title } = req.body;
    const toUpdateData = await addressModel.findById(id);

    toUpdateData.title = title || toUpdateData.title;

    await toUpdateData.save();
    res.status(200).json({ data: toUpdateData });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteAddress = async (req, res) => {
  try {
    const id = req.params.id;
    const data = await productModel.findByIdAndDelete(id);
    res.status(200).json({ data: data });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  addAddress,
  getAddress,
  getAllAddress,
  updateAddress,
  deleteAddress,
  getAllAddressUser,
};
