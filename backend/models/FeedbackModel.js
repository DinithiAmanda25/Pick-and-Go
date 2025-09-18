const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
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
  category: {
    type: String,
    enum: ['payment', 'booking', 'login', 'vehicle_condition', 'driver_service', 'general'],
    required: [true, 'Feedback category is required']
  },
  subject: {
    type: String,
    required: [true, 'Subject is required'],
    trim: true,
    maxlength: [100, 'Subject cannot exceed 100 characters']
  },
  message: {
    type: String,
    required: [true, 'Message is required'],
    trim: true,
    maxlength: [1000, 'Message cannot exceed 1000 characters']
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['open', 'in_progress', 'resolved', 'closed'],
    default: 'open'
  },
  attachments: [{
    filename: {
      type: String,
      required: true
    },
    originalName: {
      type: String,
      required: true
    },
    path: {
      type: String,
      required: true
    },
    size: {
      type: Number,
      required: true
    },
    mimetype: {
      type: String,
      required: true
    }
  }],
  adminResponse: {
    message: {
      type: String,
      trim: true
    },
    respondedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    respondedAt: {
      type: Date
    }
  },
  isPublic: {
    type: Boolean,
    default: false
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }]
}, {
  timestamps: true
});

// Index for better query performance
feedbackSchema.index({ user: 1 });
feedbackSchema.index({ booking: 1 });
feedbackSchema.index({ vehicle: 1 });
feedbackSchema.index({ category: 1 });
feedbackSchema.index({ status: 1 });
feedbackSchema.index({ severity: 1 });
feedbackSchema.index({ createdAt: -1 });

// Add admin response
feedbackSchema.methods.addAdminResponse = function(message, adminId) {
  this.adminResponse = {
    message: message,
    respondedBy: adminId,
    respondedAt: new Date()
  };
  this.status = 'in_progress';
  return this.save();
};

// Mark as resolved
feedbackSchema.methods.markResolved = function() {
  this.status = 'resolved';
  return this.save();
};
const Feedback = mongoose.model('Feedback', feedbackSchema );
module.exports = { Feedback };



