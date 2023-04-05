const mongoose = require("mongoose");
const addressModel = require("../models/addressModel");
const ObjectId = mongoose.Types.ObjectId;

const addAddress = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { title, street, mobileNumber, city, state, country, zipCode } =
      req.body;

    const newAddress = await addressModel.create({
      userId,
      title,
      street,
      mobileNumber,
      city,
      state,
      country,
      zipCode,
    });
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
    const id = req.user.userId;
    const allAddressData = await addressModel.find({
      userId: id,
      active: true,
    });
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

    const { title, street, mobileNumber, city, state, country, zipCode } =
      req.body;

    const toUpdateData = await addressModel.findById(id);

    toUpdateData.title = title || toUpdateData.title;
    toUpdateData.street = street || toUpdateData.street;
    toUpdateData.mobileNumber = mobileNumber || toUpdateData.mobileNumber;
    toUpdateData.city = city || toUpdateData.city;
    toUpdateData.state = state || toUpdateData.state;
    toUpdateData.country = country || toUpdateData.country;
    toUpdateData.zipCode = zipCode || toUpdateData.zipCode;

    await toUpdateData.save();
    res.status(200).json({ data: toUpdateData, id: id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteAddress = async (req, res) => {
  try {
    const id = req.params.id;
    await addressModel.findByIdAndUpdate(id, { active: false });

    res.status(200).json({ message: "Successfully deleted", id });
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
