const mongoose = require("mongoose");
const cartModel = require("../models/cartModel");
const productModel = require("../models/productModel");
const ObjectId = mongoose.Types.ObjectId;

const addItemCart = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { productData } = req.body;

    if (!productData || productData.length === 0) {
      res.status(404).json({ message: "productId required" });
      return;
    }

    const cart = await cartModel.findOne({ userId });

    if (!cart) {
      const newCart = await cartModel.create({
        userId,
        products: productData,
      });

      const { data, grandTotal } = await getStructuredData(newCart.products);

      res
        .status(200)
        .json({ data: data, cartId: newCart._id, grandTotal: grandTotal });
    } else {
      var oldData = cart.products;
      for (const item of productData) {
        oldData = oldData.filter((entry) => entry.id !== item.id);
      }
      cart.products = [...oldData, ...productData];

      await cart.save();
      const { data, grandTotal } = await getStructuredData(cart.products);

      res
        .status(200)
        .json({ data: data, cartId: cart._id, grandTotal: grandTotal });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const removeCartItem = async (req, res) => {
  try {
    const userId = req.user.userId;
    const productId = req.params.id;

    if (!productId) {
      res.status(404).json({ message: "Product Id is required" });
      return;
    }

    const cart = await cartModel.findOne({ userId });

    cart.products = cart.products.filter((item) => item.id !== productId);

    await cart.save();

    const { data, grandTotal } = await getStructuredData(cart.products);

    res.status(200).json({ data, grandTotal });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getCartItems = async (req, res) => {
  try {
    const userId = req.user.userId;

    const cart = await cartModel.findOne({ userId });

    if (!cart) {
      res.status(200).json({ data: [] });
      return;
    }

    const { data, grandTotal } = await getStructuredData(cart.products);

    res
      .status(200)
      .json({ data: data, cartId: cart._id, grandTotal: grandTotal });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getForProductIds = async (req, res) => {
  try {
    const { cartItems } = req.body;

    const { data, grandTotal } = await getStructuredData(cartItems);

    res.status(200).json({ data, grandTotal });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getStructuredData = async (products) => {
  const data = [];
  var grandTotal = 0;

  for (const product of products) {
    const productData = await productModel.findById(product.id, {
      title: 1,
      price: 1,
      imageURLHighRes: 1,
      quantity: 1,
    });

    const total = productData.price * product.quantity;
    grandTotal += total;

    const dataEntry = {
      id: product.id,
      title: productData.title,
      price: parseFloat(productData.price).toFixed(2),
      imageUrl: productData.imageURLHighRes[0],
      stock: productData.quantity,
      quantity: product.quantity,
      total: parseFloat(total).toFixed(2),
    };
    data.push(dataEntry);
  }

  data.sort((a, b) => {
    if (a.id < b.id) {
      return -1;
    }
    if (a.id > b.id) {
      return 1;
    }
    return 0;
  });

  grandTotal = parseFloat(grandTotal).toFixed(2);

  return { data, grandTotal };
};

module.exports = {
  addItemCart,
  removeCartItem,
  getCartItems,
  getForProductIds,
};
