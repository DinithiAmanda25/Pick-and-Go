const mongoose = require('mongoose');

const packageSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Package name is required'],
    trim: true,
    maxlength: [100, 'Package name cannot exceed 100 characters']
  },
  duration: {
    type: String,
    required: [true, 'Duration is required'],
    enum: ['1 Day', '2 Days', '3 Days', '1 Week', '2 Weeks', '1 Month'],
    default: '1 Day'
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  discount: {
    type: Number,
    default: 0,
    min: [0, 'Discount cannot be negative'],
    max: [100, 'Discount cannot exceed 100%']
  },
  vehicles: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle',
    required: true
  }],
  features: [{
    type: String,
    required: true,
    trim: true
  }],
  businessOwner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BusinessOwner',
    required: [true, 'Business owner is required']
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
  }
}, {
  timestamps: true
});

// Index for better query performance
packageSchema.index({ businessOwner: 1, isActive: 1 });
packageSchema.index({ name: 1, businessOwner: 1 }, { unique: true });

// Virtual for discounted price
packageSchema.virtual('discountedPrice').get(function() {
  return this.price - (this.price * this.discount / 100);
});

// Virtual for duration in days
packageSchema.virtual('durationInDays').get(function() {
  const durationMap = {
    '1 Day': 1,
    '2 Days': 2,
    '3 Days': 3,
    '1 Week': 7,
    '2 Weeks': 14,
    '1 Month': 30
  };
  return durationMap[this.duration] || 1;
});

// Pre-save middleware to update the updatedAt field
packageSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Pre-save middleware to validate vehicles exist
packageSchema.pre('save', async function(next) {
  if (this.vehicles && this.vehicles.length > 0) {
    const Vehicle = mongoose.model('Vehicle');
    const existingVehicles = await Vehicle.find({
      _id: { $in: this.vehicles },
      status: 'available',
      'availability.isAvailable': true
    });
    
    if (existingVehicles.length !== this.vehicles.length) {
      return next(new Error('Some vehicles are not available for rental'));
    }
  }
  next();
});

// Static method to get packages by business owner
packageSchema.statics.getPackagesByBusinessOwner = async function(businessOwnerId, options = {}) {
  const query = { businessOwner: businessOwnerId };
  
  if (options.isActive !== undefined) {
    query.isActive = options.isActive;
  }
  
  return await this.find(query)
    .populate('vehicles', 'make model year type pricePerDay images')
    .populate('businessOwner', 'businessName email')
    .sort({ createdAt: -1 });
};

// Static method to get active packages
packageSchema.statics.getActivePackages = async function(businessOwnerId) {
  return await this.find({ 
    businessOwner: businessOwnerId, 
    isActive: true 
  })
    .populate('vehicles', 'make model year type pricePerDay images')
    .sort({ createdAt: -1 });
};

// Instance method to toggle status
packageSchema.methods.toggleStatus = function() {
  this.isActive = !this.isActive;
  return this.save();
};

// Instance method to add vehicle to package
packageSchema.methods.addVehicle = async function(vehicleId) {
  if (!this.vehicles.includes(vehicleId)) {
    this.vehicles.push(vehicleId);
    return await this.save();
  }
  return this;
};

// Instance method to remove vehicle from package
packageSchema.methods.removeVehicle = async function(vehicleId) {
  this.vehicles = this.vehicles.filter(id => id.toString() !== vehicleId.toString());
  return await this.save();
};

// Instance method to add feature to package
packageSchema.methods.addFeature = function(feature) {
  if (!this.features.includes(feature)) {
    this.features.push(feature);
  }
  return this;
};

// Instance method to remove feature from package
packageSchema.methods.removeFeature = function(feature) {
  this.features = this.features.filter(f => f !== feature);
  return this;
};

// Transform JSON output
packageSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    delete ret.__v;
    return ret;
  }
});

const Package = mongoose.model('Package', packageSchema);

module.exports = Package;
