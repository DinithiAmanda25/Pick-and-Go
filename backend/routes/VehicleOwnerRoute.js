const express = require('express');
const router = express.Router();
const { upload } = require('../middleware/cloudinaryUpload');
const {
    registerVehicleOwner,
    vehicleOwnerLogin,
    getVehicleOwnerProfile,
    updateVehicleOwnerProfile,
    uploadVehicleOwnerProfileImage,
    changeVehicleOwnerPassword,
    uploadVehicleOwnerDocument,
    deleteVehicleOwnerDocument,
    getVehicleOwnerDocuments,
    deleteVehicleOwnerProfile,
    getAllVehicleOwners,
    getVehicleOwnerReviews,
    addVehicleOwnerReview
} = require('../controllers/VehicleOwnerController');

// Vehicle Owner Authentication Routes
router.post('/register', registerVehicleOwner);
router.post('/login', vehicleOwnerLogin);

// Vehicle Owner Profile Routes (for legacy compatibility /auth/profile/vehicle-owner/...)
router.get('/:userId', getVehicleOwnerProfile);
router.put('/:userId', updateVehicleOwnerProfile);
router.post('/:userId/upload-image', upload.single('profileImage'), uploadVehicleOwnerProfileImage);
router.put('/:userId/change-password', changeVehicleOwnerPassword);
router.post('/:userId/upload-document', upload.single('document'), uploadVehicleOwnerDocument);
router.get('/:userId/documents', getVehicleOwnerDocuments);
router.delete('/:userId/documents/:documentType', deleteVehicleOwnerDocument);
router.get('/:userId/reviews', getVehicleOwnerReviews);
router.post('/:userId/reviews', addVehicleOwnerReview);
router.delete('/:userId', deleteVehicleOwnerProfile);

// Vehicle Owner Profile Routes (original pattern for direct access)
router.get('/profile/:userId', getVehicleOwnerProfile);
router.put('/profile/:userId', updateVehicleOwnerProfile);
router.post('/profile/:userId/upload-image', upload.single('profileImage'), uploadVehicleOwnerProfileImage);
router.put('/profile/:userId/change-password', changeVehicleOwnerPassword);
router.post('/profile/:userId/upload-document', upload.single('document'), uploadVehicleOwnerDocument);
router.get('/profile/:userId/documents', getVehicleOwnerDocuments);
router.delete('/profile/:userId/documents/:documentType', deleteVehicleOwnerDocument);
router.get('/profile/:userId/reviews', getVehicleOwnerReviews);
router.post('/profile/:userId/reviews', addVehicleOwnerReview);
router.delete('/profile/:userId', deleteVehicleOwnerProfile);

// Admin function to get all vehicle owners
router.get('/all', getAllVehicleOwners);

// Debug route to check vehicle owner data
router.get('/debug/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const { VehicleOwner } = require('../models/VehicleOwnerModel');
        const vehicleOwner = await VehicleOwner.findById(userId);

        if (!vehicleOwner) {
            return res.status(404).json({ message: 'Vehicle owner not found' });
        }

        console.log('Debug route - Raw vehicle owner data:', JSON.stringify(vehicleOwner, null, 2));
        console.log('Debug route - Address:', vehicleOwner.address);

        res.json({
            raw: vehicleOwner,
            address: vehicleOwner.address,
            addressStreet: vehicleOwner.address?.street,
            addressCity: vehicleOwner.address?.city,
            addressState: vehicleOwner.address?.state,
            addressZipCode: vehicleOwner.address?.zipCode
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
