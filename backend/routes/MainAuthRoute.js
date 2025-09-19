const express = require('express');
const router = express.Router();

// Import unified auth controller for general login
const { login, getProfile } = require('../controllers/UnifiedAuthController');

// Import specific registration controllers
const { registerClient } = require('../controllers/ClientController');
const { registerVehicleOwner } = require('../controllers/VehicleOwnerController');
const { registerBusinessOwner } = require('../controllers/BusinessOwnerController');
const { registerDriver, getAllDrivers, getPendingDrivers, approveDriver } = require('../controllers/DriverController');
const { upload } = require('../middleware/cloudinaryUpload');

// Import specific route handlers
const adminRoutes = require('./AdminRoute');
const businessOwnerRoutes = require('./BusinessOwnerRoute');
const driverRoutes = require('./DriverRoute');
const clientRoutes = require('./ClientRoute');
const vehicleOwnerRoutes = require('./VehicleOwnerRoute');

// Legacy frontend compatibility routes (old pattern: /auth/profile/actor-type/...)
router.use('/profile/admin', adminRoutes);
router.use('/profile/business-owner', businessOwnerRoutes);
router.use('/profile/driver', driverRoutes);
router.use('/profile/client', clientRoutes);
router.use('/profile/vehicle-owner', vehicleOwnerRoutes);

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
router.post('/register-driver', upload.fields([
    { name: 'license', maxCount: 1 },
    { name: 'identityCard', maxCount: 1 },
    { name: 'insurance', maxCount: 1 },
    { name: 'registration', maxCount: 1 },
    { name: 'medicalCertificate', maxCount: 1 }
]), registerDriver);

// Driver-specific routes for admin functionality
router.get('/drivers/all', getAllDrivers);
router.get('/drivers/pending', getPendingDrivers);
router.put('/drivers/approve/:driverId', approveDriver);

// Actor-specific routes (new pattern: /auth/actor-type/...)
router.use('/admin', adminRoutes);
router.use('/business-owner', businessOwnerRoutes);
router.use('/driver', driverRoutes);
router.use('/client', clientRoutes);
router.use('/vehicle-owner', vehicleOwnerRoutes);

module.exports = router;