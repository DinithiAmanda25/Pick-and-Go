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
        default: 'admin',
        enum: ['admin']
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
    }
};

// Admin Schema
const adminSchema = new mongoose.Schema({
    ...baseUserFields,
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    fullName: {
        type: String,
        required: true,
        trim: true
    }
});

// Create Admin model
const Admin = mongoose.model('Admin', adminSchema);

module.exports = { Admin };
