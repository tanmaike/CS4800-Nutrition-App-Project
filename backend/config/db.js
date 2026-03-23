const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        // Get connection string from environment variable
        const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/nutrition_app';
        
        console.log('Connecting to MongoDB Atlas...');
        
        const conn = await mongoose.connect(mongoURI, {
            // No need for deprecated options in Mongoose 6+
        });
        
        console.log(`MongoDB Connected to Atlas: ${conn.connection.host}`);
        console.log(`Database: ${conn.connection.name}`);
        
    } catch (error) {
        console.error('MongoDB Connection Failed:', error.message);
        process.exit(1);
    }
};

module.exports = connectDB;