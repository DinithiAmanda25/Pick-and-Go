const { Driver } = require('../models/DriverModel');
const { uploadToCloudinary } = require('../middleware/cloudinaryUpload');

// Register Driver (through onboarding)
const registerDriver = async (req, res) => {
    try {
        console.log('Driver registration request received');
        console.log('Request body:', req.body);
        console.log('Request files:', req.files);

        const {
            driverId,
            fullName,
            email,
            phone,
            password,
            address,
            dateOfBirth,
            emergencyContact,
            vehicleType,
            vehicleModel,
            vehiclePlateNumber,
            vehicleColor,
            vehicleYear,
            licenseNumber,
            licenseExpiryDate,
            yearsOfExperience
        } = req.body;

        // Validate required fields (only basic info needed for application)
        if (!fullName || !email || !phone) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields'
            });
        }

        // Generate driverId if not provided (for onboarding applications)
        const finalDriverId = driverId || `DRV${Date.now()}`;

        // Generate temporary password if not provided (will be reset when approved)
        const finalPassword = password || `temp${Date.now()}`;

        // Check if driver already exists
        const existingDriver = await Driver.findOne({
            $or: [{ email }, { driverId: finalDriverId }]
        });

        if (existingDriver) {
            return res.status(400).json({
                success: false,
                message: 'Email or driver ID already registered'
            });
        }

        // Parse address and emergencyContact if they are JSON strings
        let parsedAddress = address;
        let parsedEmergencyContact = emergencyContact;

        try {
            if (typeof address === 'string') {
                parsedAddress = JSON.parse(address);
            }
        } catch (error) {
            console.warn('Could not parse address:', address);
        }

        try {
            if (typeof emergencyContact === 'string') {
                parsedEmergencyContact = JSON.parse(emergencyContact);
            }
        } catch (error) {
            console.warn('Could not parse emergencyContact:', emergencyContact);
        }

        // Map frontend vehicle types to backend enum values
        const vehicleTypeMapping = {
            'Car': 'car',
            'SUV': 'car',           // SUV maps to car
            'Van': 'van',
            'Pickup Truck': 'truck', // Pickup Truck maps to truck
            'Motorcycle': 'motorcycle',
            'Three Wheeler': 'motorcycle', // Three Wheeler maps to motorcycle
            'Mini Bus': 'van',       // Mini Bus maps to van
            'Other': 'car'           // Other defaults to car
        };

        const mappedVehicleType = vehicleTypeMapping[vehicleType] || 'car';

        // Handle file uploads
        const documents = {};
        if (req.files) {
            // Process each document type
            const documentTypes = ['license', 'identityCard', 'insurance', 'registration', 'medicalCertificate'];

            for (const docType of documentTypes) {
                if (req.files[docType] && req.files[docType][0]) {
                    const file = req.files[docType][0];
                    documents[docType] = {
                        url: file.path,
                        publicId: file.filename,
                        uploadedAt: new Date()
                    };
                }
            }
        }

        // Create new driver user
        const driver = new Driver({
            driverId: finalDriverId,
            fullName,
            email,
            phone,
            password: finalPassword,
            role: 'driver',
            address: parsedAddress,
            dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
            emergencyContact: parsedEmergencyContact,
            vehicleInfo: {
                type: mappedVehicleType,
                model: vehicleModel || null,
                plateNumber: vehiclePlateNumber || null,
                color: vehicleColor || null,
                year: vehicleYear ? parseInt(vehicleYear) : null
            },
            documents,
            status: 'pending' // Drivers need approval
        });

        await driver.save();

        // Return driver data (excluding password)
        const driverData = driver.toObject();
        delete driverData.password;

        console.log('Driver registered successfully:', driverData);

        res.status(201).json({
            success: true,
            message: 'Driver registration submitted successfully. Please wait for approval.',
            driver: driverData
        });

    } catch (error) {
        console.error('Register driver error:', error);
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Email or driver ID already exists'
            });
        }
        res.status(500).json({
            success: false,
            message: 'Server error. Please try again later.'
        });
    }
};

// Driver Login
const driverLogin = async (req, res) => {
    try {
        const { identifier, password } = req.body;

        if (!identifier || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email and password'
            });
        }

        // Find driver by email
        const driver = await Driver.findOne({ email: identifier, isActive: true });

        if (!driver) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Simple password check
        if (driver.password !== password) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Check if driver is approved
        if (driver.status !== 'approved') {
            return res.status(401).json({
                success: false,
                message: 'Your account is pending approval. Please contact support.'
            });
        }

        // Prepare driver data (excluding password)
        const driverData = {
            id: driver._id,
            driverId: driver.driverId,
            fullName: driver.fullName,
            email: driver.email,
            phone: driver.phone,
            status: driver.status,
            role: driver.role,
            createdAt: driver.createdAt
        };

        res.status(200).json({
            success: true,
            message: 'Login successful',
            user: driverData,
            dashboardRoute: '/driver/dashboard'
        });

    } catch (error) {
        console.error('Driver login error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error. Please try again later.'
        });
    }
};

// Get Driver Profile
const getDriverProfile = async (req, res) => {
    try {
        const { userId } = req.params;

        const driver = await Driver.findById(userId).select('-password');
        if (!driver) {
            return res.status(404).json({
                success: false,
                message: 'Driver not found'
            });
        }

        res.status(200).json({
            success: true,
            driver: driver
        });
    } catch (error) {
        console.error('Get driver profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error. Please try again later.'
        });
    }
};

// Update Driver Profile
const updateDriverProfile = async (req, res) => {
    try {
        const { userId } = req.params;
        const {
            fullName,
            phone,
            address,
            emergencyContact,
            vehicleType,
            vehicleModel,
            vehiclePlateNumber,
            vehicleColor,
            vehicleYear
        } = req.body;

        const driver = await Driver.findById(userId);
        if (!driver) {
            return res.status(404).json({
                success: false,
                message: 'Driver not found'
            });
        }

        // Update driver
        const updatedDriver = await Driver.findByIdAndUpdate(
            userId,
            {
                fullName,
                phone,
                address,
                emergencyContact,
                vehicleInfo: {
                    type: vehicleType,
                    model: vehicleModel,
                    plateNumber: vehiclePlateNumber,
                    color: vehicleColor,
                    year: vehicleYear
                },
                updatedAt: new Date()
            },
            { new: true }
        ).select('-password');

        res.status(200).json({
            success: true,
            message: 'Driver profile updated successfully',
            driver: updatedDriver
        });

    } catch (error) {
        console.error('Update driver profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error. Please try again later.'
        });
    }
};

// Approve Driver (Admin function)
const approveDriver = async (req, res) => {
    try {
        const { driverId } = req.params;
        const { status } = req.body; // 'approved' or 'rejected'

        if (!['approved', 'rejected'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status. Must be approved or rejected.'
            });
        }

        const driver = await Driver.findByIdAndUpdate(
            driverId,
            {
                status,
                updatedAt: new Date()
            },
            { new: true }
        ).select('-password');

        if (!driver) {
            return res.status(404).json({
                success: false,
                message: 'Driver not found'
            });
        }

        res.status(200).json({
            success: true,
            message: `Driver ${status} successfully`,
            driver: driver
        });

    } catch (error) {
        console.error('Approve driver error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error. Please try again later.'
        });
    }
};

// Get Pending Drivers (Admin function)
const getPendingDrivers = async (req, res) => {
    try {
        const pendingDrivers = await Driver.find({
            status: 'pending',
            isActive: true
        }).select('-password');

        res.status(200).json({
            success: true,
            drivers: pendingDrivers
        });

    } catch (error) {
        console.error('Get pending drivers error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error. Please try again later.'
        });
    }
};

// Get All Drivers (Admin function)
const getAllDrivers = async (req, res) => {
    try {
        const drivers = await Driver.find({ isActive: true }).select('-password');

        res.status(200).json({
            success: true,
            drivers: drivers
        });

    } catch (error) {
        console.error('Get all drivers error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error. Please try again later.'
        });
    }
};

// Change Driver Password
const changeDriverPassword = async (req, res) => {
    try {
        const { userId } = req.params;
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Please provide current and new password'
            });
        }

        const driver = await Driver.findById(userId);
        if (!driver) {
            return res.status(404).json({
                success: false,
                message: 'Driver not found'
            });
        }

        // Check current password
        if (driver.password !== currentPassword) {
            return res.status(400).json({
                success: false,
                message: 'Current password is incorrect'
            });
        }

        // Update password
        driver.password = newPassword;
        driver.updatedAt = new Date();
        await driver.save();

        res.status(200).json({
            success: true,
            message: 'Password changed successfully'
        });

    } catch (error) {
        console.error('Change driver password error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error. Please try again later.'
        });
    }
};

module.exports = {
    registerDriver,
    driverLogin,
    getDriverProfile,
    updateDriverProfile,
    approveDriver,
    getPendingDrivers,
    getAllDrivers,
    changeDriverPassword
};
