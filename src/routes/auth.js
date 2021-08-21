const express = require("express");
const router = express.Router();

const {
  registerUser,
  loginUser,
  logoutUser,
  forgotPassword,
  resetPasword,
} = require("../controllers/authController");

//Register User
router.route("/register").post(registerUser);

//Login user
router.route("/login").post(loginUser);

//Forgot Password
router.route("/password/forgot").post(forgotPassword);

//Reset Password
router.route("/password/reset/:token").put(resetPasword);

//Logout
router.route("/logout").get(logoutUser);

module.exports = router;
