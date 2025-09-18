const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User is required']
  },
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: [true, 'Booking is required']
  },
  vehicle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle',
    required: [true, 'Vehicle is required']
  },
  driver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  score: {
    type: Number,
    required: [true, 'Rating score is required'],
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot exceed 5']
  },
  categories: {
    vehicleCondition: {
      type: Number,
      min: 1,
      max: 5,
      default: null
    },
    driverService: {
      type: Number,
      min: 1,
      max: 5,
      default: null
    },
    bookingProcess: {
      type: Number,
      min: 1,
      max: 5,
      default: null
    },
    valueForMoney: {
      type: Number,
      min: 1,
      max: 5,
      default: null
    },
    overallExperience: {
      type: Number,
      min: 1,
      max: 5,
      default: null
    }
  },
  review: {
    type: String,
    trim: true,
    maxlength: [500, 'Review cannot exceed 500 characters']
  },
  pros: [{
    type: String,
    trim: true,
    maxlength: [100, 'Pro cannot exceed 100 characters']
  }],
  cons: [{
    type: String,
    trim: true,
    maxlength: [100, 'Con cannot exceed 100 characters']
  }],
  wouldRecommend: {
    type: Boolean,
    default: null
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  helpfulVotes: {
    type: Number,
    default: 0
  },
  reportCount: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for better query performance
ratingSchema.index({ user: 1 });
ratingSchema.index({ booking: 1 });
ratingSchema.index({ vehicle: 1 });
ratingSchema.index({ driver: 1 });
ratingSchema.index({ score: -1 });
ratingSchema.index({ createdAt: -1 });

// Compound index for unique rating per booking per user
ratingSchema.index({ user: 1, booking: 1 }, { unique: true });

// Calculate overall score from categories
ratingSchema.pre('save', function(next) {
  if (this.categories) {
    const categoryScores = Object.values(this.categories).filter(score => score !== null);
    if (categoryScores.length > 0) {
      const totalScore = categoryScores.reduce((sum, score) => sum + score, 0);
      this.score = Math.round((totalScore / categoryScores.length) * 10) / 10; // Round to 1 decimal
    }
  }
  next();
});

// Update vehicle rating after save
ratingSchema.post('save', async function() {
  const Vehicle = mongoose.model('Vehicle');
  const vehicle = await Vehicle.findById(this.vehicle);
  if (vehicle) {
    await vehicle.updateAverageRating();
  }
});

// Update vehicle rating after remove
ratingSchema.post('remove', async function() {
  const Vehicle = mongoose.model('Vehicle');
  const vehicle = await Vehicle.findById(this.vehicle);
  if (vehicle) {
    await vehicle.updateAverageRating();
  }
});

// Mark as helpful
ratingSchema.methods.markHelpful = function() {
  this.helpfulVotes += 1;
  return this.save();
};

// Report rating
ratingSchema.methods.report = function() {
  this.reportCount += 1;
  return this.save();
};

module.exports = mongoose.model('Rating', ratingSchema);