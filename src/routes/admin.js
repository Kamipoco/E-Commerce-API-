const express = require("express");
const router = express.Router();

///ROLE ADMIN
const {
  getAllUser,
  getUserDetail,
  updateUser,
  deleteUser,
} = require("../controllers/adminController");
const { isAuthenticatedUser, authorizeRoles } = require("../middlewares/auth");

//Get all user
router
  .route("/admin/users")
  .get(isAuthenticatedUser, authorizeRoles("admin"), getAllUser);

//Detail user && Update user
router
  .route("/admin/user/:id")
  .get(isAuthenticatedUser, authorizeRoles("admin"), getUserDetail)
  .put(isAuthenticatedUser, authorizeRoles("admin"), updateUser)
  .delete(isAuthenticatedUser, authorizeRoles("admin"), deleteUser);

module.exports = router;
