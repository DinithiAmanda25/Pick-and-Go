const express = require('express');
const router = express.Router();
const { upload } = require('../middleware/cloudinaryUpload');
const {
    registerDriver,
    driverLogin,
    getDriverProfile,
    updateDriverProfile,
    approveDriver,
    getPendingDrivers,
    getAllDrivers,
    changeDriverPassword
} = require('../controllers/DriverController');

// Driver Authentication Routes
router.post('/login', driverLogin);

// Driver Registration with file uploads
router.post('/register', upload.fields([
    { name: 'license', maxCount: 1 },
    { name: 'identityCard', maxCount: 1 },
    { name: 'insurance', maxCount: 1 },
    { name: 'registration', maxCount: 1 },
    { name: 'medicalCertificate', maxCount: 1 }
]), registerDriver);

// Driver Profile Routes (for legacy compatibility /auth/profile/driver/...)
router.get('/:userId', getDriverProfile);
router.put('/:userId', updateDriverProfile);
router.put('/:userId/change-password', changeDriverPassword);

// Driver Profile Routes (original pattern for direct access)
router.get('/profile/:userId', getDriverProfile);
router.put('/profile/:userId', updateDriverProfile);
router.put('/profile/:userId/change-password', changeDriverPassword);

// Admin functions for driver management
router.put('/approve/:driverId', approveDriver);
router.get('/pending', getPendingDrivers);
router.get('/all', getAllDrivers);

module.exports = router;
