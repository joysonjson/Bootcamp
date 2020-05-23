const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth");
const {
  register,
  login,
  profile,
  forgotPassword,
  resetPassword,
} = require("../controller/auth");

router.post("/register", register);
router.post("/login", login);

router.get("/profile", protect, profile);
router.post("/forgotpassword", forgotPassword);
router.put("/resetpassword/:resetToken", resetPassword);

module.exports = router;
