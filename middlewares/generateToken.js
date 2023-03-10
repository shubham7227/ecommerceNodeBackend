const jwt = require("jsonwebtoken");
require("dotenv").config();

const generateToken = ({ userId, role }) => {
  return jwt.sign(
    { userId: userId, role: role },
    process.env.JWT_SECRET_KEY || "strong_secret_key",
    {
      expiresIn: process.env.JWT_EXPIRE || "1d",
    }
  );
};

module.exports = {
  generateToken,
};
