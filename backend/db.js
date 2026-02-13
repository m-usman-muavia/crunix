// backend/db.js
const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    
    if (!mongoUri) {
      console.warn("⚠️  MONGODB_URI not set in environment variables. Skipping database connection.");
      console.warn("⚠️  Please add MONGODB_URI to your .env file");
      return;
    }
    
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log("✅ MongoDB Connected Successfully");
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err.message);
    console.error("❌ Please check:");
    console.error("   1. Your MongoDB URI is correct");
    console.error("   2. Your IP is whitelisted in MongoDB Atlas");
    console.error("   3. Your network connection is stable");
    // Don't exit process - allow app to run even if DB fails
  }
};

// Handle connection events
mongoose.connection.on('connected', () => {
  console.log('✅ Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ Mongoose connection error:', err.message);
});

mongoose.connection.on('disconnected', () => {
  console.warn('⚠️  Mongoose disconnected from MongoDB');
});

module.exports = connectDB;
