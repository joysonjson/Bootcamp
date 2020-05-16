const express = require('express');
const dotenv = require('dotenv');
const logger = require('./middleware/logger');
const morgan = require('morgan');
const colors = require('colors');
const errorHandler = require('./middleware/error');
const connectToDb = require('./config/db');
const fileUpload = require('express-fileupload');
const path = require('path');
const cookieParser = require('cookie-parser');

//load env vars

dotenv.config({ path: './config/config.env' });

//importing routers
const bootcamps = require('./router/bootcamps');
const courses = require('./router/courses');
const auth = require('./router/auth');

const app = express();

app.use(express.json());
app.use(cookieParser());
connectToDb();

//middle ware
// app.use(logger);

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
app.use(fileUpload());

// set static folder
app.use(express.static(path.join(__dirname, 'public')));

//mount routes
app.use('/api/v1/bootcamps', bootcamps);
app.use('/api/v1/courses', courses);
app.use('/api/v1/auth', auth);

//error handler adding it after he router so that it is accessible router and its controller
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(
    `App listening on port ${PORT}! mode ${process.env.NODE_ENV}`.yellow.bold
  );
});

process.on('unhandledRejection', (err, promise) => {
  console.log(`Error : ${err.message}.`.red);

  server.close(() => process.exit());
});
