const express = require("express");
const router = express.Router();

//require feature of order controller
const {
  newOrder,
  getdetailOrder,
  getMyOrder,
  getAllOrder,
  updateProcessOrder,
  deleteOrder,
} = require("../controllers/orderController");

//require middleware Authen(Xác thực) and Author(Phân quyền)
const { isAuthenticatedUser, authorizeRoles } = require("../middlewares/auth");

//========ROLE USER=============

//Create new order
router.route("/order/new").post(isAuthenticatedUser, newOrder);

//Get Detail Order
router.route("/order/:id").get(isAuthenticatedUser, getdetailOrder);

//Get My Order
router.route("/orders/me").get(isAuthenticatedUser, getMyOrder);

//=====ROLE ADMIN======================

//Get all order
router
  .route("/admin/orders")
  .get(isAuthenticatedUser, authorizeRoles("admin"), getAllOrder);

//Update process order
router
  .route("/admin/order/:id")
  .put(isAuthenticatedUser, authorizeRoles("admin"), updateProcessOrder)
  .delete(isAuthenticatedUser, authorizeRoles("admin"), deleteOrder);

module.exports = router;
