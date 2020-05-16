const express = require('express');
const router = express.Router();

const {
  getBootcamps,
  getBootcamp,
  createBootcamp,
  updateBootcamp,
  deleteBootcamp,
  getBootcampsWithinRadius,
  bootcampPhotoUpload,
} = require('../controller/bootcamps');

const { protect, authorize } = require('../middleware/auth.js');
// include other routers
const courseRouter = require('./courses');
const BootCamp = require('../models/Bootcamp');
const advancedResult = require('../middleware/advancedResult');

// reroute to other routes
router.use('/:bootcampId/courses', courseRouter);
router
  .route('/:id/photo')
  .put(protect, authorize('publisher', 'admin'), bootcampPhotoUpload);

router.route('/radius/:zipcode/:distance').get(getBootcampsWithinRadius);
router
  .route('/')
  .get(advancedResult(BootCamp, 'courses'), getBootcamps)
  .post(protect, authorize('publisher', 'admin'), createBootcamp);
router
  .route('/:id')
  .get(getBootcamp)
  .put(protect, authorize('publisher', 'admin'), updateBootcamp)
  .delete(protect, authorize('publisher', 'admin'), deleteBootcamp);

module.exports = router;
