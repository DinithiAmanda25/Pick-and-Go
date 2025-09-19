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
        default: 'client',
        enum: ['client']
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
        type: String, // e.g., 'id', 'proof_of_address'
        url: String,
        publicId: String,
        uploadedAt: Date
    }]
};

// Client Schema
const clientSchema = new mongoose.Schema({
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
    dateOfBirth: {
        type: Date
    },
    address: {
        street: String,
        city: String,
        state: String,
        zipCode: String,
        country: String
    },
    preferences: {
        deliveryInstructions: String,
        preferredDeliveryTime: String,
        contactPreference: {
            type: String,
            enum: ['phone', 'email', 'sms'],
            default: 'phone'
        },
        notifications: {
            orderUpdates: {
                type: Boolean,
                default: true
            },
            promotions: {
                type: Boolean,
                default: false
            }
        }
    },
    orderHistory: [{
        orderId: String,
        orderDate: Date,
        totalAmount: Number,
        status: String
    }],
    loyaltyPoints: {
        type: Number,
        default: 0
    }
});

// Create Client model
const Client = mongoose.model('Client', clientSchema);

module.exports = { Client };
