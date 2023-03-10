const mongoose = require("mongoose");
const orderModel = require("../models/orderModel");
const ObjectId = mongoose.Types.ObjectId;

const createOrder = async (req, res) => {
  try {
    const {} = req.body;
    const newOrder = await orderModel.create({});
    res.status(200).json({ data: newOrder });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getOrder = async (req, res) => {
  try {
    const id = req.params.id;
    const OrderData = await orderModel.findById(id);
    res.status(200).json({ data: OrderData });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllUserOrder = async (req, res) => {
  try {
    const id = req.params.id;
    const OrderData = await orderModel.find({ userId: id });
    res.status(200).json({ data: OrderData });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllOrder = async (req, res) => {
  try {
    const allOrders = await orderModel.find();
    res.status(200).json({ data: allOrders });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateOrder = async (req, res) => {
  try {
    const id = req.params.id;
    const { title } = req.body;
    const toUpdateData = await orderModel.findById(id);

    toUpdateData.title = title || toUpdateData.title;

    await toUpdateData.save();
    res.status(200).json({ data: toUpdateData });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteOrder = async (req, res) => {
  try {
    const id = req.params.id;
    const data = await productModel.findByIdAndUpdate(id, { active: false });
    res.status(200).json({ data: data });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createOrder,
  getOrder,
  getAllUserOrder,
  getAllOrder,
  updateOrder,
  deleteOrder,
};
