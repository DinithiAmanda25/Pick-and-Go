const express = require('express');
const router = express.Router();
const {
  login,
  registerClient,
  registerVehicleOwner,
  registerDriver,
  getProfile,
  approveDriver
} = require('../controllers/AuthController');

// Authentication Routes
router.post('/login', login);

// Registration Routes
router.post('/register/client', registerClient);
router.post('/register/vehicle-owner', registerVehicleOwner);
router.post('/register/driver', registerDriver);

// Profile Routes
router.get('/profile/:role/:userId', getProfile);

// Admin Routes
router.put('/admin/approve-driver/:driverId', approveDriver);

module.exports = router;
