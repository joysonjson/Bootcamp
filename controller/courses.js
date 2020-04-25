const Courses = require("../models/Courses");
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/asyncHandler");

// @desc      Get all Coures
// @route     GET /api/v1/courses
// @route     GET /api/v1/bootcamps/:bootcampId/courses
// @access    Public

exports.getCourses = asyncHandler(async (req, res, next) => {
  let query = Courses.find();
  if (req.params.bootcampId) {
    query = Courses.find(req.params.bootcampId);
  }
  console.log("Request got".red, req);
  const courses = await query;
  console.log("courses".green, courses);

  res.status(200).json({ status: true, courses });
});
