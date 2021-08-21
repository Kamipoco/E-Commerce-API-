const mongoose = require("mongoose");
const Product = mongoose.model("Product");
const Order = mongoose.model("Order");

const ErrorHandler = require("../utils/errorHandler");
const catchAsyncError = require("../middlewares/catchAsyncError");

//========ROLE USER=============

//Create a new order   =>  /api/v1/order/new
exports.newOrder = catchAsyncError(async (req, res, next) => {
  const {
    orderItems,
    shippingInfo,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
    paymentInfo,
  } = req.body;

  const order = await Order.create({
    orderItems,
    shippingInfo,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
    paymentInfo,
    paidAt: Date.now(),
    user: req.user._id,
  });

  res.status(200).json({
    status: 200,
    message: "Created Successfully!",
    data: { order },
  });
});

//Get detail order  ==> /api/v1/order/:id
exports.getdetailOrder = catchAsyncError(async (req, res, next) => {
  const order = await Order.findById(req.params.id).populate(
    "user",
    "name email"
  );

  if (!order) {
    return next(new ErrorHandler("No order found with this ID", 404));
  }

  res.status(200).json({
    status: 200,
    message: "Success",
    data: { order },
  });
});

//Get my order  ==>> /api/v1/orders/me
exports.getMyOrder = catchAsyncError(async (req, res, next) => {
  const idUser = req.user._id;

  const myOrder = await Order.find({ user: idUser }).populate(
    "user",
    "name email"
  );

  if (!myOrder) {
    return next(new ErrorHandler("No order found with this ID", 404));
  }

  res.status(200).json({
    status: 200,
    message: "Success",
    data: { myOrder },
  });
});

//ROLE ADMIN

//Get all order
exports.getAllOrder = catchAsyncError(async (req, res, next) => {
  const orders = await Order.find();

  //Tổng số lượng đơn hàng
  const totalAllOrder = await Order.countDocuments();

  //Tổng tiển tất cả đơn hàng
  let totalMount = 0;

  orders.forEach((element) => {
    totalMount += element.totalPrice;
  });

  res.status(200).json({
    status: 200,
    message: "Get All Order Success",
    totalAllOrder,
    totalMount,
    data: { orders },
  });
});

//Update process order
exports.updateProcessOrder = catchAsyncError(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  //Check status order
  if (order.orderStatus === "Delivered") {
    return next(new ErrorHandler("You have already delivered this order", 400));
  }

  order.orderItems.forEach(async (item) => {
    await updateStock(item.product, item.quantity);
  });

  //Update lại status order và thời điểm admin bắt đầu chuyển hàng đi
  order.orderStatus = req.body.status;
  order.deliveredAt = Date.now();
  await order.save();

  res.status(200).json({
    status: 200,
    message: "Updated Successfully!",
    data: { order },
  });
});

//Update lại số lượng product trong kho khi update status order
async function updateStock(id, quantity) {
  const product = await Product.findById(id);

  product.stock = product.stock - quantity;

  await product.save({ validateBeforeSave: false });
}

//Delete a Order
exports.deleteOrder = catchAsyncError(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new ErrorHandler("No order found with this ID ", 404));
  }

  await order.remove();

  res.status(200).json({
    status: 200,
    message: "Deleted Order Successfully!",
  });
});
