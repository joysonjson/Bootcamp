const User = require("../models/User");
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/asyncHandler");
const path = require("path");

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
