const mongoose = require('mongoose');

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1) {
    return;
  }
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/community_help_hub');
    console.log(`[DATABASE] MongoDB connected successfully: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[DATABASE] Error connecting to MongoDB: ${error.message}`);
    if (!process.env.VERCEL) {
      process.exit(1);
    }
    throw error;
  }
};

module.exports = connectDB;
