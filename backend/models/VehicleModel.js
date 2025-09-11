const mongoose = require('mongoose');

// Vehicle Schema
const vehicleSchema = new mongoose.Schema({
    // Owner Information
    ownerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'VehicleOwner',
        required: true
    },

    // Basic Vehicle Information
    vehicleType: {
        type: String,
        required: true,
        enum: ['car', 'van', 'truck', 'motorcycle', 'bicycle', 'bus', 'other']
    },

    make: {
        type: String,
        required: true,
        trim: true
    },

    model: {
        type: String,
        required: true,
        trim: true
    },

    year: {
        type: Number,
        required: true,
        min: 1900,
        max: new Date().getFullYear() + 1
    },

    color: {
        type: String,
        required: true,
        trim: true
    },

    licensePlate: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        uppercase: true
    },

    // Vehicle Specifications
    seatingCapacity: {
        type: Number,
        required: true,
        min: 1
    },

    fuelType: {
        type: String,
        required: true,
        enum: ['petrol', 'diesel', 'electric', 'hybrid', 'gas']
    },

    transmission: {
        type: String,
        required: true,
        enum: ['manual', 'automatic']
    },

    mileage: {
        type: Number,
        default: 0,
        min: 0
    },

    engineCapacity: {
        type: String, // e.g., "1500cc"
        trim: true
    },

    // Vehicle Features
    features: [{
        type: String,
        trim: true
    }], // Air conditioning, GPS, etc.

    description: {
        type: String,
        trim: true,
        maxlength: 1000
    },

    // Images
    images: [{
        url: {
            type: String,
            required: true
        },
        publicId: {
            type: String,
            required: true
        },
        description: {
            type: String,
            trim: true
        },
        isPrimary: {
            type: Boolean,
            default: false
        },
        uploadedAt: {
            type: Date,
            default: Date.now
        }
    }],

    // Rental Information
    rentalPrice: {
        dailyRate: {
            type: Number,
            default: 0,
            min: 0
        },
        weeklyRate: {
            type: Number,
            default: 0,
            min: 0
        },
        monthlyRate: {
            type: Number,
            default: 0,
            min: 0
        },
        securityDeposit: {
            type: Number,
            default: 0,
            min: 0
        },
        currency: {
            type: String,
            default: 'LKR'
        }
    },

    // Approval and Status
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected', 'available', 'rented', 'maintenance', 'unavailable'],
        default: 'pending'
    },

    approvalDetails: {
        approvedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'BusinessOwner'
        },
        approvedAt: {
            type: Date
        },
        rejectionReason: {
            type: String,
            trim: true
        },
        approvalNotes: {
            type: String,
            trim: true
        }
    },

    // Location Information
    location: {
        address: {
            type: String,
            required: true,
            trim: true
        },
        city: {
            type: String,
            required: true,
            trim: true
        },
        state: {
            type: String,
            required: true,
            trim: true
        },
        zipCode: {
            type: String,
            required: true,
            trim: true
        },
        coordinates: {
            latitude: Number,
            longitude: Number
        }
    },

    // Insurance and Documentation
    insurance: {
        provider: {
            type: String,
            required: true,
            trim: true
        },
        policyNumber: {
            type: String,
            required: true,
            trim: true
        },
        expiryDate: {
            type: Date,
            required: true
        },
        coverage: {
            type: String,
            trim: true
        }
    },

    registration: {
        registrationNumber: {
            type: String,
            required: true,
            trim: true
        },
        expiryDate: {
            type: Date,
            required: true
        }
    },

    // Vehicle Documents
    documents: {
        insurance: {
            url: {
                type: String,
                trim: true
            },
            publicId: {
                type: String,
                trim: true
            },
            fileName: {
                type: String,
                trim: true
            },
            uploadedAt: {
                type: Date
                // Removed default: Date.now - should only be set when actually uploaded
            }
        },
        registration: {
            url: {
                type: String,
                trim: true
            },
            publicId: {
                type: String,
                trim: true
            },
            fileName: {
                type: String,
                trim: true
            },
            uploadedAt: {
                type: Date
                // Removed default: Date.now - should only be set when actually uploaded
            }
        },
        emissionTest: {
            url: {
                type: String,
                trim: true
            },
            publicId: {
                type: String,
                trim: true
            },
            fileName: {
                type: String,
                trim: true
            },
            uploadedAt: {
                type: Date
                // Removed default: Date.now - should only be set when actually uploaded
            }
        }
    },

    // Maintenance Scheduling
    maintenanceSchedule: [{
        title: {
            type: String,
            required: true,
            trim: true
        },
        description: {
            type: String,
            trim: true
        },
        startDate: {
            type: Date,
            required: true
        },
        endDate: {
            type: Date,
            required: true
        },
        type: {
            type: String,
            enum: ['scheduled_maintenance', 'repair', 'inspection', 'other'],
            default: 'scheduled_maintenance'
        },
        status: {
            type: String,
            enum: ['scheduled', 'in_progress', 'completed', 'cancelled'],
            default: 'scheduled'
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],

    // Availability
    availability: {
        isAvailable: {
            type: Boolean,
            default: false
        },
        availableFrom: {
            type: Date
        },
        availableUntil: {
            type: Date
        },
        unavailableDates: [{
            from: Date,
            to: Date,
            reason: String
        }]
    },

    // Rating and Reviews
    rating: {
        average: {
            type: Number,
            default: 0,
            min: 0,
            max: 5
        },
        totalReviews: {
            type: Number,
            default: 0
        }
    },

    // Analytics
    analytics: {
        totalBookings: {
            type: Number,
            default: 0
        },
        totalEarnings: {
            type: Number,
            default: 0
        },
        lastBookedDate: {
            type: Date
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
    }
});

// Pre-save middleware to update the updatedAt field
vehicleSchema.pre('save', function (next) {
    this.updatedAt = new Date();
    next();
});

// Index for efficient queries
vehicleSchema.index({ ownerId: 1 });
vehicleSchema.index({ status: 1 });
vehicleSchema.index({ vehicleType: 1 });
vehicleSchema.index({ 'location.city': 1 });
vehicleSchema.index({ licensePlate: 1 });

// Virtual for primary image
vehicleSchema.virtual('primaryImage').get(function () {
    const primary = this.images.find(img => img.isPrimary);
    return primary || this.images[0];
});

// Method to check if vehicle is available for given dates
vehicleSchema.methods.isAvailableForDates = function (startDate, endDate) {
    if (this.status !== 'available') return false;

    // Check maintenance schedule
    const hasMaintenanceConflict = this.maintenanceSchedule.some(maintenance => {
        return maintenance.status === 'scheduled' &&
            startDate < maintenance.endDate &&
            endDate > maintenance.startDate;
    });

    if (hasMaintenanceConflict) return false;

    // Check unavailable dates
    const hasUnavailableConflict = this.availability.unavailableDates.some(period => {
        return startDate < period.to && endDate > period.from;
    });

    return !hasUnavailableConflict;
};

// Method to add maintenance schedule
vehicleSchema.methods.addMaintenanceSchedule = function (maintenanceData) {
    this.maintenanceSchedule.push(maintenanceData);

    // If maintenance is starting now or in future, update vehicle status
    const now = new Date();
    if (maintenanceData.startDate <= now && maintenanceData.endDate > now) {
        this.status = 'maintenance';
    }

    return this.save();
};

// Static method to get vehicles by owner
vehicleSchema.statics.getByOwner = function (ownerId, status = null) {
    const query = { ownerId };
    if (status) query.status = status;

    return this.find(query)
        .populate('ownerId', 'firstName lastName email phone')
        .populate('approvalDetails.approvedBy', 'firstName lastName email')
        .sort({ createdAt: -1 });
};

// Static method to get available vehicles for rental
vehicleSchema.statics.getAvailableVehicles = function (filters = {}) {
    const query = {
        status: 'available',
        'availability.isAvailable': true
    };

    if (filters.vehicleType) query.vehicleType = filters.vehicleType;
    if (filters.city) query['location.city'] = new RegExp(filters.city, 'i');
    if (filters.minPrice) query['rentalPrice.dailyRate'] = { $gte: filters.minPrice };
    if (filters.maxPrice) {
        query['rentalPrice.dailyRate'] = query['rentalPrice.dailyRate'] || {};
        query['rentalPrice.dailyRate'].$lte = filters.maxPrice;
    }

    return this.find(query)
        .populate('ownerId', 'firstName lastName rating phone')
        .sort({ 'rating.average': -1, createdAt: -1 });
};

const Vehicle = mongoose.model('Vehicle', vehicleSchema);

module.exports = { Vehicle };
