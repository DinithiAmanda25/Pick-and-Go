const { uploadToCloudinary, deleteFromCloudinary } = require('../middleware/cloudinaryUpload');

// Upload single file
const uploadSingleFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const { buffer, originalname, mimetype } = req.file;
    const { folder = 'pick-and-go', category = 'general' } = req.body;
    
    // Generate unique filename
    const fileName = `${category}_${Date.now()}_${originalname.split('.')[0]}`;
    
    // Upload to Cloudinary
    const result = await uploadToCloudinary(buffer, fileName, `${folder}/${category}`);
    
    res.status(200).json({
      success: true,
      message: 'File uploaded successfully',
      file: {
        url: result.secure_url,
        publicId: result.public_id,
        format: result.format,
        size: result.bytes,
        width: result.width || null,
        height: result.height || null,
        originalName: originalname,
        uploadedAt: new Date()
      }
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({
      success: false,
      message: 'File upload failed',
      error: error.message
    });
  }
};

// Upload multiple files
const uploadMultipleFiles = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded'
      });
    }

    const { folder = 'pick-and-go', category = 'general' } = req.body;
    const uploadPromises = [];

    // Process each file
    for (let i = 0; i < req.files.length; i++) {
      const file = req.files[i];
      const fileName = `${category}_${Date.now()}_${i}_${file.originalname.split('.')[0]}`;
      
      uploadPromises.push(
        uploadToCloudinary(file.buffer, fileName, `${folder}/${category}`)
      );
    }

    // Wait for all uploads to complete
    const results = await Promise.all(uploadPromises);
    
    const uploadedFiles = results.map((result, index) => ({
      url: result.secure_url,
      publicId: result.public_id,
      format: result.format,
      size: result.bytes,
      width: result.width || null,
      height: result.height || null,
      originalName: req.files[index].originalname,
      uploadedAt: new Date()
    }));

    res.status(200).json({
      success: true,
      message: `${uploadedFiles.length} files uploaded successfully`,
      files: uploadedFiles
    });
  } catch (error) {
    console.error('Multiple upload error:', error);
    res.status(500).json({
      success: false,
      message: 'File upload failed',
      error: error.message
    });
  }
};

// Delete file
const deleteFile = async (req, res) => {
  try {
    const { publicId } = req.params;
    
    if (!publicId) {
      return res.status(400).json({
        success: false,
        message: 'Public ID is required'
      });
    }

    const result = await deleteFromCloudinary(publicId);
    
    res.status(200).json({
      success: true,
      message: 'File deleted successfully',
      result
    });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({
      success: false,
      message: 'File deletion failed',
      error: error.message
    });
  }
};

// Upload profile image
const uploadProfileImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image uploaded'
      });
    }

    const { buffer, originalname, mimetype } = req.file;
    const { userId, userType } = req.body;
    
    // Validate image type
    if (!mimetype.startsWith('image/')) {
      return res.status(400).json({
        success: false,
        message: 'Only image files are allowed for profile pictures'
      });
    }
    
    // Generate unique filename for profile
    const fileName = `profile_${userType}_${userId}_${Date.now()}`;
    
    // Upload to Cloudinary in profiles folder
    const result = await uploadToCloudinary(buffer, fileName, 'pick-and-go/profiles');
    
    res.status(200).json({
      success: true,
      message: 'Profile image uploaded successfully',
      profileImage: {
        url: result.secure_url,
        publicId: result.public_id,
        format: result.format,
        size: result.bytes,
        width: result.width,
        height: result.height,
        uploadedAt: new Date()
      }
    });
  } catch (error) {
    console.error('Profile upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Profile image upload failed',
      error: error.message
    });
  }
};

// Upload document (for driver license, vehicle registration, etc.)
const uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No document uploaded'
      });
    }

    const { buffer, originalname, mimetype } = req.file;
    const { userId, userType, documentType } = req.body;
    
    // Generate unique filename for document
    const fileName = `${documentType}_${userType}_${userId}_${Date.now()}`;
    
    // Upload to Cloudinary in documents folder
    const result = await uploadToCloudinary(buffer, fileName, `pick-and-go/documents/${userType}`);
    
    res.status(200).json({
      success: true,
      message: 'Document uploaded successfully',
      document: {
        url: result.secure_url,
        publicId: result.public_id,
        format: result.format,
        size: result.bytes,
        documentType: documentType,
        originalName: originalname,
        uploadedAt: new Date()
      }
    });
  } catch (error) {
    console.error('Document upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Document upload failed',
      error: error.message
    });
  }
};

module.exports = {
  uploadSingleFile,
  uploadMultipleFiles,
  deleteFile,
  uploadProfileImage,
  uploadDocument
};
