const mongoose = require("mongoose");
const User = mongoose.model("User");

const ErrorHandler = require("../utils/errorHandler");
const catchAsyncError = require("../middlewares/catchAsyncError");

//ROLE ADMIN

//Get all user  ==> /api/v1/admin/users
exports.getAllUser = catchAsyncError(async (req, res, next) => {
  const users = await User.find();

  res.status(200).json({
    status: 200,
    message: "Success",
    data: { users },
  });
});

//Get user detail   ==>> /api/v1/admin/user/:id
exports.getUserDetail = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(
      new ErrorHandler(`User does not found with id: ${req.params.id}`)
    );
  }

  res.status(200).json({
    status: 200,
    message: "Success",
    data: { user },
  });
});

//Update user ==>> /api/v1/admin/user/:id
exports.updateUser = catchAsyncError(async (req, res, next) => {
  const newUserData = {
    name: req.body.name,
    email: req.body.email,
    role: req.body.role,
  };

  const user = await User.findByIdAndUpdate(req.params.id, newUserData, {
    new: true,
    runValidators: true,
    useFindAndModify: false,
  });

  res.status(200).json({
    status: 200,
    message: "Updated User Successfully",
    data: { user },
  });
});

//Delete user   ==>> /api/v1/admin/user/:id
exports.deleteUser = catchAsyncError(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(
      new ErrorHandler(`User does not found with id: ${req.params.id}`)
    );
  }

  await user.remove();

  res.status(200).json({
    status: 200,
    message: "Deleted User Successfully!",
  });
});
