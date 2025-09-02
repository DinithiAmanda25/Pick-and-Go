const mongoose = require('mongoose');

const connectDB = async () => {
    try {

        // Connect to MongoDB
        const conn = await mongoose.connect(process.env.MONGO_URI);

        console.log(`\n📊 Database Name: ${conn.connection.name}`);

        // Handle connection events
        mongoose.connection.on('connected', () => {
            console.log('🔗 Mongoose connected to MongoDB');
        });

        mongoose.connection.on('error', (err) => {
            console.error('❌ Mongoose connection error:', err);
        });

        mongoose.connection.on('disconnected', () => {
            console.log('🔌 Mongoose disconnected from MongoDB');
        });

        return conn;
    } catch (error) {
        console.error('❌ MongoDB connection failed:', error.message);
        process.exit(1);
    }
};


module.exports = { connectDB };
