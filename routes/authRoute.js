const express = require("express");
const router = express.Router();

const { isAuth, isAdmin, verifyToken } = require("../middlewares/verifyToken");
const {
  signup,
  login,
  show,
  showById,
  showUserByRole,
  getByToken,
  update,
  deleteuser,
  updatePassword,
  updateByAdmin,
  verifyEmail,
  setPassword,
  forgotPassword,
} = require("../controllers/authController");

router.post("/signup", signup);

router.post("/login", login);

router.post("/password/forgot", forgotPassword);

router.get("/getByToken", isAuth, getByToken);

router.get("/single/:id", isAuth, showById);

router.get("/getByRole/:role", isAuth, isAdmin, showUserByRole);

router.get("/", isAuth, isAdmin, show);

router.put("/", isAuth, update);

router.put("/change-password", isAuth, updatePassword);

router.put("/:id", isAuth, isAdmin, updateByAdmin);

router.put("/verify/:token", verifyToken, verifyEmail);

router.put("/password/reset/:token", verifyToken, setPassword);

router.delete("/", isAuth, deleteuser);

module.exports = router;
