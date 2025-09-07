const { BusinessOwner } = require('../models/BusinessOwnerModel');
const { uploadToCloudinary } = require('../middleware/cloudinaryUpload');

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

module.exports = {
    registerBusinessOwner,
    businessOwnerLogin,
    getBusinessOwnerProfile,
    updateBusinessOwnerProfile,
    uploadBusinessOwnerProfileImage,
    changeBusinessOwnerPassword,
    deleteBusinessOwnerProfile
};
