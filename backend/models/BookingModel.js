const mongoose = require('mongoose');

// Booking Schema
const bookingSchema = new mongoose.Schema({
    // Client Information
    clientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Client',
        required: true
    },

    // Vehicle Information
    vehicleId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vehicle',
        required: false
    },

    // Vehicle Owner Information (for easier queries)
    vehicleOwnerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'VehicleOwner',
        required: true
    },

    // Booking Details
    bookingReference: {
        type: String,
        unique: true,
        required: false
    },

    // Rental Period
    rentalPeriod: {
        startDate: {
            type: Date,
            required: true
        },
        endDate: {
            type: Date,
            required: true
        },
        startTime: {
            type: String,
            required: true,
            default: '09:00'
        },
        endTime: {
            type: String,
            required: true,
            default: '17:00'
        },
        totalDays: {
            type: Number,
            required: true,
            min: 1
        }
    },

    // Location Details
    pickupLocation: {
        address: {
            type: String,
            required: true
        },
        city: {
            type: String,
            required: true
        },
        coordinates: {
            latitude: Number,
            longitude: Number
        },
        instructions: String
    },

    dropoffLocation: {
        address: {
            type: String,
            required: true
        },
        city: {
            type: String,
            required: true
        },
        coordinates: {
            latitude: Number,
            longitude: Number
        },
        instructions: String
    },

    // Pricing
    pricing: {
        dailyRate: {
            type: Number,
            required: true,
            min: 0
        },
        totalDays: {
            type: Number,
            required: true,
            min: 1
        },
        subtotal: {
            type: Number,
            required: true,
            min: 0
        },
        securityDeposit: {
            type: Number,
            default: 0,
            min: 0
        },
        serviceFee: {
            type: Number,
            default: 0,
            min: 0
        },
        taxes: {
            type: Number,
            default: 0,
            min: 0
        },
        totalAmount: {
            type: Number,
            required: true,
            min: 0
        },
        currency: {
            type: String,
            default: 'LKR'
        }
    },

    // Booking Status
    status: {
        type: String,
        enum: [
            'pending',           // Waiting for vehicle owner approval
            'confirmed',         // Approved by vehicle owner
            'payment_pending',   // Confirmed but payment required
            'paid',             // Payment completed
            'active',           // Currently ongoing rental
            'completed',        // Rental completed successfully
            'cancelled',        // Cancelled by client or owner
            'rejected',         // Rejected by vehicle owner
            'refunded'          // Payment refunded
        ],
        default: 'pending'
    },

    // Payment Information
    payment: {
        method: {
            type: String,
            enum: ['card', 'bank_transfer', 'cash', 'mobile_payment'],
            default: 'card'
        },
        status: {
            type: String,
            enum: ['pending', 'completed', 'failed', 'refunded'],
            default: 'pending'
        },
        transactionId: String,
        paidAmount: {
            type: Number,
            default: 0
        },
        paymentDate: Date,
        refundAmount: {
            type: Number,
            default: 0
        },
        refundDate: Date
    },

    // Driver Information (if driver service is included)
    driver: {
        required: {
            type: Boolean,
            default: false
        },
        driverId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Driver'
        },
        driverFee: {
            type: Number,
            default: 0
        }
    },

    // Additional Services
    additionalServices: [{
        name: {
            type: String,
            required: true
        },
        description: String,
        price: {
            type: Number,
            required: true,
            min: 0
        },
        quantity: {
            type: Number,
            default: 1,
            min: 1
        }
    }],

    // Special Requirements
    specialRequirements: {
        type: String,
        maxlength: 500
    },

    // Approval Details
    approval: {
        approvedBy: {
            type: mongoose.Schema.Types.Mixed,
            ref: 'VehicleOwner'
        },
        approvedAt: Date,
        rejectionReason: String,
        approvalNotes: String
    },

    // Communication
    messages: [{
        from: {
            type: String,
            enum: ['client', 'owner', 'driver', 'admin'],
            required: true
        },
        fromId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true
        },
        message: {
            type: String,
            required: true,
            maxlength: 1000
        },
        timestamp: {
            type: Date,
            default: Date.now
        },
        read: {
            type: Boolean,
            default: false
        }
    }],

    // Documents and Files
    documents: [{
        type: {
            type: String,
            enum: ['license', 'id', 'contract', 'insurance', 'other'],
            required: true
        },
        url: {
            type: String,
            required: true
        },
        publicId: String,
        fileName: String,
        uploadedBy: {
            type: mongoose.Schema.Types.ObjectId,
            required: true
        },
        uploadedAt: {
            type: Date,
            default: Date.now
        }
    }],

    // Reviews and Ratings
    review: {
        clientReview: {
            rating: {
                type: Number,
                min: 1,
                max: 5
            },
            comment: String,
            reviewDate: Date
        },
        ownerReview: {
            rating: {
                type: Number,
                min: 1,
                max: 5
            },
            comment: String,
            reviewDate: Date
        }
    },

    // Timestamps
    createdAt: {
        type: Date,
        default: Date.now
    },

    updatedAt: {
        type: Date,
        default: Date.now
    },

    // Cancellation Details
    cancellation: {
        cancelledBy: {
            type: String,
            enum: ['client', 'owner', 'admin']
        },
        cancelledAt: Date,
        reason: String,
        refundAmount: Number,
        cancellationFee: {
            type: Number,
            default: 0
        }
    }
});

// Pre-save middleware to update the updatedAt field
bookingSchema.pre('save', function (next) {
    this.updatedAt = new Date();
    next();
});

// Generate unique booking reference
bookingSchema.pre('save', async function (next) {
    if (this.isNew && !this.bookingReference) {
        const date = new Date();
        const year = date.getFullYear().toString().slice(-2);
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        
        // Generate a random 4-digit number
        const randomNum = Math.floor(1000 + Math.random() * 9000);
        
        this.bookingReference = `PG${year}${month}${day}${randomNum}`;
    }
    next();
});

// Indexes for efficient queries
bookingSchema.index({ clientId: 1 });
bookingSchema.index({ vehicleId: 1 });
bookingSchema.index({ vehicleOwnerId: 1 });
bookingSchema.index({ status: 1 });
bookingSchema.index({ bookingReference: 1 });
bookingSchema.index({ 'rentalPeriod.startDate': 1, 'rentalPeriod.endDate': 1 });

// Virtual for booking duration in days
bookingSchema.virtual('duration').get(function () {
    const start = new Date(this.rentalPeriod.startDate);
    const end = new Date(this.rentalPeriod.endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
});

// Method to check if booking can be cancelled
bookingSchema.methods.canCancel = function () {
    const now = new Date();
    const startDate = new Date(this.rentalPeriod.startDate);
    
    // Can cancel if booking hasn't started and is not already cancelled/completed
    return startDate > now && 
           !['cancelled', 'completed', 'refunded'].includes(this.status);
};
// Add these methods to your BookingModel schema:

// Method to check if status transition is valid
bookingSchema.methods.canTransitionTo = function (newStatus) {
    const validTransitions = {
        pending: ['confirmed', 'rejected', 'cancelled'],
        confirmed: ['payment_pending', 'paid', 'cancelled'],
        payment_pending: ['paid', 'cancelled'],
        paid: ['active', 'cancelled'],
        active: ['completed', 'cancelled'],
        completed: [],
        cancelled: [],
        rejected: []
    };
    
    return validTransitions[this.status] && validTransitions[this.status].includes(newStatus);
};

// Method to get valid next statuses
bookingSchema.methods.getValidNextStatuses = function () {
    const validTransitions = {
        pending: ['confirmed', 'rejected', 'cancelled'],
        confirmed: ['payment_pending', 'paid', 'cancelled'],
        payment_pending: ['paid', 'cancelled'],
        paid: ['active', 'cancelled'],
        active: ['completed', 'cancelled'],
        completed: [],
        cancelled: [],
        rejected: []
    };
    
    return validTransitions[this.status] || [];
};
// Method to calculate cancellation fee
bookingSchema.methods.calculateCancellationFee = function () {
    const now = new Date();
    const startDate = new Date(this.rentalPeriod.startDate);
    const hoursUntilStart = (startDate - now) / (1000 * 60 * 60);
    
    // Cancellation fee based on time until start
    if (hoursUntilStart > 48) {
        return 0; // No fee if cancelled more than 48 hours in advance
    } else if (hoursUntilStart > 24) {
        return this.pricing.totalAmount * 0.25; // 25% fee
    } else if (hoursUntilStart > 12) {
        return this.pricing.totalAmount * 0.50; // 50% fee
    } else {
        return this.pricing.totalAmount * 0.75; // 75% fee
    }
};

// Static method to get bookings by client
bookingSchema.statics.getByClient = function (clientId, status = null) {
    const query = { clientId };
    if (status) query.status = status;

    return this.find(query)
        .populate('vehicleId', 'make model year licensePlate images location')
        .populate('vehicleOwnerId', 'firstName lastName phone email')
        .populate('driver.driverId', 'fullName phone rating')
        .sort({ createdAt: -1 });
};

// Static method to get bookings by vehicle owner
bookingSchema.statics.getByVehicleOwner = function (vehicleOwnerId, status = null) {
    const query = { vehicleOwnerId };
    if (status) query.status = status;

    return this.find(query)
        .populate('clientId', 'firstName lastName phone email')
        .populate('vehicleId', 'make model year licensePlate images')
        .sort({ createdAt: -1 });
};

// Static method to check vehicle availability
bookingSchema.statics.checkVehicleAvailability = function (vehicleId, startDate, endDate, excludeBookingId = null) {
    const query = {
        vehicleId,
        status: { $nin: ['cancelled', 'rejected', 'refunded'] },
        $or: [
            {
                'rentalPeriod.startDate': { $lte: endDate },
                'rentalPeriod.endDate': { $gte: startDate }
            }
        ]
    };

    if (excludeBookingId) {
        query._id = { $ne: excludeBookingId };
    }

    return this.find(query);
};

// Static method to get active bookings
bookingSchema.statics.getActiveBookings = function () {
    const now = new Date();
    
    return this.find({
        status: 'active',
        'rentalPeriod.startDate': { $lte: now },
        'rentalPeriod.endDate': { $gte: now }
    })
    .populate('clientId', 'firstName lastName phone email')
    .populate('vehicleId', 'make model licensePlate')
    .populate('vehicleOwnerId', 'firstName lastName phone');
};

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = { Booking };