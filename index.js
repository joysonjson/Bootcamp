const express = require("express");
const dotenv = require("dotenv");
const logger = require("./middleware/logger");
const morgan = require("morgan");
const colors = require("colors");
const errorHandler = require("./middleware/error");
const connectToDb = require("./config/db");

//load env vars

dotenv.config({ path: "./config/config.env" });

//importing routers
const bootcamps = require("./router/bootcamps");
const courses = require("./router/courses");

const app = express();

app.use(express.json());

connectToDb();

//middle ware
// app.use(logger);

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

//mount routes
app.use("/api/v1/bootcamps", bootcamps);
app.use("/api/v1/courses", courses);

//error handler adding it after he router so that it is accessible router and its controller
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(
    `App listening on port ${PORT}! mode ${process.env.NODE_ENV}`.yellow.bold
  );
});

process.on("unhandledRejection", (err, promise) => {
  console.log(`Error : ${err.message}.`.red);

  server.close(() => process.exit());
});
