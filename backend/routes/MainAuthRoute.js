const express = require('express');
const router = express.Router();

// Import unified auth controller for general login
const { login, getProfile } = require('../controllers/UnifiedAuthController');

// Import specific registration controllers
const { registerClient } = require('../controllers/ClientController');
const { registerVehicleOwner } = require('../controllers/VehicleOwnerController');
const { registerBusinessOwner } = require('../controllers/BusinessOwnerController');
const { registerDriver } = require('../controllers/DriverController');

// Import file upload middleware
const { uploadDocuments } = require('../middleware/upload');

// Import specific route handlers
const adminRoutes = require('./AdminRoute');
const businessOwnerRoutes = require('./BusinessOwnerRoute');
const driverRoutes = require('./DriverRoute');
const clientRoutes = require('./ClientRoute');
const vehicleOwnerRoutes = require('./VehicleOwnerRoute');
const forgotPasswordRoutes = require('./ForgotPasswordRoute');

// Legacy frontend compatibility routes (old pattern: /auth/profile/actor-type/...)
// Special case for "all-drivers" to prevent ObjectId cast error
router.get('/admin/all-drivers', (req, res) => {
    const { getAllDrivers } = require('../controllers/DriverController');
    getAllDrivers(req, res);
});

// Special case for "all-vehicles" to prevent ObjectId cast error
router.get('/admin/all-vehicles', (req, res) => {
    const { Vehicle } = require('../models/VehicleModel');
    const { VehicleOwner } = require('../models/VehicleOwnerModel');

    // Handle the request with an async function
    (async () => {
        try {
            // Get all vehicles
            const vehicles = await Vehicle.find();

            // For each vehicle, populate owner details if available
            const enhancedVehicles = await Promise.all(vehicles.map(async (vehicle) => {
                const vehicleObj = vehicle.toObject();

                try {
                    // Add type field for compatibility with frontend
                    vehicleObj.type = vehicleObj.vehicleType;

                    if (vehicle.ownerId) {
                        const owner = await VehicleOwner.findById(vehicle.ownerId).select('fullName email');
                        if (owner) {
                            vehicleObj.ownerDetails = owner;
                        }
                    }
                } catch (err) {
                    console.error('Error finding vehicle owner:', err);
                }

                return vehicleObj;
            }));

            res.status(200).json({
                success: true,
                vehicles: enhancedVehicles,
                count: enhancedVehicles.length
            });
        } catch (err) {
            console.error('Error fetching vehicles:', err);
            // Return empty array as fallback
            res.status(200).json({
                success: true,
                vehicles: [],
                count: 0,
                message: 'Error fetching vehicles data'
            });
        }
    })();
});

router.use('/profile/admin', adminRoutes);
router.use('/profile/business-owner', businessOwnerRoutes);
router.use('/profile/driver', driverRoutes);
router.use('/profile/client', clientRoutes);
router.use('/profile/vehicle-owner', vehicleOwnerRoutes);

// Forgot Password Routes
router.use('/forgot-password', forgotPasswordRoutes);

// Universal Authentication Routes
router.post('/login', login);
router.get('/profile/:userId/:role', getProfile);
// Legacy compatibility for reversed parameters
router.get('/profile/:role/:userId', (req, res) => {
    // Swap the parameters to match our new format
    req.params = { userId: req.params.userId, role: req.params.role };
    return getProfile(req, res);
});

// Legacy registration routes (frontend expects these patterns)
router.post('/register/client', registerClient);
router.post('/register/vehicle-owner', registerVehicleOwner);
router.post('/register/business-owner', registerBusinessOwner);

// Use uploadDocuments middleware for driver registration
router.post('/register-driver', uploadDocuments, registerDriver);

// Actor-specific routes (new pattern: /auth/actor-type/...)
router.use('/admin', adminRoutes);
router.use('/business-owner', businessOwnerRoutes);
router.use('/driver', driverRoutes);
router.use('/client', clientRoutes);
router.use('/vehicle-owner', vehicleOwnerRoutes);

module.exports = router;
