const { BusinessOwner } = require('../models/BusinessOwnerModel');
const { Driver } = require('../models/DriverModel');
const { Vehicle } = require('../models/VehicleModel');
const { uploadToCloudinary } = require('../middleware/cloudinaryUpload');
const emailService = require('../services/emailService');
const bcrypt = require('bcrypt');

// Register Business Owner
const registerBusinessOwner = async (req, res) => {
    try {
        const {
            username,
            email,
            password,
            businessName,
            contactNumber,
            ownerName,
            businessType,
            businessAddress,
            businessLicense,
            taxId,
            website,
            description
        } = req.body;

        // Check if business owner already exists
        const existingBusinessOwner = await BusinessOwner.findOne({
            $or: [{ email }, { username }]
        });

        if (existingBusinessOwner) {
            return res.status(400).json({
                success: false,
                message: 'Email or username already registered'
            });
        }

        // Create new business owner
        const businessOwner = new BusinessOwner({
            username,
            email,
            password,
            role: 'business_owner',
            businessName,
            contactNumber,
            ownerName,
            businessType,
            businessAddress,
            businessLicense,
            taxId,
            website,
            description
        });

        await businessOwner.save();

        // Return business owner data (excluding password)
        const businessOwnerData = businessOwner.toObject();
        delete businessOwnerData.password;

        res.status(201).json({
            success: true,
            message: 'Business owner registered successfully',
            businessOwner: businessOwnerData
        });

    } catch (error) {
        console.error('Register business owner error:', error);
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Email or username already exists'
            });
        }
        res.status(500).json({
            success: false,
            message: 'Server error. Please try again later.'
        });
    }
};

// Business Owner Login
const businessOwnerLogin = async (req, res) => {
    try {
        const { identifier, password } = req.body;

        if (!identifier || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide username/email and password'
            });
        }

        // Find business owner by email or username
        const businessOwner = await BusinessOwner.findOne({
            $or: [
                { email: identifier, isActive: true },
                { username: identifier, isActive: true }
            ]
        });

        if (!businessOwner) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Simple password check
        if (businessOwner.password !== password) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Prepare business owner data (excluding password)
        const businessOwnerData = {
            id: businessOwner._id,
            email: businessOwner.email,
            username: businessOwner.username,
            businessName: businessOwner.businessName,
            contactNumber: businessOwner.contactNumber,
            ownerName: businessOwner.ownerName,
            businessType: businessOwner.businessType,
            businessAddress: businessOwner.businessAddress,
            businessLicense: businessOwner.businessLicense,
            taxId: businessOwner.taxId,
            website: businessOwner.website,
            description: businessOwner.description,
            role: businessOwner.role,
            createdAt: businessOwner.createdAt
        };

        res.status(200).json({
            success: true,
            message: 'Login successful',
            user: businessOwnerData,
            dashboardRoute: '/business-owner/dashboard'
        });

    } catch (error) {
        console.error('Business owner login error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error. Please try again later.'
        });
    }
};

// Get Business Owner Profile
const getBusinessOwnerProfile = async (req, res) => {
    try {
        const { userId } = req.params;

        const businessOwner = await BusinessOwner.findById(userId).select('-password');
        if (!businessOwner) {
            return res.status(404).json({
                success: false,
                message: 'Business owner not found'
            });
        }

        res.status(200).json({
            success: true,
            businessOwner: businessOwner
        });
    } catch (error) {
        console.error('Get business owner profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error. Please try again later.'
        });
    }
};

// Update Business Owner Profile
const updateBusinessOwnerProfile = async (req, res) => {
    try {
        const { userId } = req.params;
        const {
            username,
            email,
            businessName,
            contactNumber,
            ownerName,
            businessType,
            businessAddress,
            businessLicense,
            taxId,
            website,
            description
        } = req.body;

        // Check if business owner exists
        const businessOwner = await BusinessOwner.findById(userId);
        if (!businessOwner) {
            return res.status(404).json({
                success: false,
                message: 'Business owner not found'
            });
        }

        // Check for duplicates if changed
        if (username !== businessOwner.username) {
            const existingUsername = await BusinessOwner.findOne({ username, _id: { $ne: userId } });
            if (existingUsername) {
                return res.status(400).json({
                    success: false,
                    message: 'Username already exists'
                });
            }
        }

        if (email !== businessOwner.email) {
            const existingEmail = await BusinessOwner.findOne({ email, _id: { $ne: userId } });
            if (existingEmail) {
                return res.status(400).json({
                    success: false,
                    message: 'Email already exists'
                });
            }
        }

        // Update business owner
        const updatedBusinessOwner = await BusinessOwner.findByIdAndUpdate(
            userId,
            {
                username,
                email,
                businessName,
                contactNumber,
                ownerName,
                businessType,
                businessAddress,
                businessLicense,
                taxId,
                website,
                description,
                updatedAt: new Date()
            },
            { new: true }
        ).select('-password');

        res.status(200).json({
            success: true,
            message: 'Business owner profile updated successfully',
            businessOwner: updatedBusinessOwner
        });

    } catch (error) {
        console.error('Update business owner profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error. Please try again later.'
        });
    }
};

// Upload Business Owner Profile Image
const uploadBusinessOwnerProfileImage = async (req, res) => {
    try {
        const { userId } = req.params;

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No image file provided'
            });
        }

        const businessOwner = await BusinessOwner.findById(userId);
        if (!businessOwner) {
            return res.status(404).json({
                success: false,
                message: 'Business owner not found'
            });
        }

        // Delete old profile image if exists
        if (businessOwner.profileImage && businessOwner.profileImage.publicId) {
            // Add cloudinary deletion logic here if needed
        }

        // Update profile image
        businessOwner.profileImage = {
            url: req.file.path,
            publicId: req.file.filename,
            uploadedAt: new Date()
        };
        businessOwner.updatedAt = new Date();

        await businessOwner.save();

        res.status(200).json({
            success: true,
            message: 'Profile image uploaded successfully',
            profileImage: businessOwner.profileImage
        });

    } catch (error) {
        console.error('Upload business owner profile image error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error. Please try again later.'
        });
    }
};

// Change Business Owner Password
const changeBusinessOwnerPassword = async (req, res) => {
    try {
        const { userId } = req.params;
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Please provide current and new password'
            });
        }

        const businessOwner = await BusinessOwner.findById(userId);
        if (!businessOwner) {
            return res.status(404).json({
                success: false,
                message: 'Business owner not found'
            });
        }

        // Check current password
        if (businessOwner.password !== currentPassword) {
            return res.status(400).json({
                success: false,
                message: 'Current password is incorrect'
            });
        }

        // Update password
        businessOwner.password = newPassword;
        businessOwner.updatedAt = new Date();
        await businessOwner.save();

        res.status(200).json({
            success: true,
            message: 'Password changed successfully'
        });

    } catch (error) {
        console.error('Change business owner password error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error. Please try again later.'
        });
    }
};

// Delete Business Owner Profile
const deleteBusinessOwnerProfile = async (req, res) => {
    try {
        const { userId } = req.params;

        const businessOwner = await BusinessOwner.findById(userId);
        if (!businessOwner) {
            return res.status(404).json({
                success: false,
                message: 'Business owner not found'
            });
        }

        // Set as inactive instead of deleting
        businessOwner.isActive = false;
        businessOwner.updatedAt = new Date();
        await businessOwner.save();

        res.status(200).json({
            success: true,
            message: 'Business owner profile deleted successfully'
        });

    } catch (error) {
        console.error('Delete business owner profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error. Please try again later.'
        });
    }
};

// ==================== PENDING APPLICATIONS MANAGEMENT ====================

// Get All Pending Applications (Both Drivers and Vehicles)
const getPendingApplications = async (req, res) => {
    try {
        // Get pending drivers
        const pendingDrivers = await Driver.find({
            status: 'pending',
            isActive: true
        }).select('-password').sort({ createdAt: -1 });

        // Get pending vehicles with owner info
        const pendingVehicles = await Vehicle.find({ 
            status: 'pending' 
        })
        .populate('ownerId', 'firstName lastName email phone rating')
        .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: {
                drivers: {
                    applications: pendingDrivers,
                    count: pendingDrivers.length
                },
                vehicles: {
                    applications: pendingVehicles,
                    count: pendingVehicles.length
                },
                totalPending: pendingDrivers.length + pendingVehicles.length
            }
        });

    } catch (error) {
        console.error('Get pending applications error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error. Please try again later.'
        });
    }
};

// Get Pending Drivers Only
const getPendingDrivers = async (req, res) => {
    try {
        const pendingDrivers = await Driver.find({
            status: 'pending',
            isActive: true
        }).select('-password').sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            drivers: pendingDrivers,
            count: pendingDrivers.length
        });

    } catch (error) {
        console.error('Get pending drivers error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error. Please try again later.'
        });
    }
};

// Get Pending Vehicles Only
const getPendingVehicles = async (req, res) => {
    try {
        const pendingVehicles = await Vehicle.find({ 
            status: 'pending' 
        })
        .populate('ownerId', 'firstName lastName email phone rating')
        .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            vehicles: pendingVehicles,
            count: pendingVehicles.length
        });

    } catch (error) {
        console.error('Get pending vehicles error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error. Please try again later.'
        });
    }
};

// Approve Driver by Business Owner
const approveDriver = async (req, res) => {
    try {
        const { businessOwnerId, driverId } = req.params;
        const { status, newPassword, approvalNotes } = req.body;

        // Validate business owner exists
        const businessOwner = await BusinessOwner.findById(businessOwnerId);
        if (!businessOwner) {
            return res.status(404).json({
                success: false,
                message: 'Business owner not found'
            });
        }

        if (!['approved', 'rejected'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status. Must be approved or rejected.'
            });
        }

        // Find the driver
        const existingDriver = await Driver.findById(driverId).select('-password');
        if (!existingDriver) {
            return res.status(404).json({
                success: false,
                message: 'Driver not found'
            });
        }

        if (existingDriver.status !== 'pending') {
            return res.status(400).json({
                success: false,
                message: 'Driver is not in pending status'
            });
        }

        let updateData = {
            status,
            updatedAt: new Date(),
            approvalDetails: {
                approvedBy: businessOwnerId,
                approvedAt: new Date(),
                approvalNotes: approvalNotes || ''
            }
        };

        // Add rejection reason if status is rejected
        if (status === 'rejected') {
            updateData.approvalDetails.rejectionReason = req.body.rejectionReason || 'No reason provided';
        }

        // If approving and a new password is provided, hash and update it
        if (status === 'approved' && newPassword) {
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
            updateData.password = hashedPassword;
        }

        // Update the driver status
        const driver = await Driver.findByIdAndUpdate(
            driverId,
            updateData,
            { new: true }
        ).select('-password');

        // Prepare email data
        const emailData = {
            fullName: driver.fullName,
            email: driver.email,
            status: status,
            businessName: businessOwner.businessName,
            approvalNotes: approvalNotes || ''
        };

        let credentials = null;
        if (status === 'approved') {
            // Generate temporary password if not provided
            const tempPassword = newPassword || `PnG${Math.random().toString(36).slice(-8)}`;

            // Update password if we generated a new one
            if (!newPassword) {
                const saltRounds = 10;
                const hashedPassword = await bcrypt.hash(tempPassword, saltRounds);
                await Driver.findByIdAndUpdate(driverId, { password: hashedPassword });
            }

            credentials = {
                email: driver.email,
                password: newPassword || tempPassword
            };
        }

        // Send email notification
        try {
            await emailService.sendDriverApprovalEmail(emailData, credentials);
            console.log(`Driver ${status} email sent successfully to ${driver.email}`);
        } catch (emailError) {
            console.error('Failed to send email:', emailError.message);
            // Continue with the response even if email fails
        }

        res.status(200).json({
            success: true,
            message: `Driver ${status} successfully by ${businessOwner.businessName}. ${status === 'approved' ? 'Login credentials sent to driver email.' : 'Notification sent to driver.'}`,
            driver: driver,
            approvedBy: {
                id: businessOwner._id,
                businessName: businessOwner.businessName,
                ownerName: businessOwner.ownerName
            }
        });

    } catch (error) {
        console.error('Approve driver error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error. Please try again later.'
        });
    }
};

// Approve Vehicle by Business Owner
const approveVehicle = async (req, res) => {
    try {
        const { businessOwnerId, vehicleId } = req.params;
        const { status, dailyRate, weeklyRate, monthlyRate, approvalNotes, rejectionReason } = req.body;

        // Validate business owner exists
        const businessOwner = await BusinessOwner.findById(businessOwnerId);
        if (!businessOwner) {
            return res.status(404).json({
                success: false,
                message: 'Business owner not found'
            });
        }

        if (!['approved', 'rejected'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status. Must be approved or rejected.'
            });
        }

        const vehicle = await Vehicle.findById(vehicleId).populate('ownerId', 'firstName lastName email');
        if (!vehicle) {
            return res.status(404).json({
                success: false,
                message: 'Vehicle not found'
            });
        }

        if (vehicle.status !== 'pending') {
            return res.status(400).json({
                success: false,
                message: 'Vehicle is not pending approval'
            });
        }

        if (status === 'approved') {
            // Update vehicle with approval details
            vehicle.status = 'available';
            vehicle.availability = { isAvailable: true };
            
            // Set rental prices if provided
            if (dailyRate !== undefined) vehicle.rentalPrice.dailyRate = dailyRate;
            if (weeklyRate !== undefined) vehicle.rentalPrice.weeklyRate = weeklyRate;
            if (monthlyRate !== undefined) vehicle.rentalPrice.monthlyRate = monthlyRate;
            
            vehicle.approvalDetails = {
                approvedBy: businessOwnerId,
                approvedAt: new Date(),
                approvalNotes: approvalNotes || ''
            };
        } else {
            // Reject vehicle
            vehicle.status = 'rejected';
            vehicle.approvalDetails = {
                approvedBy: businessOwnerId,
                approvedAt: new Date(),
                rejectionReason: rejectionReason || 'No reason provided',
                approvalNotes: approvalNotes || ''
            };
        }

        await vehicle.save();

        // Send email notification to vehicle owner
        const emailData = {
            ownerName: vehicle.ownerId.firstName + ' ' + vehicle.ownerId.lastName,
            email: vehicle.ownerId.email,
            vehicleInfo: `${vehicle.make} ${vehicle.model} (${vehicle.licensePlate})`,
            status: status,
            businessName: businessOwner.businessName,
            approvalNotes: approvalNotes || '',
            rejectionReason: rejectionReason || ''
        };

        try {
            // You'll need to create this email service function
            await emailService.sendVehicleApprovalEmail(emailData);
            console.log(`Vehicle ${status} email sent successfully to ${vehicle.ownerId.email}`);
        } catch (emailError) {
            console.error('Failed to send vehicle approval email:', emailError.message);
            // Continue with the response even if email fails
        }

        res.status(200).json({
            success: true,
            message: `Vehicle ${status} successfully by ${businessOwner.businessName}`,
            vehicle: vehicle,
            approvedBy: {
                id: businessOwner._id,
                businessName: businessOwner.businessName,
                ownerName: businessOwner.ownerName
            }
        });

    } catch (error) {
        console.error('Approve vehicle error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error. Please try again later.'
        });
    }
};

// Get Approval Statistics for Business Owner Dashboard
const getApprovalStatistics = async (req, res) => {
    try {
        const { businessOwnerId } = req.params;

        // Verify business owner exists
        const businessOwner = await BusinessOwner.findById(businessOwnerId);
        if (!businessOwner) {
            return res.status(404).json({
                success: false,
                message: 'Business owner not found'
            });
        }

        // Get statistics
        const [
            totalPendingDrivers,
            totalPendingVehicles,
            totalApprovedDrivers,
            totalApprovedVehicles,
            totalRejectedDrivers,
            totalRejectedVehicles,
            driversApprovedByMe,
            vehiclesApprovedByMe
        ] = await Promise.all([
            Driver.countDocuments({ status: 'pending', isActive: true }),
            Vehicle.countDocuments({ status: 'pending' }),
            Driver.countDocuments({ status: 'approved', isActive: true }),
            Vehicle.countDocuments({ status: 'approved' }),
            Driver.countDocuments({ status: 'rejected', isActive: true }),
            Vehicle.countDocuments({ status: 'rejected' }),
            Driver.countDocuments({ status: 'approved', 'approvalDetails.approvedBy': businessOwnerId }),
            Vehicle.countDocuments({ status: 'approved', 'approvalDetails.approvedBy': businessOwnerId })
        ]);

        const statistics = {
            pending: {
                drivers: totalPendingDrivers,
                vehicles: totalPendingVehicles,
                total: totalPendingDrivers + totalPendingVehicles
            },
            approved: {
                drivers: totalApprovedDrivers,
                vehicles: totalApprovedVehicles,
                total: totalApprovedDrivers + totalApprovedVehicles
            },
            rejected: {
                drivers: totalRejectedDrivers,
                vehicles: totalRejectedVehicles,
                total: totalRejectedDrivers + totalRejectedVehicles
            },
            myApprovals: {
                drivers: driversApprovedByMe,
                vehicles: vehiclesApprovedByMe,
                total: driversApprovedByMe + vehiclesApprovedByMe
            }
        };

        res.status(200).json({
            success: true,
            statistics,
            businessOwner: {
                id: businessOwner._id,
                businessName: businessOwner.businessName,
                ownerName: businessOwner.ownerName
            }
        });

    } catch (error) {
        console.error('Get approval statistics error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error. Please try again later.'
        });
    }
};

module.exports = {
    registerBusinessOwner,
    businessOwnerLogin,
    getBusinessOwnerProfile,
    updateBusinessOwnerProfile,
    uploadBusinessOwnerProfileImage,
    changeBusinessOwnerPassword,
    deleteBusinessOwnerProfile,
    // Pending Applications Management
    getPendingApplications,
    getPendingDrivers,
    getPendingVehicles,
    approveDriver,
    approveVehicle,
    getApprovalStatistics
};
