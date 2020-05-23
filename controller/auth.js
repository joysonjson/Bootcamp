const User = require("../models/User");
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/asyncHandler");
const path = require("path");
const SendMail = require("../utils/sendEmail");
const crypto = require("crypto");

// @desc      Register usr
// @route     POST /api/v1/auth/register
// @access    Public
exports.register = asyncHandler(async (req, res, next) => {
  const { name, email, password, role } = req.body;

  const user = await User.create({
    name,
    email,
    password,
    role,
  });

  const token = user.getSignedJwtToken();
  res.status(200).json({ status: true, token });
});

// @desc      Login
// @route     POST /api/v1/auth/login
// @access    Public
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
  console.log("req body".red, req.body);

  // validation
  if (!email || !password) {
    return next(
      new ErrorResponse(`Please proved the email and the password`, 400)
    );
  }
  // check for user

  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    return next(new ErrorResponse(`Inavalid credentials`, 401));
  }

  // match password
  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    return next(new ErrorResponse(`Inavalid credentials`, 401));
  }

  getTokenResponse(user, 200, res);
});

// @desc      Login
// @route     POST /api/v1/auth/login
// @access    Public
exports.profile = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({
    status: true,
    data: user,
  });
});

// @desc      Login
// @route     POST /api/v1/auth/login
// @access    Public
exports.forgotPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(
      new ErrorResponse(`User with ${req.body.email} could not be found`, 404)
    );
  }

  const resetToken = user.getResetPasswordToken();
  await user.save({ validateBeforeSave: false });

  const resetUrl = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/auth/resetpassword/${resetToken}`;

  const message = `you have requested password change :${resetUrl}`;

  try {
    await SendMail({
      email: user.email,
      subject: "Password reset token",
      message,
    });
    res.status(200).json({
      status: true,
      data: `email sent to ${req.body.email}`,
    });
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });

    console.log(error.red);
    return next(
      new ErrorResponse(`Email could not be sent to ${req.body.email}`, 500)
    );
  }
});

// @desc      Reset password
// @route     POST /api/v1/auth/resetpassword/:resetToken
// @access    Public
exports.resetPassword = asyncHandler(async (req, res, next) => {
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.resetToken)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken: resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });
  if (!user) {
    return next(new ErrorResponse(`Inavalid token`, 400));
  }
  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();
  getTokenResponse(user, 200, res);
});

// get token from model and then create cookie and send the response

const getTokenResponse = (user, statusCode, res) => {
  const token = user.getSignedJwtToken();
  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };
  if (process.env.NODE_ENV === "production") {
    options.secure = true;
  }
  res
    .status(statusCode)
    .cookie("token", token, options)
    .json({ status: true, token });
};
