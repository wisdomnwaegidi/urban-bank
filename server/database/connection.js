const mongoose = require("mongoose");
const dotenv = require("dotenv");
mongoose.set("strictQuery", true);

dotenv.config();

const url = String(process.env.MONGO_URI);

const connectDB = () => {
  try {
    mongoose.connect(url);
    console.log("Connected to MongoDB successfully!");
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
    process.exit(1);
  }
};

module.exports = connectDB;
