const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Create subdirectories for different document types
const documentDirs = ['licenses', 'identity-cards', 'insurance', 'medical-certificates', 'other'];
documentDirs.forEach(dir => {
    const dirPath = path.join(uploadsDir, dir);
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
    }
});

// Configure storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        let subfolder = 'other';

        // Determine subfolder based on fieldname
        switch (file.fieldname) {
            case 'license':
                subfolder = 'licenses';
                break;
            case 'identityCard':
                subfolder = 'identity-cards';
                break;
            case 'insurance':
                subfolder = 'insurance';
                break;
            case 'medicalCertificate':
                subfolder = 'medical-certificates';
                break;
            default:
                subfolder = 'other';
        }

        cb(null, path.join(uploadsDir, subfolder));
    },
    filename: function (req, file, cb) {
        // Generate unique filename
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const extension = path.extname(file.originalname);
        const baseName = path.basename(file.originalname, extension);
        cb(null, `${baseName}-${uniqueSuffix}${extension}`);
    }
});

// File filter
const fileFilter = (req, file, cb) => {
    // Allow only specific file types
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];

    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only JPEG, PNG, and PDF files are allowed.'), false);
    }
};

// Configure multer
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
        files: 10 // Maximum 10 files
    },
    fileFilter: fileFilter
});

// Handle multiple document uploads
const uploadDocuments = upload.fields([
    { name: 'license', maxCount: 1 },
    { name: 'identityCard', maxCount: 1 },
    { name: 'insurance', maxCount: 1 },
    { name: 'registration', maxCount: 1 },
    { name: 'medicalCertificate', maxCount: 1 }
]);

module.exports = {
    upload,
    uploadDocuments
};
