const Bootcamp = require("../models/Bootcamp");
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/asyncHandler");
const geocoder = require("../utils/geocoder");
// @desc      Get all bootcamps
// @route     GET /api/v1/bootcamps
// @access    Public
exports.getBootcamps = asyncHandler(async (req, res, next) => {
  let query;

  const reqQuery = { ...req.query };

  const removeFields = ["select", "sort", "page", "limit"];

  // Loop over removeFields and delete them from reqQuery
  removeFields.forEach((param) => delete reqQuery[param]);

  // Create query string
  let queryStr = JSON.stringify(reqQuery);

  // Create operators ($gt, $gte, etc)
  queryStr = queryStr.replace(
    /\b(gt|gte|lt|lte|in)\b/g,
    (match) => `$${match}`
  );

  // Finding resource
  query = Bootcamp.find(JSON.parse(queryStr));

  // Select Fields
  if (req.query.select) {
    const fields = req.query.select.split(",").join(" ");
    query = query.select(fields);
  }

  // Sort
  if (req.query.sort) {
    const sortBy = req.query.sort.split(",").join(" ");
    query = query.sort(sortBy);
  } else {
    query = query.sort("-createdAt");
  }
  
  // pagination
  const page = parseInt(req.query.page)  || 2
  const limit = parseInt(req.query.limit) || 2
  const total = await Bootcamp.countDocuments();

  const skip = (page-1) * limit
const endIndex = page * limit
  query = query.skip(skip).limit(limit)

  const bootcamps = await query;

  const pagination = {};

  if (endIndex < total) {
    pagination.next = {
      page: page + 1,
      limit
    };
  }

  if (skip > 0) {
    pagination.prev = {
      page: page - 1,
      limit
    };
  }
  res.status(200).json({ status: true,pagination, bootcamps: bootcamps });
});

// @desc      Get single bootcamp
// @route     GET /api/v1/bootcamps/:id
// @access    Public
exports.getBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id);
  if (!bootcamp) {
    return next(new ErrorResponse(`Bootcamp with id ${req.params.id}`, 404));
  }
  res.status(200).json({ status: true, bootcamp });
});

// @desc      Create new bootcamp
// @route     POST /api/v1/bootcamps
// @access    Private
exports.createBootcamp = asyncHandler(async (req, res, next) => {
  console.log(req.body);
  const bootcamp = await Bootcamp.create(req.body);
  res.status(201).json({ status: true, data: bootcamp });
});

// @desc      Update bootcamp
// @route     PUT /api/v1/bootcamps/:id
// @access    Private
exports.updateBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!bootcamp) {
    return next(new ErrorResponse(`Bootcamp with id ${req.params.id}`, 404));
  }
  res.status(200).json({ status: true, bootcamp });
});

// @desc      Delete bootcamp
// @route     DELETE /api/v1/bootcamps/:id
// @access    Private
exports.deleteBootcamp = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findByIdAndDelete(req.params.id);
  if (!bootcamp) {
    return next(new ErrorResponse(`Bootcamp with id ${req.params.id}`, 404));
  }
  res.status(200).json({ status: true, bootcamp: {} });
});
// @desc      get bootcamp within radiuos
// @route     GET /api/v1/bootcamps/radius/:zipcode/:distence
// @access    Private
exports.getBootcampsWithinRadius = asyncHandler(async (req, res, next) => {
  const { zipcode, distance } = req.params;
  //get lat and long from the geocode
  const loc = await geocoder.geocode(zipcode);
  const lat = loc[0].latitude;
  const lon = loc[0].longitude;

  // calculate radius using radians
  // devide distence by the radius of the earth
  // earth radius is = 3,693

  const radius = distance / 3693;
  const bootcamps = await Bootcamp.find({
    location: { $geoWithin: { $centerSphere: [[lon, lat], radius] } },
  });
  res.status(200).json({
    status: true,
    bootcamps: bootcamps,
  });
});
