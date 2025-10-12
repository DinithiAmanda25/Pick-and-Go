const express = require('express');
const router = express.Router();
const { upload } = require('../middleware/cloudinaryUpload');
const {
    adminLogin,
    getAdminProfile,
    updateAdminProfile,
    changeAdminPassword
} = require('../controllers/AdminController');
const {
generateReport
} = require('../controllers/BookingController');
// Import driver functions for admin use
const { approveDriver, getPendingDrivers, getAllDrivers } = require('../controllers/DriverController');
const { getAllBookingsAdmin, getBookingStats, searchBookings } = require('../controllers/BookingController');
router.get('/generate', generateReport);

// Admin Authentication Routes
router.post('/login', adminLogin);

// Admin Profile Routes (for legacy compatibility /auth/profile/admin/...)
router.get('/:userId', getAdminProfile);
router.put('/:userId', updateAdminProfile);
router.put('/:userId/change-password', changeAdminPassword);

// Admin Profile Routes (original pattern for direct access)
router.get('/profile/:userId', getAdminProfile);
router.put('/profile/:userId', updateAdminProfile);
router.put('/profile/:userId/change-password', changeAdminPassword);

// Admin Driver Management Routes
router.put('/approve-driver/:driverId', approveDriver);
router.get('/pending-drivers', getPendingDrivers);
router.get('/all-drivers', getAllDrivers);
router.get('/admin/all', getAllBookingsAdmin);
router.get('/admin/stats', getBookingStats);
router.get('/admin/search', searchBookings);

module.exports = router;
