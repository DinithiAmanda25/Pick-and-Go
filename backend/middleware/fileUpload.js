const multer = require('multer');
const path = require('path');

// Set storage engine
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './uploads/');
    },
    filename: function (req, file, cb) {
        // Create unique filename
        const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9)}${path.extname(file.originalname)}`;
        cb(null, uniqueName);
    }
});

// Check file type
function checkFileType(file, cb) {
    // Allowed file extensions
    const filetypes = /jpeg|jpg|png|gif|pdf|doc|docx/;
    // Check extension
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    // Check mime type
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb(new Error('Only images (JPEG, JPG, PNG, GIF) and documents (PDF, DOC, DOCX) are allowed!'));
    }
}

// Initialize upload
const upload = multer({
    storage: storage,
    limits: {
        fileSize: process.env.MAX_FILE_SIZE || 5000000, // 5MB limit
    },
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    }
});

// Multiple file upload middleware for feedback attachments
const uploadFeedbackAttachments = upload.array('attachments', 5); // Max 5 files

// Single file upload middleware for profile pictures
const uploadSingle = upload.single('file');

// Error handling middleware for multer errors
const handleUploadError = (err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({
                success: false,
                error: 'File too large. Maximum size is 5MB.'
            });
        }
        if (err.code === 'LIMIT_FILE_COUNT') {
            return res.status(400).json({
                success: false,
                error: 'Too many files. Maximum 5 files allowed.'
            });
        }
        if (err.code === 'LIMIT_UNEXPECTED_FILE') {
            return res.status(400).json({
                success: false,
                error: 'Unexpected field name for file upload.'
            });
        }
    } else if (err) {
        return res.status(400).json({
            success: false,
            error: err.message
        });
    }
    next();
};

module.exports = {
    uploadFeedbackAttachments,
    uploadSingle,
    handleUploadError
};