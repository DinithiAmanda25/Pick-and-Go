const express = require('express');
const router = express.Router();
const { upload } = require('../middleware/cloudinaryUpload');
const {
  login,
  registerDriver,
  registerClient,
  registerBusinessOwner,
  registerVehicleOwner,
  updateBusinessOwnerProfile
} = require('../controllers/AuthController');

// Authentication Routes
router.post('/login', login);

// Registration Routes - Using Cloudinary for file uploads
router.post('/register/client', registerClient);
router.post('/register/business-owner', registerBusinessOwner);
router.post('/register/vehicle-owner', registerVehicleOwner);

router.post('/register-driver', upload.fields([
  { name: 'license', maxCount: 1 },
  { name: 'identityCard', maxCount: 1 },
  { name: 'insurance', maxCount: 1 },
  { name: 'registration', maxCount: 1 },
  { name: 'medicalCertificate', maxCount: 1 }
]), registerDriver);

// Profile Update Routes
router.put('/profile/business-owner/:userId', updateBusinessOwnerProfile);

// Debug route to check business owner data
router.get('/debug/business-owner/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { BusinessOwner } = require('../models/UserModel');
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
      createdAt: businessOwner.createdAt
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
