const mongoose = require("mongoose");
const InvoiceDocument = require("pdfkit");
const orderModel = require("../models/orderModel");
const cartModel = require("../models/cartModel");
const productModel = require("../models/productModel");
const { createInvoice } = require("../utils/createInvoice");
const ObjectId = mongoose.Types.ObjectId;

const createOrder = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { paymentMethod, paymentId, addressId, cartId } = req.body;

    const cartData = await cartModel.aggregate([
      {
        $match: {
          _id: new ObjectId(cartId),
        },
      },
      {
        $unwind: "$products",
      },
      {
        $lookup: {
          from: "products",
          localField: "products.id",
          foreignField: "_id",
          as: "productData",
        },
      },
      {
        $unwind: "$productData",
      },
      {
        $project: {
          _id: 0,
          id: "$productData._id",
          price: "$productData.price",
          quantity: "$products.quantity",
          subTotal: { $multiply: ["$productData.price", "$products.quantity"] },
        },
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$subTotal" },
          products: {
            $push: {
              id: "$id",
              price: "$price",
              quantity: "$quantity",
              subTotal: "$subTotal",
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          totalAmount: 1,
          products: 1,
        },
      },
    ]);

    const totalAmount = cartData[0].totalAmount;
    const productData = cartData[0].products;

    const newOrder = await orderModel.create({
      userId: userId,
      addressId: addressId,
      paymentMethod: paymentMethod,
      paymentId: paymentId,
      products: productData,
      totalAmount: totalAmount,
    });

    await cartModel.findByIdAndDelete(cartId);

    for (const product of productData) {
      const productId = product.id;

      await productModel.findByIdAndUpdate(productId, {
        $inc: { quantity: -product.quantity },
      });
    }

    res.status(200).json({ orderId: newOrder.orderId });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getOrder = async (req, res) => {
  try {
    const id = req.params.id;

    const OrderData = await orderModel.aggregate([
      {
        $match: {
          _id: new ObjectId(id),
        },
      },
      {
        $unwind: "$products",
      },
      {
        $lookup: {
          from: "products",
          localField: "products.id",
          foreignField: "_id",
          as: "productData",
        },
      },
      {
        $lookup: {
          from: "addresses",
          localField: "addressId",
          foreignField: "_id",
          as: "address",
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "userData",
        },
      },
      {
        $unwind: "$productData",
      },
      {
        $project: {
          _id: 1,
          orderId: 1,
          orderDate: 1,
          totalAmount: 1,
          status: 1,
          paymentMethod: 1,
          paymentId: 1,
          deliveredDate: 1,
          cancelledDate: 1,
          products: {
            id: 1,
            imageUrl: { $first: "$productData.imageURLHighRes" },
            title: "$productData.title",
            price: 1,
            quantity: 1,
            subTotal: 1,
          },
          totalItems: { $sum: 1 },
          address: { $arrayElemAt: ["$address", 0] },
          user: { $arrayElemAt: ["$userData", 0] },
        },
      },
      {
        $group: {
          _id: "$_id",
          orderId: { $first: "$orderId" },
          orderDate: { $first: "$orderDate" },
          totalAmount: { $first: "$totalAmount" },
          status: { $first: "$status" },
          paymentMethod: { $first: "$paymentMethod" },
          paymentId: { $first: "$paymentId" },
          deliveredDate: { $first: "$deliveredDate" },
          products: { $push: "$products" },
          totalItems: { $sum: "$totalItems" },
          address: { $first: "$address" },
          user: { $first: "$user" },
        },
      },
      {
        $project: {
          _id: 1,
          orderId: 1,
          orderDate: 1,
          totalAmount: 1,
          status: 1,
          products: 1,
          totalItems: 1,
          paymentMethod: 1,
          paymentId: 1,
          deliveredDate: 1,
          cancelledDate: 1,
          "user._id": 1,
          "user.name": 1,
          "user.email": 1,
          "user.mobileNumber": 1,
          "address.title": 1,
          "address.street": 1,
          "address.city": 1,
          "address.state": 1,
          "address.country": 1,
          "address.zipCode": 1,
          "address.mobileNumber": 1,
        },
      },
    ]);

    res.status(200).json({ data: OrderData[0] });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllUserOrder = async (req, res) => {
  try {
    const id = req.user.userId;

    const OrderData = await orderModel.aggregate([
      {
        $match: {
          userId: id,
        },
      },
      {
        $unwind: "$products",
      },
      {
        $lookup: {
          from: "products",
          localField: "products.id",
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
          orderId: 1,
          orderDate: 1,
          totalAmount: 1,
          status: 1,
          products: {
            id: 1,
            imageUrl: { $first: "$productData.imageURLHighRes" },
            title: "$productData.title",
            price: 1,
            quantity: 1,
          },
          totalItems: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: "$_id",
          orderId: { $first: "$orderId" },
          orderDate: { $first: "$orderDate" },
          totalAmount: { $first: "$totalAmount" },
          status: { $first: "$status" },
          products: { $push: "$products" },
          totalItems: { $sum: "$totalItems" },
        },
      },
      {
        $project: {
          _id: 1,
          orderId: 1,
          orderDate: 1,
          totalAmount: 1,
          status: 1,
          products: { $slice: ["$products", 2] },
          totalItems: 1,
        },
      },
      {
        $sort: { orderDate: -1 },
      },
    ]);

    res.status(200).json({ data: OrderData });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//get all orders
const getAllOrder = async (req, res) => {
  try {
    
    let sortOrder = req.query.sortOrder || JSON.stringify({ orderDate: -1 });
    const _sortOrder = JSON.parse(sortOrder);

    let orderIdQuery = req.query.orderIdQuery;
    let page = req.query.page || 1;
    let limit = req.query.limit || 10;

    page = parseInt(page);
    limit = parseInt(limit);

    const searchQuery = [];

    if (orderIdQuery) {
      searchQuery.push({
        $match: {
          orderId: new RegExp(orderIdQuery, "i"),
        },
      });
    }

    const orderData = await orderModel.aggregate([
      ...searchQuery,
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "userData",
        },
      },
      {
        $unwind: "$userData",
      },
      {
        $project: {
          _id: 1,
          orderId: 1,
          userName: "$userData.name",
          orderDate: 1,
          totalAmount: 1,
          status: 1,
        },
      },
      {
        $sort: { ..._sortOrder },
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

    const allOrdersData = orderData[0].data;
    const totalOrders = orderData[0].totalCount[0];

    res.status(200).json({
      data: allOrdersData,
      totalOrders: totalOrders?.total || 0,
      currentPage: page,
      limit: limit,
      orderIdQuery: orderIdQuery,
      sortOrder: sortOrder,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const generateInvoice = async (req, res) => {
  try {
    const id = req.params.id;

    const orderData = await orderModel.aggregate([
      {
        $match: {
          _id: new ObjectId(id),
        },
      },
      {
        $unwind: "$products",
      },
      {
        $lookup: {
          from: "products",
          localField: "products.id",
          foreignField: "_id",
          as: "productData",
        },
      },
      {
        $lookup: {
          from: "addresses",
          localField: "addressId",
          foreignField: "_id",
          as: "address",
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "userData",
        },
      },
      {
        $unwind: "$productData",
      },
      {
        $project: {
          _id: 1,
          orderId: 1,
          orderDate: 1,
          totalAmount: 1,
          products: {
            title: "$productData.title",
            price: 1,
            quantity: 1,
            subTotal: 1,
          },
          address: { $arrayElemAt: ["$address", 0] },
          user: { $arrayElemAt: ["$userData", 0] },
        },
      },
      {
        $group: {
          _id: "$_id",
          orderId: { $first: "$orderId" },
          orderDate: { $first: "$orderDate" },
          totalAmount: { $first: "$totalAmount" },
          products: { $push: "$products" },
          address: { $first: "$address" },
          user: { $first: "$user" },
        },
      },
      {
        $project: {
          orderId: 1,
          orderDate: 1,
          totalAmount: 1,
          products: 1,
          "user.name": 1,
          "address.street": 1,
          "address.city": 1,
          "address.state": 1,
          "address.country": 1,
          "address.zipCode": 1,
        },
      },
    ]);

    const invoiceData = orderData[0];
    let invoiceDoc = new InvoiceDocument({ size: "A4", margin: 50 });

    const stream = res.writeHead(200, {
      "Content-Type": "application/pdf",
      "Content-disposition": `attachment;filename=invoice.pdf`,
    });

    invoiceDoc.on("data", (chunk) => stream.write(chunk));
    invoiceDoc.on("end", () => stream.end());

    createInvoice(invoiceDoc, invoiceData);

    invoiceDoc.end();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateOrder = async (req, res) => {
  try {
    const id = req.params.id;
    const { status } = req.body;
    console.log(status);

    if (!status) {
      res.status(404).json({ message: "Status is required" });
      return;
    }

    const orderData = await orderModel.findById(id);

    if (status === "Delivered" && orderData.status !== "Processing") {
      res.status(404).json({
        message: "Order status must be processing before delivering the order",
      });
      return;
    }

    if (status === "Delivered") {
      orderData.deliveredDate = new Date().toISOString();
    }
    if (status === "Cancelled") {
      orderData.cancelledDate = new Date().toISOString();
    }

    orderData.status = status;

    await orderData.save();

    res.status(200).json({
      status,
      id,
      cancelledDate: orderData.cancelledDate,
      deliveredDate: orderData.deliveredDate,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const cancelOrder = async (req, res) => {
  try {
    const id = req.params.id;

    const orderData = await orderModel.findById(id);

    orderData.cancelledDate = new Date().toISOString();
    orderData.status = "Cancelled";

    await orderData.save();

    for (const product of orderData.products) {
      const productId = product.id;

      await productModel.findByIdAndUpdate(productId, {
        $inc: { quantity: product.quantity },
      });
    }

    res.status(200).json({
      status: "Cancelled",
      id,
      cancelledDate: orderData.cancelledDate,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteOrder = async (req, res) => {
  try {
    const id = req.params.id;
    const data = await orderModel.findByIdAndDelete(id);
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
  generateInvoice,
  updateOrder,
  cancelOrder,
  deleteOrder,
};
