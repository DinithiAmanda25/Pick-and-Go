const express = require('express');
const router = express.Router();
const { upload } = require('../middleware/cloudinaryUpload');
const {
    addVehicle,
    uploadVehicleImages,
    getVehiclesByOwner,
    getVehicleDetails,
    updateVehicle,
    deleteVehicle,
    addMaintenanceSchedule,
    updateMaintenanceSchedule,
    getMaintenanceSchedule,
    getPendingVehicles,
    approveVehicle,
    rejectVehicle,
    uploadVehicleDocument,
    getAvailableVehicles
} = require('../controllers/VehicleController');

const { cleanupVehicleDocuments } = require('../controllers/CleanupController');

// Vehicle Owner Routes
router.post('/owner/:ownerId/add', addVehicle);
router.get('/owner/:ownerId', getVehiclesByOwner);
router.post('/:vehicleId/upload-image', upload.single('vehicleImage'), uploadVehicleImages);
router.post('/:vehicleId/upload-document', upload.single('document'), uploadVehicleDocument);
router.get('/:vehicleId', getVehicleDetails);
router.put('/:vehicleId', updateVehicle);
router.delete('/:vehicleId', deleteVehicle);

// Maintenance Routes
router.post('/:vehicleId/maintenance', addMaintenanceSchedule);
router.put('/:vehicleId/maintenance/:maintenanceId', updateMaintenanceSchedule);
router.get('/:vehicleId/maintenance', getMaintenanceSchedule);

// Business Owner Routes
router.get('/pending/approval', getPendingVehicles);
router.put('/:vehicleId/approve/:businessOwnerId', approveVehicle);
router.put('/:vehicleId/reject/:businessOwnerId', rejectVehicle);

// Public Routes
router.get('/available/rental', getAvailableVehicles);

// Cleanup Route (for development/maintenance)
router.post('/cleanup/documents', cleanupVehicleDocuments);

module.exports = router;
