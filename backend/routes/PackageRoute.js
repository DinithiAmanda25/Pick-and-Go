const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/authMiddleware');
const {
  createPackage,
  getPackagesByBusinessOwner,
  getPackageById,
  updatePackage,
  deletePackage,
  togglePackageStatus,
  getAvailableVehicles,
  getPackageStats
} = require('../controllers/PackageController');

// Apply authentication middleware to all routes
router.use(authenticateToken);

// Package CRUD routes
router.post('/create', createPackage);
router.get('/business-owner/:businessOwnerId', getPackagesByBusinessOwner);
router.get('/:packageId', getPackageById);
router.put('/:packageId', updatePackage);
router.delete('/:packageId', deletePackage);
router.patch('/:packageId/toggle-status', togglePackageStatus);

// Additional utility routes
router.get('/business-owner/:businessOwnerId/vehicles/available', getAvailableVehicles);
router.get('/business-owner/:businessOwnerId/stats', getPackageStats);

module.exports = router;
