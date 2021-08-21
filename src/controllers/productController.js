const mongoose = require("mongoose");
const Product = mongoose.model("Product");
const ErrorHandler = require("../utils/errorHandler");
const APIFeatures = require("../utils/apiFeatures");
const catchAsyncError = require("../middlewares/catchAsyncError");

//===========ROLE USER=================

//Create new Product   ==> /api/v1/product/new
exports.createProduct = async (req, res, next) => {
  req.body.user = req.user.id;
  const product = new Product(req.body);

  try {
    const savedProduct = await product.save();

    res.status(200).json({
      status: 200,
      message: "Success",
      data: { savedProduct },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//Get all product  ==> /api/v1/products?keyword=apple
exports.getProducts = async (req, res, next) => {
  try {
    //Chia 4 sản phẩm mỗi trang
    const resPerPage = 4;
    //Lấy tổng số lượng tất cả sản phẩm
    const totalAllProduct = await Product.countDocuments();

    const apiFeatures = new APIFeatures(Product.find(), req.query)
      .search()
      .filter()
      .pagination(resPerPage);

    const getAllProduct = await apiFeatures.query;

    res.status(200).json({
      status: 200,
      message: "Success",
      count: getAllProduct.length,
      totalAllProduct: totalAllProduct,
      data: { getAllProduct },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//Get detail a Product  ==> /api/v1/product/:idProduct
exports.getDetailProduct = async (req, res, next) => {
  const id = req.params.idProduct;

  try {
    const detailProduct = await Product.findById({ _id: id });

    if (!detailProduct) {
      return next(new ErrorHandler("Product not found", 404));
    }

    res.status(200).json({
      status: 200,
      message: "Success",
      data: { detailProduct },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error,
    });
  }
};

//Create new review       ==>> /api/v1/review
exports.createNewReview = catchAsyncError(async (req, res, next) => {
  const { rating, comment, productId } = req.body;

  const review = {
    user: req.user._id,
    name: req.user.name,
    rating: Number(rating),
    comment,
  };

  const product = await Product.findById({ _id: productId });

  //Check xem người này đã review sản phẩm chưa
  const isReviewed = product.reviews.find((r) => {
    r.user.toString() === req.user._id.toString();
  });

  if (isReviewed) {
    //Nếu họ review rồi thì có thể được thay đổi lại

    product.reviews.forEach((element) => {
      if (element.user.toString() === req.user._id.toString()) {
        element.comment = comment;
        element.rating = rating;
      }
    });
  } else {
    //Ngược lại push cái review mới đánh giá vào

    product.reviews.push(review);
    product.numOfReviews = product.reviews.length;
  }

  //Tính trung bình tất cả các review (Lấy tổng giá trị đánh giá chia cho số lượng đánh giá)
  product.ratings = //(prev, current)
    product.reviews.reduce((prev, current) => prev + current.rating, 0) /
    product.reviews.length;

  await product.save({ validateBeforeSave: false });

  res.status(200).json({
    status: 200,
    message: "Reviewed Successfully!",
    data: review,
  });
});

//Get all reviews   ==>> /api/v1/review?id=
exports.getAllReviews = catchAsyncError(async (req, res, next) => {
  const product = await Product.findById(req.query.id);

  //reviews
  const getAllReviews = product.reviews;

  res.status(200).json({
    status: 200,
    message: "Success",
    data: { getAllReviews },
  });
});

//Delete a review product  ==>> /api/v1/review/:id
exports.deleteReview = catchAsyncError(async (req, res, next) => {
  const product = await Product.findById(req.query.productId);

  //Lọc id mà client truyền vào để loại nó ra khỏi reviews khi delete review product
  const reviews = product.reviews.filter(
    (review) => review._id.toString() !== req.query.id.toString()
  );

  //Update lại số lượng reviews
  const numOfReviews = reviews.length;

  //Update lại ratings khi vừa xóa 1 review product
  console.log(product);
  console.log(reviews);
  const ratings =
    product.reviews.reduce((prev, current) => prev + current.rating, 0) /
    reviews.length;

  await Product.findByIdAndUpdate(
    req.query.productId,
    {
      reviews,
      ratings,
      numOfReviews,
    },
    {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    }
  );

  res.status(200).json({
    status: 200,
    message: "Deleted Review Product Successfully!",
  });
});

//==========ROLE ADMIN==============

//Update Product  ==> /api/v1/admin/product/:idProduct
exports.updateProduct = async (req, res, next) => {
  const id = req.params.idProduct;

  try {
    let product = await Product.findById({ _id: id });

    if (!product) {
      return next(new ErrorHandler("Product not found", 404));
    }

    product = await Product.findByIdAndUpdate({ _id: id }, req.body, {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    });

    res.status(200).json({
      status: 200,
      message: "Updated Product",
      data: { product },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

//Delete A Product  ==> /api/v1/admin/product/:idProduct
exports.deleteProduct = async (req, res, next) => {
  const id = req.params.idProduct;

  try {
    const product = await Product.findById({ _id: id });

    if (!product) {
      return next(new ErrorHandler("Product not found", 404));
    }

    await product.remove();

    res.status(200).json({
      success: 200,
      message: "Deleted A Product",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
