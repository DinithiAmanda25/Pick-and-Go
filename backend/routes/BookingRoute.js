const express = require('express');
const router = express.Router();
const {
    createBooking,
    getClientBookings,
    getVehicleOwnerBookings,
    getBookingDetails,
    updateBookingStatus,
    assignDriver,
    unassignDriver,
    cancelBooking,
    addBookingMessage,
    addBookingReview,
    checkVehicleAvailability,
    getAllBookingsAdmin,
    getBookingStats,
    searchBookings,
    generateReport,
    getDriverSchedule,
    checkDriverAvailability
} = require('../controllers/BookingController');

// Debug: Check if all functions are properly imported
console.log('BookingRoute: Checking imported functions...');
console.log('createBooking:', typeof createBooking);
console.log('getClientBookings:', typeof getClientBookings);
console.log('getVehicleOwnerBookings:', typeof getVehicleOwnerBookings);
console.log('getBookingDetails:', typeof getBookingDetails);
console.log('updateBookingStatus:', typeof updateBookingStatus);
console.log('assignDriver:', typeof assignDriver);
console.log('unassignDriver:', typeof unassignDriver);
console.log('cancelBooking:', typeof cancelBooking);
console.log('addBookingMessage:', typeof addBookingMessage);
console.log('addBookingReview:', typeof addBookingReview);
console.log('checkVehicleAvailability:', typeof checkVehicleAvailability);
console.log('getAllBookingsAdmin:', typeof getAllBookingsAdmin);
console.log('getBookingStats:', typeof getBookingStats);
console.log('searchBookings:', typeof searchBookings);
console.log('generateReport:', typeof generateReport);
console.log('getDriverSchedule:', typeof getDriverSchedule);
console.log('checkDriverAvailability:', typeof checkDriverAvailability);

// Create new booking
router.post('/create', createBooking);

// Get bookings by client
router.get('/client/:clientId', getClientBookings);

// Get bookings by vehicle owner
router.get('/owner/:ownerId', getVehicleOwnerBookings);

// Get single booking details
router.get('/:bookingId', getBookingDetails);

// Update booking status
router.put('/:bookingId/status', updateBookingStatus);

// Driver Assignment Routes
router.put('/:bookingId/assign-driver', assignDriver);
router.put('/:bookingId/unassign-driver', unassignDriver);

// Cancel booking
router.put('/:bookingId/cancel', cancelBooking);

// Add message to booking
router.post('/:bookingId/messages', addBookingMessage);

// Add review to booking
router.post('/:bookingId/review', addBookingReview);

// Check vehicle availability
router.get('/availability/:vehicleId', checkVehicleAvailability);

// Admin routes
router.get('/admin/all', getAllBookingsAdmin);
router.get('/admin/stats', getBookingStats);
router.get('/admin/search', searchBookings);
router.get('/admin/driver-schedule', getDriverSchedule);

// Driver availability check
router.get('/drivers/:driverId/availability', checkDriverAvailability);

module.exports = router;