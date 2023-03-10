require("dotenv").config();
const jwt = require("jsonwebtoken");

//TO AUTHORIZE THE CLIENT
const isAuth = (req, res, next) => {
  const authorization = req.headers.authorization;

  if (authorization) {
    const token = authorization.slice(7, authorization.length); // Bearer XXXXXX
    jwt.verify(
      token,
      process.env.JWT_SECRET_KEY || "strong_secret_key",
      (err, decode) => {
        if (err) {
          res.status(403).send({ message: "Invalid Token" });
        } else {
          req.user = decode;
          next();
        }
      }
    );
  } else {
    res.status(401).send({ message: "No Token" });
  }
};

// TO VERIFY USER
const verifyToken = (req, res, next) => {
  const token = req.params.token;

  if (token) {
    jwt.verify(
      token,
      process.env.JWT_SECRET_KEY || "strong_secret_key",
      (err, decode) => {
        if (err) {
          res.status(403).send({ message: "Invalid Token" });
        } else {
          req.user = decode;
          next();
        }
      }
    );
  } else {
    res.status(401).send({ message: "No Token" });
  }
};

//TO AUTHORIZE THE ADMIN
const isAdmin = async (req, res, next) => {
  try {
    if (req.user.role == "ADMIN") {
      next();
    } else {
      res.status(403).json({ message: "You are not a ADMIN" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  isAuth,
  isAdmin,
  verifyToken,
};
