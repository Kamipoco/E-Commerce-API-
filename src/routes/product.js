const express = require("express");
const router = express.Router();

const {
  getProducts,
  createProduct,
  getDetailProduct,
  updateProduct,
  deleteProduct,
  createNewReview,
  getAllReviews,
  deleteReview,
} = require("../controllers/productController");

//require middleware Authen(Xác thực) and Author(Phân quyền)
const { isAuthenticatedUser, authorizeRoles } = require("../middlewares/auth");

//==========ROLE GUEST OR USER=============

//Get all product
router.route("/products").get(getProducts);

//Get Detail Product
router.route("/product/:idProduct").get(getDetailProduct);

//Review Product
router.route("/review").put(isAuthenticatedUser, createNewReview);

//Get all reviews & Delete review product
router
  .route("/reviews")
  .get(isAuthenticatedUser, getAllReviews)
  .delete(isAuthenticatedUser, deleteReview);

//====================================ROLE-ADMIN===========================================================================
//Create Product ==> Check Login
router
  .route("/admin/product/new")
  .post(isAuthenticatedUser, authorizeRoles("admin"), createProduct);

//Update Product  ==> Check Login
router
  .route("/admin/product/:idProduct")
  .put(isAuthenticatedUser, authorizeRoles("admin"), updateProduct)
  .delete(isAuthenticatedUser, authorizeRoles("admin"), deleteProduct);

module.exports = router;
