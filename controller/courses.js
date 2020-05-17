const Courses = require("../models/Courses");
const BootCamp = require("../models/Bootcamp");
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/asyncHandler");

// @desc      Get all Coures
// @route     GET /api/v1/courses
// @route     GET /api/v1/bootcamps/:bootcampId/courses
// @access    Public

exports.getCourses = asyncHandler(async (req, res, next) => {
  if (req.params.bootcampId) {
    console.log("Request got".red, req);

    const courses = await Courses.find({ bootcamp: req.params.bootcampId });
    return res.status(200).json({ status: true, courses });
  } else {
    res.status(200).json(res.advancedResults);
  }
});

// @desc      Get all Coures
// @route     GET /api/v1/courses
// @route     GET /api/v1/bootcamps/:bootcampId/courses
// @access    Public

exports.getCourse = asyncHandler(async (req, res, next) => {
  const course = await Courses.findById(req.params.id).populate({
    path: "bootcamp",
    select: "name description",
  });
  console.log("returning from response", course);

  if (!course) {
    return next(
      new ErrorResponse(`No course with the id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({ status: true, course });
});

// @desc      add  course
// @route     POST /api/v1/bootcamps/:bootcampId/courses
// @access    private

exports.addCourse = asyncHandler(async (req, res, next) => {
  // boot camp id
  req.body.bootcamp = req.params.bootcampId;
  req.body.user = req.user.id;

  const bootcamp = await BootCamp.findById(req.params.bootcampId);
  if (!bootcamp) {
    return next(
      new ErrorResponse(`No course with the id of ${req.params.id}`, 404)
    );
  }

  if (String(bootcamp.user) !== req.user.id && req.user.role !== "admin") {
    console.log("access denied".red);

    return next(
      new ErrorResponse(
        `User ${req.user.id} is not allowed create coruse to ${bootcamp.id}`,
        403
      )
    );
  }
  const course = await Courses.create(req.body);

  res.status(200).json({ status: true, course });
});

// @desc      update  course
// @route     PUT /api/v1/courses/:id
// @access    private

exports.updateCourse = asyncHandler(async (req, res, next) => {
  let course = await Courses.findById(req.params.id);
  if (!course) {
    return next(
      new ErrorResponse(`No course with the id of ${req.params.id}`, 404)
    );
  }
  if (String(course.user) !== req.user.id && req.user.role !== "admin") {
    console.log("access denied".red);

    return next(
      new ErrorResponse(
        `User ${req.user.id} is not allowed update coruse to ${bootcamp.id}`,
        403
      )
    );
  }
  course = await Courses.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  res.status(200).json({ status: true, course });
});

// @desc      delete  course
// @route     PUT /api/v1/courses/:id
// @access    private

exports.deleteCourse = asyncHandler(async (req, res, next) => {
  const course = await Courses.findById(req.params.id);
  console.log(course);
  if (!course) {
    console.log("returning from response", course);

    return next(
      new ErrorResponse(`No course with the id of ${req.params.id}`, 404)
    );
  }
  if (String(course.user) !== req.user.id && req.user.role !== "admin") {
    console.log("access denied".red);

    return next(
      new ErrorResponse(
        `User ${req.user.id} is not allowed delete course  ${bootcamp.id}`,
        403
      )
    );
  }
  await course.remove();

  res.status(200).json({ status: true, data: {} });
});
