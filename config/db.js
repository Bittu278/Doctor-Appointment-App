const mongoose = require('mongoose');
const colors = require('colors');

async function connectDB() {
    try {
       await mongoose.connect(process.env.MONGO_URL);
        console.log(`Mongodb Connected: ${mongoose.connection.host}`.bgGreen.white);
    } catch (error) {
        console.error(`Mongodb Server Issue: ${error.message}`.bgRed.white);
        process.exit(1); // Optionally exit the process if connection fails
    }
};

module.exports = connectDB;
