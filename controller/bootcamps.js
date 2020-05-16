const Bootcamp = require('../models/Bootcamp');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../middleware/asyncHandler');
const geocoder = require('../utils/geocoder');
const path = require('path');
// @desc      Get all bootcamps
// @route     GET /api/v1/bootcamps
// @access    Public
exports.getBootcamps = asyncHandler(async (req, res, next) => {
  console.log('get all bootcamps'.red, res.advancedResults);

  res.status(200).json(res.advancedResults);
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
  const bootcamp = await Bootcamp.findById(req.params.id);
  if (!bootcamp) {
    return next(new ErrorResponse(`Bootcamp with id ${req.params.id}`, 404));
  }
  bootcamp.remove();
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

// @desc      Upload photo bootcamp
// @route     PUT /api/v1/bootcamps/:id
// @access    Private
exports.bootcampPhotoUpload = asyncHandler(async (req, res, next) => {
  const bootcamp = await Bootcamp.findById(req.params.id);
  if (!bootcamp) {
    return next(new ErrorResponse(`Bootcamp with id ${req.params.id}`, 404));
  }
  // check files
  if (!req.files) {
    return next(new ErrorResponse(`Please upload a file`, 400));
  }
  const file = req.files.files;
  // check for image files
  if (!file.mimetype.startsWith('image')) {
    return next(new ErrorResponse(`Please upload a image file`, 400));
  }
  // FILE_UPLOAD_PATH = ./public/uploads
  // MAX_FILE_UPLOAD = 1000000
  // size
  if (file.size > process.env.MAX_FILE_UPLOAD) {
    return next(
      new ErrorResponse(
        `Please upload a image file with less than ${process.env.MAX_FILE_UPLOAD}`,
        400
      )
    );
  }
  // create custom unique file name
  file.name = `photo_${bootcamp._id}${path.parse(file.name).ext}`;

  file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async (err) => {
    if (err) {
      return next(new ErrorResponse(`Problem with image upload ${err}`, 500));
    }
    await Bootcamp.findByIdAndUpdate(req.params.id, { photo: file.name });
    res.status(200).json({
      status: true,
      data: file.name,
    });
  });
});
