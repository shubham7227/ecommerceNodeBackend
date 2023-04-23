const router = require("express").Router();
const passport = require("passport");
require("dotenv").config();

router.get("/success", (req, res) => {
  if (req.user) {
    res.status(200).json({
      success: true,
      message: "Login successful",
      user: req.user,
    });
  } else {
    res.status(400).json({
      success: false,
      message: "Login failed",
    });
  }
});

router.get("/failed", (req, res) => {
  res.status(400).json({
    success: false,
    message: "Login failed",
  });
});

router.get("/logout", (req, res, next) => {
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    res.status(200).json({
      success: true,
      message: "Logout successful",
    });
  });
});

router.get(
  "/",
  passport.authenticate("google", { scope: ["email", "profile"] })
);

router.get(
  "/callback",
  passport.authenticate("google", {
    failureRedirect: "/google/failed",
    session: true,
  }),
  function (req, res) {
    res.redirect(`${process.env.CLIENT_URL}/google-login`);
  }
);

module.exports = router;
