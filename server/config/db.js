// server/config/db.js
const mongoose = require('mongoose');

const connectDB = async () => {
    console.log("Attempting to connect to MongoDB...");
    try {
        // We use the URI from your .env file
        await mongoose.connect(process.env.MONGO_URI);
        console.log('SUCCESS: MongoDB Connected...');
    } catch (err) {
        console.error('FAILURE: MongoDB Connection Error:', err.message);
        // Exit process with failure
        process.exit(1);
    }
};

module.exports = connectDB;