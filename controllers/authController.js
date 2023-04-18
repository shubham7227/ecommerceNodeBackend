const mongoose = require("mongoose");
const ObjectId = mongoose.Types.ObjectId;
const bcrypt = require("bcryptjs");
const userModel = require("../models/userModel");
const { generateToken } = require("../middlewares/generateToken");

const signup = async (req, res) => {
  try {
    const { name, email, password, mobileNumber, role } = req.body;

    const user = await userModel.findOne({ email });
    if (user) {
      res.status(400).json({ message: "Email is Already Used!" });
      return;
    }

    const number = await userModel.findOne({ mobileNumber });
    if (number) {
      res.status(400).json({ message: "Mobile number is already in use!" });
      return;
    }

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hashSync(password, salt, 10);

    const data = await userModel.create({
      name,
      email,
      password: hashedPassword,
      mobileNumber,
      role,
      isVerified: true,
    });

    res.status(201).json({
      message: " User Created successfully",
      data: data,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await userModel.findOne({ email, active: true });
    const validPassword = user
      ? await bcrypt.compare(password, user.password)
      : false;

    if (!user || !validPassword) {
      res.status(400).json({ message: "Invalid Credentials" });
      return;
    }

    const verifiedUser = user.isVerified;
    if (!verifiedUser) {
      res.status(400).json({ message: "Account not verified" });
      return;
    }

    const accessToken = generateToken({ userId: user._id, role: user.role });

    res.status(200).json({
      data: {
        name: user.name,
        email: user.email,
        role: user.role,
        id: user._id,
        mobileNumber: user.mobileNumber,
      },
      accessToken,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//SHOW-ALL-USERS
const show = async (req, res) => {
  try {
    let sortOrder = req.query.sortOrder || JSON.stringify({ createdAt: -1 });
    const _sortOrder = JSON.parse(sortOrder);

    let nameQuery = req.query.nameQuery;
    let page = req.query.page || 1;
    let limit = req.query.limit || 10;

    page = parseInt(page);
    limit = parseInt(limit);

    const searchQuery = [];

    if (nameQuery) {
      searchQuery.push({
        $match: {
          name: new RegExp(nameQuery, "i"),
        },
      });
    }

    const usersData = await userModel.aggregate([
      ...searchQuery,
      {
        $match: { role: "CUSTOMER" },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          email: 1,
          mobileNumber: 1,
          createdAt: 1,
          active: 1,
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

    const allUsersData = usersData[0].data;
    const totalUsers = usersData[0].totalCount[0];

    res.status(200).json({
      data: allUsersData,
      totalUsers: totalUsers?.total || 0,
      currentPage: page,
      limit: limit,
      nameQuery: nameQuery,
      sortOrder: sortOrder,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//Show User By Role
const showUserByRole = async (req, res) => {
  try {
    const role = req.params.role;
    const user = await userModel.find({ role: role }, { password: false });
    res.status(200).json({ role: role, data: user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//SHOW USER BY ID
const showById = async (req, res) => {
  try {
    const id = req.params.id;

    const userData = await userModel.aggregate([
      {
        $match: { _id: id },
      },
      {
        $lookup: {
          from: "addresses",
          localField: "_id",
          foreignField: "userId",
          as: "address",
          pipeline: [
            { $match: { active: true } },
            {
              $project: {
                userId: 0,
                updatedAt: 0,
                __v: 0,
                active: 0,
              },
            },
          ],
        },
      },
      {
        $lookup: {
          from: "orders",
          localField: "_id",
          foreignField: "userId",
          as: "orders",
          pipeline: [
            {
              $group: {
                _id: null,
                totalExpense: { $sum: "$totalAmount" },
                data: {
                  $push: {
                    _id: "$_id",
                    orderId: "$orderId",
                    status: "$status",
                    totalAmount: "$totalAmount",
                    orderDate: "$orderDate",
                  },
                },
              },
            },
          ],
        },
      },
      {
        $lookup: {
          from: "wishlists",
          localField: "_id",
          foreignField: "userId",
          as: "wishlist",
          pipeline: [
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
              },
            },
          ],
        },
      },
      {
        $lookup: {
          from: "carts",
          localField: "_id",
          foreignField: "userId",
          as: "cart",
          pipeline: [
            {
              $unwind: "$products",
            },
            {
              $lookup: {
                from: "products",
                localField: "products.id",
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
                _id: "$productDetails._id",
                imageUrl: 1,
                quantity: "$products.quantity",
                title: "$productDetails.title",
                price: "$productDetails.price",
              },
            },
          ],
        },
      },
      {
        $unwind: {
          path: "$orders",
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          email: 1,
          mobileNumber: 1,
          createdAt: 1,
          address: 1,
          reviews: 1,
          wishlist: 1,
          cart: 1,
          active: 1,
          "orders.data": 1,
          "orders.totalExpense": 1,
        },
      },
    ]);

    res.status(200).json({ data: userData[0] });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//GET USER DETAIL BY TOKEN
const getByToken = async (req, res) => {
  try {
    const { userId } = req.user;

    const user = await userModel.findById(userId).select("-password");
    if (user) {
      res.status(200).json({
        data: {
          name: user.name,
          email: user.email,
          role: user.role,
          id: user._id,
          mobileNumber: user.mobileNumber,
        },
      });
    } else {
      res.status(403).json({ message: "Token is invalid" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//UPDATE USER
const update = async (req, res) => {
  try {
    const id = req.user.userId;
    const { name, mobileNumber } = req.body;
    const user = await userModel.findById(id);

    const checkMobile = await userModel.find({
      _id: { $ne: id },
      mobileNumber: mobileNumber,
    });

    if (checkMobile.length > 0) {
      res.status(402).json({ message: "Mobile number already used" });
      return;
    }

    if (user) {
      user.name = name || user.name;
      user.mobileNumber = mobileNumber || user.mobileNumber;
    }
    const updatedUser = await user.save();
    res.status(200).json({
      message: "Updated successfully",
      data: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        mobileNumber: updatedUser.mobileNumber,
        role: updatedUser.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateByAdmin = async (req, res) => {
  try {
    const id = req.params.id;
    const { name, mobileNumber, email, deactivate, password } = req.body;
    const user = await userModel.findById(id);

    if (mobileNumber) {
      const checkMobile = await userModel.find({
        _id: { $ne: id },
        mobileNumber: mobileNumber,
      });
      if (checkMobile.length > 0) {
        res.status(402).json({ message: "Mobile number already used" });
        return;
      }
    }

    if (email) {
      const checkEmail = await userModel.find({
        _id: { $ne: id },
        email: email,
      });

      if (checkEmail.length > 0) {
        res.status(402).json({ message: "Email already used" });
        return;
      }
    }

    if (user) {
      user.name = name || user.name;
      user.mobileNumber = mobileNumber || user.mobileNumber;
      user.email = email || user.email;

      if (password) {
        const salt = await bcrypt.genSalt();
        const hashedPassword = await bcrypt.hashSync(password, salt, 10);

        user.password = hashedPassword;
      }

      if (deactivate) {
        user.active = false;
      } else {
        user.active = true;
      }
    }

    const updatedUser = await user.save();

    res.status(200).json({
      message: "Updated successfully",
      id,
      data: {
        name: updatedUser.name,
        email: updatedUser.email,
        mobileNumber: updatedUser.mobileNumber,
        active: updatedUser.active,
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// UPDATE PASSWORD
const updatePassword = async (req, res) => {
  try {
    const id = req.user.userId;
    const { oldPassword, newPassword } = req.body;
    const user = await userModel.findById(id);

    const validPassword = user
      ? await bcrypt.compare(oldPassword, user.password)
      : false;

    if (!validPassword) {
      res.status(400).json({ message: "Incorrect password" });
      return;
    }
    if (oldPassword === newPassword) {
      res.status(400).json({ message: "New password cannot be same as old" });
      return;
    }

    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hashSync(newPassword, salt, 10);

    if (user) {
      user.password = hashedPassword;
    }

    await user.save();
    res.status(200).json({
      message: "Updated successfully",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//DELETE USER
const deleteuser = async (req, res) => {
  const id = req.user.userId;
  try {
    const user = await userModel.findByIdAndUpdate(id, { active: false });
    res.status(200).json({ message: "User Deactivated", data: user._id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  signup,
  login,
  show,
  showById,
  showUserByRole,
  getByToken,
  update,
  updateByAdmin,
  updatePassword,
  deleteuser,
};
