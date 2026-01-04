const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    // DIRECT FIX: We put the address right here to avoid .env issues
    const dbAddress = "mongodb://127.0.0.1:27017/retail_assistant_db";
    
    await mongoose.connect(dbAddress);
    console.log("MongoDB Connected Successfully");
  } catch (error) {
    console.error("Database Connection Failed:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;