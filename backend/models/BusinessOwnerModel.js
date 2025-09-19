const mongoose = require('mongoose');

// Base User Schema fields
const baseUserFields = {
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        default: 'business_owner',
        enum: ['business_owner']
    },
    isActive: {
        type: Boolean,
        default: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    profileImage: {
        url: String,
        publicId: String,
        uploadedAt: Date
    },
    documents: [{
        type: String, // e.g., 'license', 'registration', 'insurance'
        url: String,
        publicId: String,
        uploadedAt: Date
    }]
};

// Business Owner Schema
const businessOwnerSchema = new mongoose.Schema({
    ...baseUserFields,
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    businessName: {
        type: String,
        required: true,
        trim: true
    },
    contactNumber: {
        type: String,
        required: true,
        trim: true
    },
    ownerName: {
        type: String,
        required: true,
        trim: true
    },
    businessType: {
        type: String,
        required: true,
        enum: ['restaurant', 'retail', 'grocery', 'pharmacy', 'other']
    },
    businessAddress: {
        street: String,
        city: String,
        state: String,
        zipCode: String,
        country: String
    },
    businessLicense: String,
    taxId: String,
    website: String,
    description: String
});

// Create BusinessOwner model
const BusinessOwner = mongoose.model('BusinessOwner', businessOwnerSchema);

module.exports = { BusinessOwner };
