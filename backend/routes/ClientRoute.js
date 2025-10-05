const express = require('express');
const router = express.Router();
const { upload } = require('../middleware/cloudinaryUpload');
const {
    registerClient,
    clientLogin,
    getClientProfile,
    updateClientProfile,
    uploadClientProfileImage,
    changeClientPassword,
    deleteClientProfile,
    getAllClients
} = require('../controllers/ClientController');

// Client Authentication Routes
router.post('/register', registerClient);
router.post('/login', clientLogin);

// Admin function to get all clients - must be placed before routes with parameters
router.get('/all', getAllClients);

// Client Profile Routes (for legacy compatibility /auth/profile/client/...)
router.get('/:userId', getClientProfile);
router.put('/:userId', updateClientProfile);
router.post('/:userId/upload-image', upload.single('profileImage'), uploadClientProfileImage);
router.put('/:userId/change-password', changeClientPassword);
router.delete('/:userId', deleteClientProfile);

// Client Profile Routes (original pattern for direct access)
router.get('/profile/:userId', getClientProfile);
router.put('/profile/:userId', updateClientProfile);
router.post('/profile/:userId/upload-image', upload.single('profileImage'), uploadClientProfileImage);
router.put('/profile/:userId/change-password', changeClientPassword);
router.delete('/profile/:userId', deleteClientProfile);

// This route is now placed above to avoid conflicts with /:userId

module.exports = router;
