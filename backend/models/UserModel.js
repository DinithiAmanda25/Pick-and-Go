const mongoose = require('mongoose');

// Base User Schema
const baseUserSchema = {
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
    enum: ['admin', 'business_owner', 'driver', 'client', 'vehicle_owner'],
    required: true
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
    type: String, // e.g., 'license', 'registration', 'insurance'
    url: String,
    publicId: String,
    uploadedAt: Date
  }]
};

// Admin Schema (hardcoded credentials)
const adminSchema = new mongoose.Schema({
  ...baseUserSchema,
  username: {
    type: String,
    required: true,
    unique: true
  },
  fullName: {
    type: String,
    required: true
  },
  role: {
    type: String,
    default: 'admin'
  }
});

// Business Owner Schema (hardcoded credentials)
const businessOwnerSchema = new mongoose.Schema({
  ...baseUserSchema,
  username: {
    type: String,
    required: true,
    unique: true
  },
  businessName: {
    type: String,
    required: true
  },
  contactNumber: {
    type: String,
    required: true
  },
  role: {
    type: String,
    default: 'business_owner'
  }
});

// Driver Schema (registration through onboarding)
const driverSchema = new mongoose.Schema({
  ...baseUserSchema,
  driverId: {
    type: String,
    unique: true,
    sparse: true
  },
  fullName: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  licenseNumber: {
    type: String,
    required: true
  },
  vehicleType: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  emergencyContact: {
    name: String,
    phone: String,
    relationship: String
  },
  documents: {
    license: String,
    insurance: String,
    registration: String
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  approvedAt: Date,
  role: {
    type: String,
    default: 'driver'
  }
});

// Client Schema (public registration)
const clientSchema = new mongoose.Schema({
  ...baseUserSchema,
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  dateOfBirth: {
    type: Date,
    required: true
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String
  },
  preferences: {
    vehicleType: [String],
    notifications: {
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: false }
    }
  },
  role: {
    type: String,
    default: 'client'
  }
});

// Vehicle Owner Schema (public registration)
const vehicleOwnerSchema = new mongoose.Schema({
  ...baseUserSchema,
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String
  },
  role: {
    type: String,
    default: 'vehicle_owner'
  }
});

// Create Models
const Admin = mongoose.model('Admin', adminSchema);
const BusinessOwner = mongoose.model('BusinessOwner', businessOwnerSchema);
const Driver = mongoose.model('Driver', driverSchema);
const Client = mongoose.model('Client', clientSchema);
const VehicleOwner = mongoose.model('VehicleOwner', vehicleOwnerSchema);

module.exports = {
  Admin,
  BusinessOwner,
  Driver,
  Client,
  VehicleOwner
};
