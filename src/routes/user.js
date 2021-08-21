const express = require("express");
const router = express.Router();

const {
  getUserProfile,
  changeUpdatePassword,
  updateUserProfile,
} = require("../controllers/userController");
const { isAuthenticatedUser } = require("../middlewares/auth");

//Current User Profile
router.route("/me").get(isAuthenticatedUser, getUserProfile);

//Change Update Password
router.route("/password/update").put(isAuthenticatedUser, changeUpdatePassword);

//Update User Profile
router.route("/me/updateProfile").put(isAuthenticatedUser, updateUserProfile);

module.exports = router;
