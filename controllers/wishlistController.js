const mongoose = require("mongoose");
const wishlistModel = require("../models/wishlistModel");
const ObjectId = mongoose.Types.ObjectId;

const addWishlist = async (req, res) => {
  try {
    const {} = req.body;
    const newWishlist = await wishlistModel.create({});
    res.status(200).json({ data: newWishlist });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getWishlist = async (req, res) => {
  try {
    const id = req.params.id;
    const WishlistData = await wishlistModel.findById(id);
    res.status(200).json({ data: WishlistData });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const getAllWishlistUser = async (req, res) => {
  try {
    const id = req.params.id;
    const WishlistData = await wishlistModel.find({ userId: id });
    res.status(200).json({ data: WishlistData });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllWishlist = async (req, res) => {
  try {
    const allWishlist = await wishlistModel.find();
    res.status(200).json({ data: allWishlist });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateWishlist = async (req, res) => {
  try {
    const id = req.params.id;
    const { title } = req.body;
    const toUpdateData = await wishlistModel.findById(id);

    toUpdateData.title = title || toUpdateData.title;

    await toUpdateData.save();
    res.status(200).json({ data: toUpdateData });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteWishlist = async (req, res) => {
  try {
    const id = req.params.id;
    const data = await productModel.findByIdAndDelete(id);
    res.status(200).json({ data: data });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  addWishlist,
  getWishlist,
  getAllWishlistUser,
  getAllWishlist,
  updateWishlist,
  deleteWishlist,
};
