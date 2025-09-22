const mongoose = require('mongoose');

// Review Schema for Vehicle Owner services
const reviewSchema = new mongoose.Schema({
    vehicleOwnerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'VehicleOwner',
        required: true
    },
    clientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Client',
        required: true
    },
    clientName: {
        type: String,
        required: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    comment: {
        type: String,
        maxLength: 1000
    },
    serviceType: {
        type: String,
        enum: ['vehicle_rental', 'delivery', 'transport', 'other'],
        default: 'vehicle_rental'
    },
    bookingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Booking'
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    helpfulCount: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

// Indexes for better query performance
reviewSchema.index({ vehicleOwnerId: 1, createdAt: -1 });
reviewSchema.index({ clientId: 1 });
reviewSchema.index({ rating: 1 });

// Virtual for formatted creation date
reviewSchema.virtual('createdAtFormatted').get(function () {
    return this.createdAt.toLocaleDateString(); // Format as needed
});

// Method to calculate rating breakdown for a vehicle owner
reviewSchema.statics.getRatingBreakdown = async function (vehicleOwnerId) {
    const breakdown = await this.aggregate([
        { $match: { vehicleOwnerId: mongoose.Types.ObjectId(vehicleOwnerId) } },
        {
            $group: {
                _id: '$rating',
                count: { $sum: 1 }
            }
        }
    ]);

    const result = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    breakdown.forEach(item => {
        result[item._id] = item.count;
    });

    return result;
};

// Method to update vehicle owner rating after new review
reviewSchema.post('save', async function () {
    const VehicleOwner = require('./VehicleOwnerModel').VehicleOwner;

    const stats = await this.constructor.aggregate([
        { $match: { vehicleOwnerId: this.vehicleOwnerId } },
        {
            $group: {
                _id: null,
                averageRating: { $avg: '$rating' },
                totalRatings: { $sum: '$rating' },
                ratingCount: { $sum: 1 }
            }
        }
    ]);

    if (stats.length > 0) {
        await VehicleOwner.findByIdAndUpdate(this.vehicleOwnerId, {
            rating: Math.round(stats[0].averageRating * 10) / 10, // Round to 1 decimal
            totalRatings: stats[0].totalRatings,
            ratingCount: stats[0].ratingCount,
            updatedAt: new Date()
        });
    }
});

const Review = mongoose.model('Review', reviewSchema);

module.exports = { Review };
