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
        default: 'driver',
        enum: ['driver']
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

// Driver Schema
const driverSchema = new mongoose.Schema({
    ...baseUserFields,
    driverId: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    fullName: {
        type: String,
        required: true,
        trim: true
    },
    phone: {
        type: String,
        required: true,
        trim: true
    },
    address: {
        street: String,
        city: String,
        state: String,
        zipCode: String,
        country: String
    },
    dateOfBirth: {
        type: Date
    },
    emergencyContact: {
        name: String,
        phone: String,
        relationship: String
    },
    vehicleInfo: {
        type: {
            type: String,
            enum: ['car', 'motorcycle', 'bicycle', 'van', 'truck']
        },
        model: String,
        plateNumber: String,
        color: String,
        year: Number
    },
    documents: {
        license: {
            url: String,
            publicId: String,
            uploadedAt: Date
        },
        identityCard: {
            url: String,
            publicId: String,
            uploadedAt: Date
        },
        insurance: {
            url: String,
            publicId: String,
            uploadedAt: Date
        },
        registration: {
            url: String,
            publicId: String,
            uploadedAt: Date
        },
        medicalCertificate: {
            url: String,
            publicId: String,
            uploadedAt: Date
        }
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected', 'suspended'],
        default: 'pending'
    },
    rating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    },
    totalDeliveries: {
        type: Number,
        default: 0
    },
    availability: {
        type: String,
        enum: ['available', 'busy', 'offline'],
        default: 'offline'
    }
});

// Create Driver model
const Driver = mongoose.model('Driver', driverSchema);

module.exports = { Driver };
