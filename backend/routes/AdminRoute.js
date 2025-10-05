const express = require('express');
const router = express.Router();
const { upload } = require('../middleware/cloudinaryUpload');
const {
    adminLogin,
    getAdminProfile,
    updateAdminProfile,
    changeAdminPassword
} = require('../controllers/AdminController');

// Import driver functions for admin use (view only)
const { getAllDrivers, getPendingDrivers } = require('../controllers/DriverController');

// Admin Authentication Routes
router.post('/login', adminLogin);

// Admin Profile Routes (for legacy compatibility /auth/profile/admin/...)
// Add middleware to check if userId is 'all-drivers' to prevent ObjectId error
router.get('/:userId', (req, res, next) => {
    if (req.params.userId === 'all-drivers') {
        return getAllDrivers(req, res);
    }
    next();
}, getAdminProfile);
router.put('/:userId', updateAdminProfile);
router.put('/:userId/change-password', changeAdminPassword);

// Admin Profile Routes (original pattern for direct access)
router.get('/profile/:userId', getAdminProfile);
router.put('/profile/:userId', updateAdminProfile);
router.put('/profile/:userId/change-password', changeAdminPassword);

// Admin Driver Management Routes (view only)
// Removed approval functionality
router.get('/pending-drivers', getPendingDrivers);
router.get('/all-drivers', getAllDrivers);

// Admin Vehicle Management Routes (view only)
router.get('/all-vehicles', (req, res) => {
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

module.exports = router;
