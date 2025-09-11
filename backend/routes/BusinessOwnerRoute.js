const express = require('express');
const router = express.Router();
const { upload } = require('../middleware/cloudinaryUpload');
const {
    registerBusinessOwner,
    businessOwnerLogin,
    getBusinessOwnerProfile,
    updateBusinessOwnerProfile,
    uploadBusinessOwnerProfileImage,
    changeBusinessOwnerPassword,
    deleteBusinessOwnerProfile,
    // Pending Applications Management
    getPendingApplications,
    getPendingDrivers,
    getPendingVehicles,
    approveDriver,
    approveVehicle,
    getApprovalStatistics
} = require('../controllers/BusinessOwnerController');

// Business Owner Authentication Routes
router.post('/register', registerBusinessOwner);
router.post('/login', businessOwnerLogin);

// Business Owner Profile Routes (for legacy compatibility /auth/profile/business-owner/...)
router.get('/:userId', getBusinessOwnerProfile);
router.put('/:userId', updateBusinessOwnerProfile);
router.post('/:userId/upload-image', upload.single('profileImage'), uploadBusinessOwnerProfileImage);
router.put('/:userId/change-password', changeBusinessOwnerPassword);
router.delete('/:userId', deleteBusinessOwnerProfile);

// Business Owner Profile Routes (original pattern for direct access)
router.get('/profile/:userId', getBusinessOwnerProfile);
router.put('/profile/:userId', updateBusinessOwnerProfile);
router.post('/profile/:userId/upload-image', upload.single('profileImage'), uploadBusinessOwnerProfileImage);
router.put('/profile/:userId/change-password', changeBusinessOwnerPassword);
router.delete('/profile/:userId', deleteBusinessOwnerProfile);

// ==================== PENDING APPLICATIONS MANAGEMENT ROUTES ====================

// Get all pending applications (both drivers and vehicles)
router.get('/:businessOwnerId/pending-applications', getPendingApplications);

// Get pending drivers only
router.get('/:businessOwnerId/pending-drivers', getPendingDrivers);

// Get pending vehicles only
router.get('/:businessOwnerId/pending-vehicles', getPendingVehicles);

// Approve/Reject Driver
router.put('/:businessOwnerId/approve-driver/:driverId', approveDriver);

// Approve/Reject Vehicle
router.put('/:businessOwnerId/approve-vehicle/:vehicleId', approveVehicle);

// Get approval statistics for dashboard
router.get('/:businessOwnerId/approval-statistics', getApprovalStatistics);

// Debug route to check business owner data
router.get('/debug/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const { BusinessOwner } = require('../models/BusinessOwnerModel');
        const businessOwner = await BusinessOwner.findById(userId);

        if (!businessOwner) {
            return res.status(404).json({ message: 'Business owner not found' });
        }

        res.json({
            id: businessOwner._id,
            email: businessOwner.email,
            username: businessOwner.username,
            businessName: businessOwner.businessName,
            contactNumber: businessOwner.contactNumber,
            ownerName: businessOwner.ownerName,
            businessType: businessOwner.businessType,
            businessAddress: businessOwner.businessAddress,
            businessLicense: businessOwner.businessLicense,
            taxId: businessOwner.taxId,
            website: businessOwner.website,
            description: businessOwner.description,
            role: businessOwner.role,
            createdAt: businessOwner.createdAt,
            updatedAt: businessOwner.updatedAt
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
