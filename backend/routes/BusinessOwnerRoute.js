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
    deleteBusinessOwnerProfile
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
