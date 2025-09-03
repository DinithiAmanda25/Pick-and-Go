const express = require('express');
const router = express.Router();
const { upload } = require('../middleware/cloudinaryUpload');
const {
  uploadSingleFile,
  uploadMultipleFiles,
  deleteFile,
  uploadProfileImage,
  uploadDocument
} = require('../controllers/UploadController');

// Upload single file
router.post('/single', upload.single('file'), uploadSingleFile);

// Upload multiple files
router.post('/multiple', upload.array('files', 10), uploadMultipleFiles);

// Upload profile image
router.post('/profile', upload.single('profileImage'), uploadProfileImage);

// Upload document (driver license, vehicle registration, etc.)
router.post('/document', upload.single('document'), uploadDocument);

// Delete file by public ID
router.delete('/:publicId', deleteFile);

module.exports = router;
