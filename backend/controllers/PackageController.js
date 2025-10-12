const Package = require('../models/PackageModel');
const { Vehicle } = require('../models/VehicleModel');
const { BusinessOwner } = require('../models/BusinessOwnerModel');

// Create a new package
const createPackage = async (req, res) => {
  try {
    const { name, duration, price, discount, vehicles, features, businessOwner } = req.body;

    // Validate required fields
    if (!name || !duration || !price || !businessOwner) {
      return res.status(400).json({
        success: false,
        message: 'Name, duration, price, and business owner are required'
      });
    }

    // Check if business owner exists
    const businessOwnerExists = await BusinessOwner.findById(businessOwner);
    if (!businessOwnerExists) {
      return res.status(404).json({
        success: false,
        message: 'Business owner not found'
      });
    }

    // Validate vehicles exist and are available
    if (vehicles && vehicles.length > 0) {
      const existingVehicles = await Vehicle.find({
        _id: { $in: vehicles },
        status: 'available',
        'availability.isAvailable': true
      });

      if (existingVehicles.length !== vehicles.length) {
        return res.status(400).json({
          success: false,
          message: 'Some vehicles are not available for rental'
        });
      }
    }

    // Check if package name already exists for this business owner
    const existingPackage = await Package.findOne({
      name: name,
      businessOwner: businessOwner
    });

    if (existingPackage) {
      return res.status(400).json({
        success: false,
        message: 'A package with this name already exists for this business owner'
      });
    }

    // Create new package
    const newPackage = new Package({
      name,
      duration,
      price: parseFloat(price),
      discount: discount || 0,
      vehicles: vehicles || [],
      features: features || [],
      businessOwner
    });

    const savedPackage = await newPackage.save();
    await savedPackage.populate('vehicles', 'make model year type pricePerDay images');
    await savedPackage.populate('businessOwner', 'businessName email');

    res.status(201).json({
      success: true,
      message: 'Package created successfully',
      data: savedPackage
    });

  } catch (error) {
    console.error('Error creating package:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get all packages for a business owner
const getPackagesByBusinessOwner = async (req, res) => {
  try {
    const { businessOwnerId } = req.params;
    const { isActive } = req.query;

    const options = {};
    if (isActive !== undefined) {
      options.isActive = isActive === 'true';
    }

    const packages = await Package.getPackagesByBusinessOwner(businessOwnerId, options);

    res.status(200).json({
      success: true,
      message: 'Packages retrieved successfully',
      data: packages
    });

  } catch (error) {
    console.error('Error fetching packages:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get a specific package by ID
const getPackageById = async (req, res) => {
  try {
    const { packageId } = req.params;

    const packageData = await Package.findById(packageId)
      .populate('vehicles', 'make model year type pricePerDay images')
      .populate('businessOwner', 'businessName email');

    if (!packageData) {
      return res.status(404).json({
        success: false,
        message: 'Package not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Package retrieved successfully',
      data: packageData
    });

  } catch (error) {
    console.error('Error fetching package:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Update a package
const updatePackage = async (req, res) => {
  try {
    const { packageId } = req.params;
    const updateData = req.body;

    // Find the package
    const packageData = await Package.findById(packageId);
    if (!packageData) {
      return res.status(404).json({
        success: false,
        message: 'Package not found'
      });
    }

    // If updating vehicles, validate they exist and are available
    if (updateData.vehicles && updateData.vehicles.length > 0) {
      const existingVehicles = await Vehicle.find({
        _id: { $in: updateData.vehicles },
        status: 'available',
        'availability.isAvailable': true
      });

      if (existingVehicles.length !== updateData.vehicles.length) {
        return res.status(400).json({
          success: false,
          message: 'Some vehicles are not available for rental'
        });
      }
    }

    // If updating name, check for duplicates
    if (updateData.name && updateData.name !== packageData.name) {
      const existingPackage = await Package.findOne({
        name: updateData.name,
        businessOwner: packageData.businessOwner,
        _id: { $ne: packageId }
      });

      if (existingPackage) {
        return res.status(400).json({
          success: false,
          message: 'A package with this name already exists for this business owner'
        });
      }
    }

    // Update the package
    const updatedPackage = await Package.findByIdAndUpdate(
      packageId,
      { ...updateData, updatedAt: new Date() },
      { new: true, runValidators: true }
    )
      .populate('vehicles', 'make model year type pricePerDay images')
      .populate('businessOwner', 'businessName email');

    res.status(200).json({
      success: true,
      message: 'Package updated successfully',
      data: updatedPackage
    });

  } catch (error) {
    console.error('Error updating package:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Delete a package
const deletePackage = async (req, res) => {
  try {
    const { packageId } = req.params;
    
    console.log('Attempting to delete package with ID:', packageId);

    // Validate packageId format
    if (!packageId || !packageId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid package ID format'
      });
    }

    const packageData = await Package.findById(packageId);
    if (!packageData) {
      console.log('Package not found with ID:', packageId);
      return res.status(404).json({
        success: false,
        message: 'Package not found'
      });
    }

    console.log('Package found, proceeding with deletion:', packageData.name);

    // Note: Package deletion is allowed since packages are not directly linked to bookings in current schema
    // In the future, if packages are linked to bookings, add validation here

    const deletedPackage = await Package.findByIdAndDelete(packageId);
    
    if (!deletedPackage) {
      console.log('Failed to delete package with ID:', packageId);
      return res.status(500).json({
        success: false,
        message: 'Failed to delete package'
      });
    }

    console.log('Package deleted successfully:', deletedPackage.name);

    res.status(200).json({
      success: true,
      message: 'Package deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting package:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Toggle package status (active/inactive)
const togglePackageStatus = async (req, res) => {
  try {
    const { packageId } = req.params;

    const packageData = await Package.findById(packageId);
    if (!packageData) {
      return res.status(404).json({
        success: false,
        message: 'Package not found'
      });
    }

    const updatedPackage = await packageData.toggleStatus();
    await updatedPackage.populate('vehicles', 'make model year type pricePerDay images');
    await updatedPackage.populate('businessOwner', 'businessName email');

    res.status(200).json({
      success: true,
      message: `Package ${updatedPackage.isActive ? 'activated' : 'deactivated'} successfully`,
      data: updatedPackage
    });

  } catch (error) {
    console.error('Error toggling package status:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get available vehicles for package creation
const getAvailableVehicles = async (req, res) => {
  try {
    const { businessOwnerId } = req.params;

    const vehicles = await Vehicle.find({
      businessOwner: businessOwnerId,
      isActive: true,
      status: 'approved'
    }).select('make model year type pricePerDay images');

    res.status(200).json({
      success: true,
      message: 'Available vehicles retrieved successfully',
      data: vehicles
    });

  } catch (error) {
    console.error('Error fetching available vehicles:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get package statistics for business owner
const getPackageStats = async (req, res) => {
  try {
    const { businessOwnerId } = req.params;

    const stats = await Package.aggregate([
      { $match: { businessOwner: businessOwnerId } },
      {
        $group: {
          _id: null,
          totalPackages: { $sum: 1 },
          activePackages: {
            $sum: { $cond: [{ $eq: ['$isActive', true] }, 1, 0] }
          },
          inactivePackages: {
            $sum: { $cond: [{ $eq: ['$isActive', false] }, 1, 0] }
          },
          averagePrice: { $avg: '$price' },
          totalRevenue: { $sum: '$price' }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      message: 'Package statistics retrieved successfully',
      data: stats[0] || {
        totalPackages: 0,
        activePackages: 0,
        inactivePackages: 0,
        averagePrice: 0,
        totalRevenue: 0
      }
    });

  } catch (error) {
    console.error('Error fetching package statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

module.exports = {
  createPackage,
  getPackagesByBusinessOwner,
  getPackageById,
  updatePackage,
  deletePackage,
  togglePackageStatus,
  getAvailableVehicles,
  getPackageStats
};
