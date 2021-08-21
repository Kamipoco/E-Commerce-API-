const mongoose = require("mongoose");
const User = mongoose.model("User");

const ErrorHandler = require("../utils/errorHandler");
const catchAsyncError = require("../middlewares/catchAsyncError");
const sendToken = require("../utils/jwtToken");

//ROLE USER

//Get currently profile user  ==> /api/v1/me
exports.getUserProfile = catchAsyncError(async (req, res, next) => {
  const idCurrentUser = req.user._id;
  const user = await User.findById({ _id: idCurrentUser });

  res.status(200).json({
    status: 200,
    message: "Success",
    data: { user },
  });
});

//Change update password of user ==>> /api/v1/password/update
exports.changeUpdatePassword = catchAsyncError(async (req, res, next) => {
  const user = await User.findById({ _id: req.user._id }).select("+password");

  const isMatched = await user.comparePassword(req.body.oldPassword);

  if (!isMatched) {
    return next(new ErrorHandler("Old password is incorrect"));
  }

  user.password = req.body.password;
  await user.save();

  sendToken(user, 200, res);
});

//Update User Profile
exports.updateUserProfile = catchAsyncError(async (req, res, next) => {
  const newUserData = {
    name: req.body.name,
    email: req.body.email,
  };

  const user = await User.findByIdAndUpdate(
    { _id: req.user._id },
    newUserData,
    {
      new: true,
      runValidators: true,
      useFindAndModify: false,
    }
  );

  res.status(200).json({
    status: 200,
    message: "Updated User Profile Successfully!",
  });
});
