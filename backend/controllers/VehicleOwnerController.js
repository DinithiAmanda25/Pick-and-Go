const { VehicleOwner } = require('../models/VehicleOwnerModel');
const { Review } = require('../models/ReviewModel');
const { uploadToCloudinary } = require('../middleware/cloudinaryUpload');

// Register Vehicle Owner
const registerVehicleOwner = async (req, res) => {
    try {
        const {
            firstName,
            lastName,
            email,
            password,
            phone,
            address
        } = req.body;

        // Check if vehicle owner already exists
        const existingVehicleOwner = await VehicleOwner.findOne({ email });
        if (existingVehicleOwner) {
            return res.status(400).json({
                success: false,
                message: 'Email already registered'
            });
        }

        // Create new vehicle owner
        const vehicleOwner = new VehicleOwner({
            firstName,
            lastName,
            email,
            password,
            phone,
            role: 'vehicle_owner',
            address
        });

        await vehicleOwner.save();

        // Return vehicle owner data (excluding password)
        const vehicleOwnerData = vehicleOwner.toObject();
        delete vehicleOwnerData.password;

        res.status(201).json({
            success: true,
            message: 'Vehicle owner registered successfully',
            vehicleOwner: vehicleOwnerData
        });

    } catch (error) {
        console.error('Register vehicle owner error:', error);
        if (error.code === 11000) {
            return res.status(400).json({
                success: false,
                message: 'Email already exists'
            });
        }
        res.status(500).json({
            success: false,
            message: 'Server error. Please try again later.'
        });
    }
};

// Vehicle Owner Login
const vehicleOwnerLogin = async (req, res) => {
    try {
        const { identifier, password } = req.body;

        if (!identifier || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email and password'
            });
        }

        // Find vehicle owner by email
        const vehicleOwner = await VehicleOwner.findOne({ email: identifier, isActive: true });

        if (!vehicleOwner) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Simple password check
        if (vehicleOwner.password !== password) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Prepare vehicle owner data (excluding password)
        const vehicleOwnerData = {
            id: vehicleOwner._id,
            firstName: vehicleOwner.firstName,
            lastName: vehicleOwner.lastName,
            email: vehicleOwner.email,
            phone: vehicleOwner.phone,
            address: vehicleOwner.address,
            role: vehicleOwner.role,
            createdAt: vehicleOwner.createdAt
        };

        res.status(200).json({
            success: true,
            message: 'Login successful',
            user: vehicleOwnerData,
            dashboardRoute: '/vehicle-owner/dashboard'
        });

    } catch (error) {
        console.error('Vehicle owner login error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error. Please try again later.'
        });
    }
};

// Get Vehicle Owner Profile
const getVehicleOwnerProfile = async (req, res) => {
    try {
        const { userId } = req.params;

        const vehicleOwner = await VehicleOwner.findById(userId).select('-password');
        if (!vehicleOwner) {
            return res.status(404).json({
                success: false,
                message: 'Vehicle owner not found'
            });
        }

        res.status(200).json({
            success: true,
            user: vehicleOwner
        });
    } catch (error) {
        console.error('Get vehicle owner profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error. Please try again later.'
        });
    }
};

// Update Vehicle Owner Profile
const updateVehicleOwnerProfile = async (req, res) => {
    try {
        const { userId } = req.params;
        const {
            firstName,
            lastName,
            email,
            phone,
            address
        } = req.body;

        console.log('Updating vehicle owner profile for user:', userId);
        console.log('Update data received:', req.body);

        // Validate required fields
        if (!firstName || !lastName || !email || !phone) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields'
            });
        }

        // Check if vehicle owner exists
        const vehicleOwner = await VehicleOwner.findById(userId);
        if (!vehicleOwner) {
            return res.status(404).json({
                success: false,
                message: 'Vehicle owner not found'
            });
        }

        // Check for duplicate email if changed
        if (email !== vehicleOwner.email) {
            const existingEmail = await VehicleOwner.findOne({ email, _id: { $ne: userId } });
            if (existingEmail) {
                return res.status(400).json({
                    success: false,
                    message: 'Email already exists'
                });
            }
        }

        // Prepare update data
        const updateData = {
            firstName,
            lastName,
            email,
            phone,
            address,
            updatedAt: new Date()
        };

        console.log('Update data to be saved:', updateData);

        // Update vehicle owner
        const updatedVehicleOwner = await VehicleOwner.findByIdAndUpdate(
            userId,
            updateData,
            { new: true, runValidators: true }
        ).select('-password');

        console.log('Vehicle owner updated successfully:', updatedVehicleOwner);

        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            vehicleOwner: updatedVehicleOwner
        });

    } catch (error) {
        console.error('Update vehicle owner profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error. Please try again later.'
        });
    }
};

// Upload Vehicle Owner Profile Image
const uploadVehicleOwnerProfileImage = async (req, res) => {
    try {
        const { userId } = req.params;

        console.log('Uploading profile image for vehicle owner:', userId);
        console.log('File received:', req.file);

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No image file provided'
            });
        }

        const vehicleOwner = await VehicleOwner.findById(userId);
        if (!vehicleOwner) {
            return res.status(404).json({
                success: false,
                message: 'Vehicle owner not found'
            });
        }

        // Delete old profile image if exists
        if (vehicleOwner.profileImage && vehicleOwner.profileImage.publicId) {
            // Add cloudinary deletion logic here if needed
        }

        // Update profile image
        vehicleOwner.profileImage = {
            url: req.file.path,
            publicId: req.file.filename,
            uploadedAt: new Date()
        };
        vehicleOwner.updatedAt = new Date();

        await vehicleOwner.save();

        console.log('Profile image uploaded successfully');

        res.status(200).json({
            success: true,
            message: 'Profile image uploaded successfully',
            profileImage: vehicleOwner.profileImage
        });

    } catch (error) {
        console.error('Upload vehicle owner profile image error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error. Please try again later.'
        });
    }
};

// Change Vehicle Owner Password
const changeVehicleOwnerPassword = async (req, res) => {
    try {
        const { userId } = req.params;
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Please provide current and new password'
            });
        }

        const vehicleOwner = await VehicleOwner.findById(userId);
        if (!vehicleOwner) {
            return res.status(404).json({
                success: false,
                message: 'Vehicle owner not found'
            });
        }

        // Check current password
        if (vehicleOwner.password !== currentPassword) {
            return res.status(400).json({
                success: false,
                message: 'Current password is incorrect'
            });
        }

        // Update password
        vehicleOwner.password = newPassword;
        vehicleOwner.updatedAt = new Date();
        await vehicleOwner.save();

        res.status(200).json({
            success: true,
            message: 'Password changed successfully'
        });

    } catch (error) {
        console.error('Change vehicle owner password error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error. Please try again later.'
        });
    }
};

// Upload Vehicle Owner Document
const uploadVehicleOwnerDocument = async (req, res) => {
    try {
        const { userId } = req.params;
        const { documentType } = req.body;

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No document file provided'
            });
        }

        if (!documentType) {
            return res.status(400).json({
                success: false,
                message: 'Document type is required'
            });
        }

        // Validate document type
        const validDocumentTypes = ['license', 'insurance', 'registration', 'identity'];
        if (!validDocumentTypes.includes(documentType)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid document type. Valid types: ' + validDocumentTypes.join(', ')
            });
        }

        const vehicleOwner = await VehicleOwner.findById(userId);
        if (!vehicleOwner) {
            return res.status(404).json({
                success: false,
                message: 'Vehicle owner not found'
            });
        }

        // File validation
        const fileSizeMB = req.file.size / (1024 * 1024);
        if (fileSizeMB > 10) {
            return res.status(400).json({
                success: false,
                message: 'File size must be less than 10MB'
            });
        }

        // Check if document of this type already exists and remove it
        const existingDocIndex = vehicleOwner.documents.findIndex(doc => doc.type === documentType);
        if (existingDocIndex !== -1) {
            // Remove old document (Cloudinary cleanup would be handled here in production)
            vehicleOwner.documents.splice(existingDocIndex, 1);
        }

        // Upload to Cloudinary
        const fileName = `${documentType}-${Date.now()}`;
        const uploadResult = await uploadToCloudinary(
            req.file.buffer,
            fileName,
            `pick-and-go/${documentType}s`
        );

        // Create new document record
        const document = {
            type: documentType,
            url: uploadResult.secure_url,
            publicId: uploadResult.public_id,
            originalName: req.file.originalname || '',
            fileSize: req.file.size || 0,
            mimeType: req.file.mimetype || '',
            uploadedAt: new Date(),
            status: 'pending_verification'
        };

        vehicleOwner.documents.push(document);
        vehicleOwner.updatedAt = new Date();

        await vehicleOwner.save();

        res.status(200).json({
            success: true,
            message: `${documentType.charAt(0).toUpperCase() + documentType.slice(1)} document uploaded successfully`,
            document: {
                type: document.type,
                url: document.url,
                originalName: document.originalName,
                fileSize: document.fileSize,
                uploadedAt: document.uploadedAt,
                status: document.status
            }
        });

    } catch (error) {
        console.error('Upload vehicle owner document error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error. Please try again later.'
        });
    }
};

// Delete Vehicle Owner Document
const deleteVehicleOwnerDocument = async (req, res) => {
    try {
        const { userId, documentType } = req.params;

        const vehicleOwner = await VehicleOwner.findById(userId);
        if (!vehicleOwner) {
            return res.status(404).json({
                success: false,
                message: 'Vehicle owner not found'
            });
        }

        // Find and remove the document
        const documentIndex = vehicleOwner.documents.findIndex(doc => doc.type === documentType);
        if (documentIndex === -1) {
            return res.status(404).json({
                success: false,
                message: 'Document not found'
            });
        }

        // Remove document from array
        vehicleOwner.documents.splice(documentIndex, 1);
        vehicleOwner.updatedAt = new Date();

        await vehicleOwner.save();

        res.status(200).json({
            success: true,
            message: `${documentType.charAt(0).toUpperCase() + documentType.slice(1)} document deleted successfully`
        });

    } catch (error) {
        console.error('Delete vehicle owner document error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error. Please try again later.'
        });
    }
};

// Get Vehicle Owner Documents
const getVehicleOwnerDocuments = async (req, res) => {
    try {
        const { userId } = req.params;

        const vehicleOwner = await VehicleOwner.findById(userId).select('documents');
        if (!vehicleOwner) {
            return res.status(404).json({
                success: false,
                message: 'Vehicle owner not found'
            });
        }

        res.status(200).json({
            success: true,
            documents: vehicleOwner.documents
        });

    } catch (error) {
        console.error('Get vehicle owner documents error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error. Please try again later.'
        });
    }
};

// Delete Vehicle Owner Profile
const deleteVehicleOwnerProfile = async (req, res) => {
    try {
        const { userId } = req.params;

        const vehicleOwner = await VehicleOwner.findById(userId);
        if (!vehicleOwner) {
            return res.status(404).json({
                success: false,
                message: 'Vehicle owner not found'
            });
        }

        // Set as inactive instead of deleting
        vehicleOwner.isActive = false;
        vehicleOwner.updatedAt = new Date();
        await vehicleOwner.save();

        res.status(200).json({
            success: true,
            message: 'Vehicle owner profile deleted successfully'
        });

    } catch (error) {
        console.error('Delete vehicle owner profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error. Please try again later.'
        });
    }
};

// Get All Vehicle Owners (Admin function)
const getAllVehicleOwners = async (req, res) => {
    try {
        const vehicleOwners = await VehicleOwner.find({ isActive: true }).select('-password');

        res.status(200).json({
            success: true,
            vehicleOwners: vehicleOwners
        });

    } catch (error) {
        console.error('Get all vehicle owners error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error. Please try again later.'
        });
    }
};

// Get Vehicle Owner Reviews
const getVehicleOwnerReviews = async (req, res) => {
    try {
        const { userId } = req.params;
        const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

        // Check if vehicle owner exists
        const vehicleOwner = await VehicleOwner.findById(userId);
        if (!vehicleOwner) {
            return res.status(404).json({
                success: false,
                message: 'Vehicle owner not found'
            });
        }

        // Get reviews with pagination
        const reviews = await Review.find({ vehicleOwnerId: userId })
            .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .select('-__v')
            .lean();

        // Get rating breakdown
        const ratingBreakdown = await Review.getRatingBreakdown(userId);

        // Get total count for pagination
        const totalReviews = await Review.countDocuments({ vehicleOwnerId: userId });

        res.status(200).json({
            success: true,
            reviews,
            ratingBreakdown,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(totalReviews / limit),
                totalReviews,
                hasNextPage: page * limit < totalReviews,
                hasPrevPage: page > 1
            }
        });

    } catch (error) {
        console.error('Get vehicle owner reviews error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error. Please try again later.'
        });
    }
};

// Add Review for Vehicle Owner (used by clients)
const addVehicleOwnerReview = async (req, res) => {
    try {
        const { userId } = req.params; // Vehicle Owner ID
        const { rating, comment, serviceType, bookingId, clientId, clientName } = req.body;

        // Validate required fields
        if (!rating || !clientId || !clientName) {
            return res.status(400).json({
                success: false,
                message: 'Rating, client ID, and client name are required'
            });
        }

        // Validate rating range
        if (rating < 1 || rating > 5) {
            return res.status(400).json({
                success: false,
                message: 'Rating must be between 1 and 5'
            });
        }

        // Check if vehicle owner exists
        const vehicleOwner = await VehicleOwner.findById(userId);
        if (!vehicleOwner) {
            return res.status(404).json({
                success: false,
                message: 'Vehicle owner not found'
            });
        }

        // Check if client has already reviewed this vehicle owner for this booking
        if (bookingId) {
            const existingReview = await Review.findOne({
                vehicleOwnerId: userId,
                clientId,
                bookingId
            });

            if (existingReview) {
                return res.status(400).json({
                    success: false,
                    message: 'You have already reviewed this service'
                });
            }
        }

        // Create new review
        const review = new Review({
            vehicleOwnerId: userId,
            clientId,
            clientName,
            rating,
            comment: comment || '',
            serviceType: serviceType || 'vehicle_rental',
            bookingId: bookingId || null
        });

        await review.save();

        res.status(201).json({
            success: true,
            message: 'Review added successfully',
            review: {
                _id: review._id,
                rating: review.rating,
                comment: review.comment,
                serviceType: review.serviceType,
                clientName: review.clientName,
                createdAt: review.createdAt
            }
        });

    } catch (error) {
        console.error('Add vehicle owner review error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error. Please try again later.'
        });
    }
};

module.exports = {
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
};
