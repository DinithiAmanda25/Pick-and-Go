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
        default: 'vehicle_owner',
        enum: ['vehicle_owner']
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
        type: {
            type: String, // e.g., 'license', 'insurance', 'registration', 'identity', 'medical-certificate', 'other'
            required: true
        },
        url: {
            type: String,
            required: true
        },
        publicId: String,
        originalName: String,
        fileSize: Number,
        mimeType: String,
        uploadedAt: {
            type: Date,
            default: Date.now
        },
        status: {
            type: String,
            enum: ['pending_verification', 'verified', 'rejected'],
            default: 'pending_verification'
        }
    }]
};

// Vehicle Owner Schema
const vehicleOwnerSchema = new mongoose.Schema({
    ...baseUserFields,
    firstName: {
        type: String,
        required: true,
        trim: true
    },
    lastName: {
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
    vehicles: [{
        make: String,
        model: String,
        year: Number,
        plateNumber: String,
        color: String,
        vehicleType: {
            type: String,
            enum: ['car', 'motorcycle', 'bicycle', 'van', 'truck']
        },
        isActive: {
            type: Boolean,
            default: true
        },
        documents: {
            registration: {
                url: String,
                publicId: String,
                uploadedAt: Date
            },
            insurance: {
                url: String,
                publicId: String,
                uploadedAt: Date
            },
            inspection: {
                url: String,
                publicId: String,
                uploadedAt: Date
            }
        },
        addedAt: {
            type: Date,
            default: Date.now
        }
    }],
    bankDetails: {
        accountHolderName: String,
        accountNumber: String,
        routingNumber: String,
        bankName: String
    },
    earnings: {
        totalEarnings: {
            type: Number,
            default: 0
        },
        currentBalance: {
            type: Number,
            default: 0
        },
        lastPayoutDate: Date
    },
    rating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    },
    totalRatings: {
        type: Number,
        default: 0
    },
    ratingCount: {
        type: Number,
        default: 0
    }
});

// Create VehicleOwner model
const VehicleOwner = mongoose.model('VehicleOwner', vehicleOwnerSchema);

module.exports = { VehicleOwner };
