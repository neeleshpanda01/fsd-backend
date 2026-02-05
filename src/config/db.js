const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const mongoURI = process.env.MONGODB_URI;
        
        if (!mongoURI) {
            throw new Error('MONGODB_URI is not defined in environment variables');
        }

        await mongoose.connect(mongoURI, {
            serverSelectionTimeoutMS: 15000
        });
        console.log('MongoDB Connected via MongoDB Atlas...');
    } catch (err) {
        console.error('--- MONGODB CONNECTION ERROR ---');
        console.error('Message:', err.message);
        console.error('Potential Cause: Security/Network restrictions or Whitelist.');
        console.error('---------------------------------');
        process.exit(1);
    }
};

module.exports = connectDB;
