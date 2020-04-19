const mongoose = require("mongoose");

const connectToDb = async () => {
  const conn = await mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  });
  console.log(`Mongo db connected: ${conn.connect.host}`.cyan.bold);
};

module.exports = connectToDb;
