require('dotenv').config();
const mongoose = require('mongoose');
const { BusinessOwner } = require('../models/UserModel');

// Connect to MongoDB
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');
    } catch (error) {
        console.error('❌ MongoDB connection error:', error);
        process.exit(1);
    }
};

// Create Business Owner
const createBusinessOwner = async () => {
    try {
        // Check if business owner already exists
        const existingBusinessOwner = await BusinessOwner.findOne({
            $or: [
                { email: 'business@pickandgo.com' },
                { username: 'business_owner' }
            ]
        });

        if (existingBusinessOwner) {
            console.log('✅ Business Owner already exists:', existingBusinessOwner.email);
            return existingBusinessOwner;
        }

        // Create new business owner
        const businessOwner = new BusinessOwner({
            email: 'business@pickandgo.com',
            password: 'business123', // Plain text password (as per current system)
            username: 'business_owner',
            businessName: 'Pick & Go Business',
            contactNumber: '+1234567890',
            ownerName: '',
            businessType: '',
            businessAddress: {
                street: '',
                city: '',
                state: '',
                zipCode: '',
                country: 'Sri Lanka'
            },
            businessLicense: '',
            taxId: '',
            website: '',
            description: '',
            role: 'business_owner',
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date()
        });

        await businessOwner.save();
        console.log('✅ Business Owner created successfully!');
        console.log('📧 Email: business@pickandgo.com');
        console.log('👤 Username: business_owner');
        console.log('🔑 Password: business123');
        console.log('🆔 ID:', businessOwner._id.toString());

        return businessOwner;
    } catch (error) {
        console.error('❌ Error creating business owner:', error);
        throw error;
    }
};

// Main function
const main = async () => {
    try {
        await connectDB();
        await createBusinessOwner();
        console.log('🎉 Script completed successfully!');
    } catch (error) {
        console.error('❌ Script failed:', error);
    } finally {
        await mongoose.connection.close();
        console.log('📊 Database connection closed');
        process.exit(0);
    }
};

// Run the script
main();
