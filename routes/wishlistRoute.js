const express = require("express");
const router = express.Router();

const { isAuth, isAdmin } = require("../middlewares/verifyToken");

module.exports = router;
