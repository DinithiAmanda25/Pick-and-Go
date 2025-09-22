const { Admin } = require('../models/AdminModel');
const { uploadToCloudinary } = require('../middleware/cloudinaryUpload'); // Import Cloudinary upload middleware

// Admin Login
const adminLogin = async (req, res) => { // Admin login function
    try {
        console.log('Admin login attempt received');
        console.log('Request body:', req.body);

        const { identifier, password } = req.body;

        if (!identifier || !password) {
            console.log('Missing credentials');
            return res.status(400).json({
                success: false,
                message: 'Please provide username/email and password'
            });
        }

        // Find admin by email or username
        const admin = await Admin.findOne({
            $or: [
                { email: identifier, isActive: true },
                { username: identifier, isActive: true }
            ]
        });

        if (!admin) {
            return res.status(401).json({ // Unauthorized
                success: false, 
                message: 'Invalid credentials'
            });
        }

        // Simple password check (no bcrypt for now)
        if (admin.password !== password) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Prepare admin data (excluding password)
        const adminData = {
            id: admin._id,
            email: admin.email,
            username: admin.username,
            fullName: admin.fullName,
            role: admin.role,
            createdAt: admin.createdAt
        };

        res.status(200).json({
            success: true,
            message: 'Admin login successful',
            user: adminData,
            dashboardRoute: '/admin/dashboard'
        });

    } catch (error) {
        console.error('Admin login error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error. Please try again later.'
        });
    }
};

// Get Admin Profile
const getAdminProfile = async (req, res) => {
    try {
        const { userId } = req.params; // Get userId from request parameters

        const admin = await Admin.findById(userId).select('-password');
        if (!admin) {
            return res.status(404).json({
                success: false,
                message: 'Admin not found'
            });
        }

        res.status(200).json({
            success: true,
            admin: admin
        });
    } catch (error) {
        console.error('Get admin profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error. Please try again later.'
        });
    }
};

// Update Admin Profile
const updateAdminProfile = async (req, res) => {
    try {
        const { userId } = req.params;
        const { fullName, username, email } = req.body;

        // Check if admin exists
        const admin = await Admin.findById(userId);
        if (!admin) {
            return res.status(404).json({
                success: false,
                message: 'Admin not found'
            });
        }

        // Check for duplicate username or email if changed
        if (username !== admin.username) {
            const existingUsername = await Admin.findOne({ username, _id: { $ne: userId } });
            if (existingUsername) {
                return res.status(400).json({
                    success: false,
                    message: 'Username already exists'
                });
            }
        }

        if (email !== admin.email) {
            const existingEmail = await Admin.findOne({ email, _id: { $ne: userId } });
            if (existingEmail) {
                return res.status(400).json({
                    success: false,
                    message: 'Email already exists'
                });
            }
        }

        // Update admin
        const updatedAdmin = await Admin.findByIdAndUpdate(
            userId,
            {
                fullName,
                username,
                email,
                updatedAt: new Date()
            },
            { new: true }
        ).select('-password'); // Exclude password from response

        res.status(200).json({
            success: true,
            message: 'Admin profile updated successfully',
            admin: updatedAdmin
        });

    } catch (error) {
        console.error('Update admin profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error. Please try again later.'
        });
    }
};

// Change Admin Password
const changeAdminPassword = async (req, res) => {
    try {
        const { userId } = req.params;
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Please provide current and new password'
            });
        }

        const admin = await Admin.findById(userId);
        if (!admin) {
            return res.status(404).json({
                success: false,
                message: 'Admin not found'
            });
        }

        // Check current password
        if (admin.password !== currentPassword) {
            return res.status(400).json({
                success: false,
                message: 'Current password is incorrect'
            });
        }

        // Update password
        admin.password = newPassword;
        admin.updatedAt = new Date();
        await admin.save();

        res.status(200).json({
            success: true,
            message: 'Password changed successfully'
        });

    } catch (error) {
        console.error('Change admin password error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error. Please try again later.'
        });
    }
};

module.exports = {
    adminLogin,
    getAdminProfile,
    updateAdminProfile,
    changeAdminPassword
};
