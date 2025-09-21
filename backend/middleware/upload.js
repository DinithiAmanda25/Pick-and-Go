const multer = require('multer');
const cloudinary = require('../config/cloudinary');

// Function to upload file to Cloudinary
const uploadToCloudinary = (fileBuffer, fileName, folder = 'pick-and-go') => {
    return new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
            {
                resource_type: 'auto',
                folder: folder,
                public_id: fileName,
                overwrite: true,
            },
            (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(result);
                }
            }
        ).end(fileBuffer);
    });
};

// Configure storage to use memory storage
// This will keep files in memory instead of writing to disk
const storage = multer.memoryStorage();

// Configure multer
const multerConfig = {
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
        files: 10 // Maximum 10 files
    },
    fileFilter: (req, file, cb) => {
        // Allow only specific file types
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];

        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only JPEG, PNG, and PDF files are allowed.'), false);
        }
    }
};

// Create upload middleware with the config
const upload = multer(multerConfig);

// Helper function to upload files to Cloudinary after multer processes them
const processAndUploadToCloudinary = (req, res, next) => {
    if (!req.files) {
        return next();
    }

    // Process each file field and upload to Cloudinary
    const promises = [];

    // Iterate through all file fields
    Object.keys(req.files).forEach(fieldName => {
        const files = req.files[fieldName];

        // Process each file in the field
        files.forEach(file => {
            const promise = new Promise(async (resolve, reject) => {
                try {
                    // Determine folder based on field name
                    let folder = 'other';
                    switch (fieldName) {
                        case 'license': folder = 'drivers/licenses'; break;
                        case 'identityCard': folder = 'drivers/identity-cards'; break;
                        case 'insurance': folder = 'drivers/insurance'; break;
                        case 'medicalCertificate': folder = 'drivers/medical-certificates'; break;
                        case 'registration': folder = 'drivers/registration'; break;
                        default: folder = 'others';
                    }

                    // Generate unique file name
                    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
                    const fileName = `${fieldName}-${uniqueSuffix}`;

                    // Upload to Cloudinary
                    const result = await uploadToCloudinary(file.buffer, fileName, folder);

                    // Add Cloudinary data to the file object
                    file.cloudinary = {
                        url: result.secure_url,
                        publicId: result.public_id
                    };

                    resolve();
                } catch (error) {
                    console.error(`Error uploading ${fieldName} to Cloudinary:`, error);
                    reject(error);
                }
            });

            promises.push(promise);
        });
    });

    // Wait for all uploads to complete
    Promise.all(promises)
        .then(() => next())
        .catch(error => {
            console.error('Failed to upload files to Cloudinary:', error);
            next(error);
        });
};

// Handle multiple document uploads
const uploadDocuments = (req, res, next) => {
    upload.fields([
        { name: 'license', maxCount: 1 },
        { name: 'identityCard', maxCount: 1 },
        { name: 'insurance', maxCount: 1 },
        { name: 'registration', maxCount: 1 },
        { name: 'medicalCertificate', maxCount: 1 }
    ])(req, res, (err) => {
        if (err) {
            return res.status(400).json({
                success: false,
                message: `File upload error: ${err.message}`
            });
        }

        // Process and upload files to Cloudinary
        processAndUploadToCloudinary(req, res, next);
    });
};

module.exports = {
    upload,
    uploadDocuments,
    processAndUploadToCloudinary
};
