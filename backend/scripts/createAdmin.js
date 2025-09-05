require('dotenv').config();
const mongoose = require('mongoose');
const { Admin } = require('../models/UserModel');

// Connect to MongoDB
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('📊 Connected to MongoDB');
    } catch (error) {
        console.error('❌ MongoDB connection failed:', error.message);
        process.exit(1);
    }
};

// Create default admin user
const createAdmin = async () => {
    try {
        // Check if admin already exists
        const existingAdmin = await Admin.findOne({ username: 'admin' });

        if (existingAdmin) {
            console.log('✅ Admin user already exists');
            console.log('Username:', existingAdmin.username);
            console.log('Email:', existingAdmin.email);
            return;
        }

        // Create new admin
        const admin = new Admin({
            username: 'admin',
            email: 'admin@pickandgo.com',
            password: 'admin123', // Change this to a secure password
            fullName: 'System Administrator',
            role: 'admin',
            isActive: true
        });

        await admin.save();
        console.log('✅ Admin user created successfully');
        console.log('Username: admin');
        console.log('Email: admin@pickandgo.com');
        console.log('Password: admin123');
        console.log('⚠️  Please change the default password after first login');

    } catch (error) {
        console.error('❌ Error creating admin:', error.message);
    }
};

// Run the script
const run = async () => {
    await connectDB();
    await createAdmin();
    process.exit(0);
};

run();
