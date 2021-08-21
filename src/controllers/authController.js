const mongoose = require("mongoose");
const User = mongoose.model("User");

const ErrorHandler = require("../utils/errorHandler");
const catchAsyncError = require("../middlewares/catchAsyncError");
const sendToken = require("../utils/jwtToken");
const sendEmail = require("../utils/sendEmail");
const crypto = require("crypto");

//Register User   =>> /api/v1/register
exports.registerUser = catchAsyncError(async (req, res, next) => {
  const { name, email, password } = req.body;

  const user = await User.create({
    name,
    email,
    password,
    avatar: {
      public_id: "avatars/12387asdjkh2312321asdasd",
      url: "https://res.cloudinary.com/aloapp/image/upload/v1624555118/yrxlt3uz36k55rofhcln.png",
    },
  });

  //Truyền 3 tham số (data user, statusCode, res)
  sendToken(user, 200, res);
});

//Login User   =>> /api/v1/login
exports.loginUser = catchAsyncError(async (req, res, next) => {
  const { email, password } = req.body;

  //Checks if email and password entered by user
  if (!email || !password) {
    return next(new ErrorHandler("Please enter email or password", 400));
  }

  //Finding user in DB
  const user = await User.findOne({ email: email }).select("+password");

  if (!user) {
    return next(new ErrorHandler("Invalid Email or Password", 401));
  }

  //Checks if password is correct or not
  const isPasswordMatched = await user.comparePassword(password);

  if (!isPasswordMatched) {
    return next(new ErrorHandler("Invalid Email or Password"));
  }

  //Truyền 3 tham số (data user, statusCode, res)
  sendToken(user, 200, res);
});

//Logout User  ==> /api/v1/logout
exports.logoutUser = catchAsyncError(async (req, res, next) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });

  res.status(200).json({
    status: 200,
    message: "Logged Out",
  });
});

//Forgot password  ==> /api/v1/password/forgot
exports.forgotPassword = catchAsyncError(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new ErrorHandler("User not found with this email", 404));
  }

  //Get reset email
  const resetToken = user.getResetPasswordToken();

  await user.save({ validateBeforeSave: false });

  //Create reset password url
  const resetUrl = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/password/reset/${resetToken}`;

  const message = `Your password reset token is as follow:\n\n${resetUrl}\n\nIf you have not requested this email, then ignore it.`;

  try {
    await sendEmail({
      email: user.email,
      subject: "ShopIT Password Recovery",
      message,
    });

    res.status(200).json({
      status: 200,
      message: `Email sent to: ${user.email}`,
    });
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save({ validateBeforeSave: false });

    return next(new ErrorHandler("error.message", 500));
  }
});

//Reset New password  ==> /api/v1/password/reset/:token
exports.resetPasword = catchAsyncError(async (req, res, next) => {
  //Hash URL Token
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  //Check link token
  const user = await User.findOne({
    resetPasswordToken: resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    {
      return next(
        new ErrorHandler(
          "Password reset token is invalid or has been expired",
          404
        )
      );
    }
  }

  if (req.body.password !== req.body.confirmPassword) {
    return next(new ErrorHandler("Password does not match", 400));
  }

  //Setup new password
  user.password = req.body.password;

  //Sau khi đổi password thành công thì undefined token và thời hạn
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();

  sendToken(user, 200, res);
});
