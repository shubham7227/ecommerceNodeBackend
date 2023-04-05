const express = require("express");
const router = express.Router();

const { isAuth, isAdmin } = require("../middlewares/verifyToken");
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
} = require("../controllers/authController");

router.post("/signup", signup);

router.post("/login", login);

router.get("/getByToken", isAuth, getByToken);

router.get("/:id", isAuth, showById);

router.get("/getByRole/:role", isAuth, isAdmin, showUserByRole);

router.get("/", isAuth, isAdmin, show);

router.put("/", isAuth, update);

router.put("/change-password", isAuth, updatePassword);

router.delete("/", isAuth, deleteuser);

module.exports = router;
