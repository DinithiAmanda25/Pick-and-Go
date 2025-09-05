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
  // Additional profile fields
  ownerName: {
    type: String,
    required: false
  },
  businessType: {
    type: String,
    required: false
  },
  businessAddress: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: { type: String, default: 'Sri Lanka' }
  },
  businessLicense: {
    type: String,
    required: false
  },
  taxId: {
    type: String,
    required: false
  },
  website: {
    type: String,
    required: false
  },
  description: {
    type: String,
    required: false
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
  dateOfBirth: {
    type: Date
  },
  licenseNumber: {
    type: String,
    required: true
  },
  licenseExpiryDate: {
    type: Date
  },
  vehicleType: {
    type: String,
    required: true
  },
  yearsOfExperience: {
    type: Number,
    default: 0
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: { type: String, default: 'Sri Lanka' }
  },
  emergencyContact: {
    name: String,
    phone: String,
    relationship: String
  },
  // Override the documents field from baseUserSchema with explicit definition
  documents: [{
    type: { type: String, required: true }, // e.g., 'license', 'identityCard', 'insurance'
    url: { type: String, required: true },
    publicId: { type: String, required: true },
    uploadedAt: { type: Date, default: Date.now }
  }],
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

// Create a unified User schema that can handle all user types
const unifiedUserSchema = new mongoose.Schema({
  ...baseUserSchema,

  // Common fields for all users
  fullName: { type: String },
  phone: { type: String },
  dateOfBirth: { type: Date },

  // Admin specific
  username: { type: String, sparse: true },

  // Business Owner specific
  businessName: { type: String },
  contactNumber: { type: String },

  // Driver specific
  driverId: { type: String, sparse: true },
  licenseNumber: { type: String },
  licenseExpiryDate: { type: Date },
  vehicleType: { type: String },
  yearsOfExperience: { type: Number },
  address: {
    street: { type: String },
    city: { type: String },
    state: { type: String },
    zipCode: { type: String },
    country: { type: String, default: 'Sri Lanka' }
  },
  emergencyContact: {
    name: { type: String },
    phone: { type: String },
    relationship: { type: String }
  },
  documents: {
    license: {
      filename: String,
      originalName: String,
      path: String,
      size: Number,
      mimetype: String,
      uploadDate: Date
    },
    identityCard: {
      filename: String,
      originalName: String,
      path: String,
      size: Number,
      mimetype: String,
      uploadDate: Date
    },
    insurance: {
      filename: String,
      originalName: String,
      path: String,
      size: Number,
      mimetype: String,
      uploadDate: Date
    },
    registration: {
      filename: String,
      originalName: String,
      path: String,
      size: Number,
      mimetype: String,
      uploadDate: Date
    },
    medicalCertificate: {
      filename: String,
      originalName: String,
      path: String,
      size: Number,
      mimetype: String,
      uploadDate: Date
    }
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  approvedAt: { type: Date },

  // Client specific
  firstName: { type: String },
  lastName: { type: String },
  preferences: { type: mongoose.Schema.Types.Mixed }
});

// Create unified User model
const User = mongoose.model('User', unifiedUserSchema);

module.exports = {
  Admin,
  BusinessOwner,
  Driver,
  Client,
  VehicleOwner,
  User  // Export the unified User model
};
