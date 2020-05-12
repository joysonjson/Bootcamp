const Courses = require('../models/Courses');
const BootCamp = require('../models/Bootcamp');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/asyncHandler');

// @desc      Get all Coures
// @route     GET /api/v1/courses
// @route     GET /api/v1/bootcamps/:bootcampId/courses
// @access    Public

exports.getCourses = asyncHandler(async (req, res, next) => {
  let query;
  if (req.params.bootcampId) {
    console.log('Request got'.red, req);

    query = Courses.find({ bootcamp: req.params.bootcampId });
  } else {
    query = Courses.find().populate({
      path: 'bootcamp',
      select: 'name description',
    });
  }
  const courses = await query;
  console.log('courses'.green, courses);

  res.status(200).json({ status: true, courses });
});

// @desc      Get all Coures
// @route     GET /api/v1/courses
// @route     GET /api/v1/bootcamps/:bootcampId/courses
// @access    Public

exports.getCourse = asyncHandler(async (req, res, next) => {
  const course = await Courses.findById(req.params.id).populate({
    path: 'bootcamp',
    select: 'name description',
  });
  console.log('returning from response', course);

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
  const bootcam = await BootCamp.findById(req.params.bootcampId);
  if (!bootcam) {
    return next(
      new ErrorResponse(`No course with the id of ${req.params.id}`, 404)
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
    console.log('returning from response', course);

    return next(
      new ErrorResponse(`No course with the id of ${req.params.id}`, 404)
    );
  }

  await course.remove();

  res.status(200).json({ status: true, data: {} });
});
