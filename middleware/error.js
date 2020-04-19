const ErrorResponse = require("../utils/errorResponse");

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  console.log(JSON.stringify(err).red.bold);

  //mongoose bad object id
  if (error.name === "CastError") {
    const msg = `Bootcamp not found with id ${err.value}`;
    error = new ErrorResponse(msg, 404);
  }

  // mongoose duplicate key
  if (error.code === 11000) {
    const msg = `Duplicate field value entered`;
    error = new ErrorResponse(msg, 400);
    console.log(JSON.stringify(error).blue.bold);
  }

  //mangoose validation error
  if (error.name === "ValidationError") {
    const object = Object.values(err.errors).map((val) => val.message);
    error = new ErrorResponse(object, 400);
  }
  res.status(error.statusCode || 500).json({
    status: false,
    error: error.message || "Server Error",
  });
};
module.exports = errorHandler;
