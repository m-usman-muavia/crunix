// backend/db.js
const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    
    if (!mongoUri) {
      console.warn("MONGODB_URI not set in environment variables. Skipping database connection.");
      return;
    }
    
    await mongoose.connect(mongoUri);
    console.log("MongoDB Connected Successfully");
  } catch (err) {
    console.error("MongoDB connection failed:", err.message);
    // Don't exit process - allow app to run even if DB fails
    // This allows testing without a database
  }
};

module.exports = connectDB;
