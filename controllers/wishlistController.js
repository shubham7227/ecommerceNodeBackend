const mongoose = require("mongoose");
const productModel = require("../models/productModel");
const wishlistModel = require("../models/wishlistModel");
const ObjectId = mongoose.Types.ObjectId;

const addWishlist = async (req, res) => {
  try {
    const { userId, productId } = req.body;
    const newWishlist = await wishlistModel.create({ userId, productId });

    const productData = await productModel.findById(productId, {
      title: 1,
      price: 1,
      imageURLHighRes: 1,
    });

    const data = {
      _id: newWishlist._id,
      title: productData.title,
      imageUrl: productData.imageURLHighRes[0],
      price: parseFloat(productData.price).toFixed(2),
      productId: productId,
      addedOn: newWishlist.addedOn,
      quantity: productData.quantity,
    };

    res.status(200).json({ data: data });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllWishlistUser = async (req, res) => {
  try {
    const { userId } = req.user;
    const WishlistData = await wishlistModel.aggregate([
      {
        $match: {
          userId: userId,
        },
      },
      {
        $lookup: {
          from: "products",
          localField: "productId",
          foreignField: "_id",
          as: "productDetails",
        },
      },
      {
        $unwind: "$productDetails",
      },
      {
        $addFields: {
          imageUrl: {
            $first: "$productDetails.imageURLHighRes",
          },
        },
      },
      {
        $project: {
          _id: 1,
          addedOn: 1,
          imageUrl: 1,
          productId: "$productDetails._id",
          title: "$productDetails.title",
          price: { $round: ["$productDetails.price", 2] },
          quantity: "$productDetails.quantity",
        },
      },
    ]);
    res.status(200).json({ data: WishlistData });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteWishlist = async (req, res) => {
  try {
    const id = req.params.id;
    await wishlistModel.findByIdAndDelete(id);
    res.status(200).json({ id: id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  addWishlist,
  getAllWishlistUser,
  deleteWishlist,
};
