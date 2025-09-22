const { Admin } = require('../models/AdminModel');
const { BusinessOwner } = require('../models/BusinessOwnerModel');
const { Driver } = require('../models/DriverModel');
const { Client } = require('../models/ClientModel');
const { VehicleOwner } = require('../models/VehicleOwnerModel');

// Helper function to find user by email and role
const findUserByEmail = async (email, role = null) => { // role can be 'driver', 'client', 'vehicle_owner', 'admin', 'business_owner' or null
    try {
        // Use the appropriate model based on role
        if (role === 'driver') {
            const user = await Driver.findOne({ email, isActive: true });
            return user ? { user, role: 'driver' } : null;
        } else if (role === 'client') {
            const user = await Client.findOne({ email, isActive: true });
            return user ? { user, role: 'client' } : null;
        } else if (role === 'vehicle_owner' || role === 'vehicle-owner') {
            const user = await VehicleOwner.findOne({ email, isActive: true });
            return user ? { user, role: 'vehicle_owner' } : null;
        } else if (role === 'admin') {
            const user = await Admin.findOne({ email, isActive: true });
            return user ? { user, role: 'admin' } : null;
        } else if (role === 'business_owner' || role === 'business-owner') {
            const user = await BusinessOwner.findOne({ email, isActive: true });
            return user ? { user, role: 'business_owner' } : null;
        } else {
            // Check all models if no specific role is provided
            const models = [
                { model: Admin, role: 'admin' },
                { model: BusinessOwner, role: 'business_owner' },
                { model: Driver, role: 'driver' },
                { model: Client, role: 'client' },
                { model: VehicleOwner, role: 'vehicle_owner' }
            ];
            for (const { model, role } of models) {
                const user = await model.findOne({ email, isActive: true });
                if (user) return { user, role };
            }
            return null;
        }
    } catch (error) {
        console.error('Error finding user by email:', error);
        return null;
    }
};

// Helper function to find user by username (for admin/business owner)
const findUserByUsername = async (username) => {
    try {
        // Check Admin
        const admin = await Admin.findOne({ username, isActive: true });
        if (admin) return { user: admin, role: 'admin' };

        // Check Business Owner
        const businessOwner = await BusinessOwner.findOne({ username, isActive: true });
        if (businessOwner) return { user: businessOwner, role: 'business_owner' };

        return null;
    } catch (error) {
        console.error('Error finding user by username:', error);
        return null;
    }
};

// Helper function to get dashboard route based on role
const getDashboardRoute = (role) => {
    const routes = {
        admin: '/admin-dashboard',
        business_owner: '/business-owner-dashboard',
        driver: '/driver-dashboard',
        client: '/client-dashboard',
        vehicle_owner: '/vehicle-owner-dashboard'
    };
    return routes[role] || '/dashboard';
};

// Universal Login Controller
const login = async (req, res) => {
    try {
        console.log('Login attempt received');
        console.log('Request body:', req.body);

        const { identifier, password } = req.body;

        if (!identifier || !password) {
            console.log('Missing credentials');
            return res.status(400).json({
                success: false,
                message: 'Please provide email/username and password'
            });
        }

        let userResult = null;

        console.log('Searching for user with identifier:', identifier);

        // First, try to find by email across all collections
        userResult = await findUserByEmail(identifier);
        console.log('Email search result:', userResult);

        // If not found by email, try to find by username (for admin/business owner)
        if (!userResult) {
            console.log('Not found by email, trying username...');
            userResult = await findUserByUsername(identifier);
            console.log('Username search result:', userResult);
        }

        if (!userResult) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        const { user, role } = userResult;

        // Simple password check (no bcrypt for now)
        if (user.password !== password) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Check if driver is approved
        if (role === 'driver' && user.status !== 'approved') {
            return res.status(401).json({
                success: false,
                message: 'Your account is pending approval. Please contact support.'
            });
        }

        // Prepare user data (excluding password)
        const userData = {
            id: user._id,
            email: user.email,
            role: user.role,
            createdAt: user.createdAt
        };

        // Add role-specific data
        switch (role) {
            case 'admin':
                userData.username = user.username;
                userData.fullName = user.fullName;
                break;
            case 'business_owner':
                userData.username = user.username;
                userData.businessName = user.businessName;
                userData.contactNumber = user.contactNumber;
                userData.ownerName = user.ownerName;
                userData.businessType = user.businessType;
                userData.businessAddress = user.businessAddress;
                userData.businessLicense = user.businessLicense;
                userData.taxId = user.taxId;
                userData.website = user.website;
                userData.description = user.description;
                break;
            case 'driver':
                userData.driverId = user.driverId;
                userData.fullName = user.fullName;
                userData.phone = user.phone;
                userData.status = user.status;
                break;
            case 'client':
                userData.firstName = user.firstName;
                userData.lastName = user.lastName;
                userData.phone = user.phone;
                userData.dateOfBirth = user.dateOfBirth ? user.dateOfBirth.toISOString().split('T')[0] : '';
                userData.address = user.address;
                userData.preferences = user.preferences;
                userData.profileImage = user.profileImage;
                break;
            case 'vehicle_owner':
                userData.firstName = user.firstName;
                userData.lastName = user.lastName;
                userData.phone = user.phone;
                userData.address = user.address;
                break;
        }

        res.status(200).json({
            success: true,
            message: 'Login successful',
            user: userData,
            dashboardRoute: getDashboardRoute(role)
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error. Please try again later.'
        });
    }
};

// Get Profile (Universal)
const getProfile = async (req, res) => {
    try {
        const { userId, role } = req.params;

        let user = null;
        let model = null;

        // Select appropriate model based on role
        switch (role) {
            case 'admin':
                model = Admin;
                break;
            case 'business_owner':
            case 'business-owner':
                model = BusinessOwner;
                break;
            case 'driver':
                model = Driver;
                break;
            case 'client':
                model = Client;
                break;
            case 'vehicle_owner':
            case 'vehicle-owner':
                model = VehicleOwner;
                break;
            default:
                return res.status(400).json({
                    success: false,
                    message: 'Invalid role specified'
                });
        }

        user = await model.findById(userId).select('-password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        res.status(200).json({
            success: true,
            user: user
        });

    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error. Please try again later.'
        });
    }
};

module.exports = {
    login,
    getProfile
};
