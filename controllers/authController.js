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
    const user = await userModel.find().select("-password");
    res.status(200).json({ data: user });
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
    const user = await userModel.findById(id).select("-password");
    res.status(200).json({ data: user });
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
    const { id } = req.user;
    const { name, email, mobileNumber, role } = req.body;
    const user = await userModel.findById(id);
    if (user) {
      user.name = name || user.name;
      user.email = email || user.email;
      user.mobileNumber = mobileNumber || user.mobileNumber;
      user.role = role || user.role;
    }
    const updatedUser = await user.save();
    res.status(200).json({
      message: "Updated successfully",
      data: {
        _id: updatedUser._id,
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

//DELETE USER
const deleteuser = async (req, res) => {
  const { id } = req.user;
  try {
    const user = await userModel.findByIdAndUpdate(id, { active: false });
    res.status(200).json({ message: "User deleted", data: user._id });
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
  deleteuser,
};
