const { Vehicle } = require('../models/VehicleModel');
const { VehicleOwner } = require('../models/VehicleOwnerModel');
const { uploadToCloudinary, deleteFromCloudinary } = require('../middleware/cloudinaryUpload');

// Add New Vehicle
const addVehicle = async (req, res) => {
    try {
        const { ownerId } = req.params;
        const vehicleData = req.body;

        // Verify vehicle owner exists
        const vehicleOwner = await VehicleOwner.findById(ownerId);
        if (!vehicleOwner) {
            return res.status(404).json({
                success: false,
                message: 'Vehicle owner not found'
            });
        }

        // Check if license plate already exists
        const existingVehicle = await Vehicle.findOne({
            licensePlate: vehicleData.licensePlate.toUpperCase()
        });
        if (existingVehicle) {
            return res.status(400).json({
                success: false,
                message: 'Vehicle with this license plate already exists'
            });
        }

        // Create new vehicle
        const newVehicle = new Vehicle({
            ...vehicleData,
            ownerId,
            licensePlate: vehicleData.licensePlate.toUpperCase(),
            status: 'pending'
        });

        await newVehicle.save();

        res.status(201).json({
            success: true,
            message: 'Vehicle added successfully and pending approval',
            vehicle: newVehicle
        });

    } catch (error) {
        console.error('Add vehicle error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error. Please try again later.'
        });
    }
};

// Upload Vehicle Images
const uploadVehicleImages = async (req, res) => {
    try {
        const { vehicleId } = req.params;
        const { description, isPrimary } = req.body;

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No image file provided'
            });
        }

        const vehicle = await Vehicle.findById(vehicleId);
        if (!vehicle) {
            return res.status(404).json({
                success: false,
                message: 'Vehicle not found'
            });
        }

        // Upload to Cloudinary
        const fileName = `vehicle-${vehicleId}-${Date.now()}`;
        const uploadResult = await uploadToCloudinary(
            req.file.buffer,
            fileName,
            'pick-and-go/vehicles'
        );

        // If this is set as primary, remove primary flag from other images
        if (isPrimary === 'true') {
            vehicle.images.forEach(img => img.isPrimary = false);
        }

        // Add new image
        const newImage = {
            url: uploadResult.secure_url,
            publicId: uploadResult.public_id,
            description: description || '',
            isPrimary: isPrimary === 'true' || vehicle.images.length === 0,
            uploadedAt: new Date()
        };

        vehicle.images.push(newImage);
        await vehicle.save();

        res.status(200).json({
            success: true,
            message: 'Vehicle image uploaded successfully',
            image: newImage
        });

    } catch (error) {
        console.error('Upload vehicle image error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error. Please try again later.'
        });
    }
};

// Get Vehicles by Owner
const getVehiclesByOwner = async (req, res) => {
    try {
        const { ownerId } = req.params;
        const { status } = req.query;

        const vehicles = await Vehicle.getByOwner(ownerId, status);

        res.status(200).json({
            success: true,
            vehicles,
            count: vehicles.length
        });

    } catch (error) {
        console.error('Get vehicles by owner error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error. Please try again later.'
        });
    }
};

// Get Single Vehicle Details
const getVehicleDetails = async (req, res) => {
    try {
        const { vehicleId } = req.params;

        const vehicle = await Vehicle.findById(vehicleId)
            .populate('ownerId', 'firstName lastName email phone rating')
            .populate('approvalDetails.approvedBy', 'firstName lastName email');

        if (!vehicle) {
            return res.status(404).json({
                success: false,
                message: 'Vehicle not found'
            });
        }

        res.status(200).json({
            success: true,
            vehicle
        });

    } catch (error) {
        console.error('Get vehicle details error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error. Please try again later.'
        });
    }
};

// Update Vehicle
const updateVehicle = async (req, res) => {
    try {
        const { vehicleId } = req.params;
        const updateData = req.body;

        const vehicle = await Vehicle.findById(vehicleId);
        if (!vehicle) {
            return res.status(404).json({
                success: false,
                message: 'Vehicle not found'
            });
        }

        // Don't allow updating certain fields if vehicle is approved
        if (vehicle.status === 'approved' || vehicle.status === 'available') {
            const restrictedFields = ['make', 'model', 'year', 'licensePlate', 'vehicleType'];
            const hasRestrictedUpdates = restrictedFields.some(field =>
                updateData.hasOwnProperty(field) && updateData[field] !== vehicle[field]
            );

            if (hasRestrictedUpdates) {
                return res.status(400).json({
                    success: false,
                    message: 'Cannot modify vehicle specifications after approval. Contact support for major changes.'
                });
            }
        }

        // Update vehicle
        Object.assign(vehicle, updateData);
        await vehicle.save();

        res.status(200).json({
            success: true,
            message: 'Vehicle updated successfully',
            vehicle
        });

    } catch (error) {
        console.error('Update vehicle error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error. Please try again later.'
        });
    }
};

// Delete Vehicle
const deleteVehicle = async (req, res) => {
    try {
        const { vehicleId } = req.params;

        const vehicle = await Vehicle.findById(vehicleId);
        if (!vehicle) {
            return res.status(404).json({
                success: false,
                message: 'Vehicle not found'
            });
        }

        // Check if vehicle can be deleted
        if (vehicle.status === 'rented') {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete vehicle that is currently rented'
            });
        }

        // Delete images from Cloudinary
        for (const image of vehicle.images) {
            try {
                await deleteFromCloudinary(image.publicId);
            } catch (deleteError) {
                console.error('Error deleting image from Cloudinary:', deleteError);
            }
        }

        await Vehicle.findByIdAndDelete(vehicleId);

        res.status(200).json({
            success: true,
            message: 'Vehicle deleted successfully'
        });

    } catch (error) {
        console.error('Delete vehicle error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error. Please try again later.'
        });
    }
};

// Add Maintenance Schedule
const addMaintenanceSchedule = async (req, res) => {
    try {
        const { vehicleId } = req.params;
        const { title, description, startDate, endDate, type } = req.body;

        const vehicle = await Vehicle.findById(vehicleId);
        if (!vehicle) {
            return res.status(404).json({
                success: false,
                message: 'Vehicle not found'
            });
        }

        const maintenanceData = {
            title,
            description,
            startDate: new Date(startDate),
            endDate: new Date(endDate),
            type: type || 'scheduled_maintenance'
        };

        // Validate dates
        if (maintenanceData.startDate >= maintenanceData.endDate) {
            return res.status(400).json({
                success: false,
                message: 'End date must be after start date'
            });
        }

        await vehicle.addMaintenanceSchedule(maintenanceData);

        res.status(200).json({
            success: true,
            message: 'Maintenance scheduled successfully',
            maintenance: maintenanceData
        });

    } catch (error) {
        console.error('Add maintenance schedule error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error. Please try again later.'
        });
    }
};

// Update Maintenance Schedule
const updateMaintenanceSchedule = async (req, res) => {
    try {
        const { vehicleId, maintenanceId } = req.params;
        const updateData = req.body;

        const vehicle = await Vehicle.findById(vehicleId);
        if (!vehicle) {
            return res.status(404).json({
                success: false,
                message: 'Vehicle not found'
            });
        }

        const maintenance = vehicle.maintenanceSchedule.id(maintenanceId);
        if (!maintenance) {
            return res.status(404).json({
                success: false,
                message: 'Maintenance schedule not found'
            });
        }

        // Update maintenance
        Object.assign(maintenance, updateData);

        // Update vehicle status if needed
        const now = new Date();
        if (maintenance.status === 'in_progress' ||
            (maintenance.status === 'scheduled' && maintenance.startDate <= now && maintenance.endDate > now)) {
            vehicle.status = 'maintenance';
        } else if (maintenance.status === 'completed' || maintenance.status === 'cancelled') {
            // Check if there are other active maintenances
            const hasActiveMaintenance = vehicle.maintenanceSchedule.some(m =>
                m._id.toString() !== maintenanceId &&
                m.status === 'in_progress' ||
                (m.status === 'scheduled' && m.startDate <= now && m.endDate > now)
            );

            if (!hasActiveMaintenance && vehicle.status === 'maintenance') {
                vehicle.status = 'available';
            }
        }

        await vehicle.save();

        res.status(200).json({
            success: true,
            message: 'Maintenance schedule updated successfully',
            maintenance
        });

    } catch (error) {
        console.error('Update maintenance schedule error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error. Please try again later.'
        });
    }
};

// Get Vehicle Maintenance Schedule
const getMaintenanceSchedule = async (req, res) => {
    try {
        const { vehicleId } = req.params;
        const { status } = req.query;

        const vehicle = await Vehicle.findById(vehicleId);
        if (!vehicle) {
            return res.status(404).json({
                success: false,
                message: 'Vehicle not found'
            });
        }

        let maintenanceSchedule = vehicle.maintenanceSchedule;

        if (status) {
            maintenanceSchedule = maintenanceSchedule.filter(m => m.status === status);
        }

        res.status(200).json({
            success: true,
            maintenanceSchedule: maintenanceSchedule.sort((a, b) => new Date(b.startDate) - new Date(a.startDate))
        });

    } catch (error) {
        console.error('Get maintenance schedule error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error. Please try again later.'
        });
    }
};

// Business Owner Functions

// Get Pending Vehicles for Approval
const getPendingVehicles = async (req, res) => {
    try {
        const vehicles = await Vehicle.find({ status: 'pending' })
            .populate('ownerId', 'firstName lastName email phone rating')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            vehicles,
            count: vehicles.length
        });

    } catch (error) {
        console.error('Get pending vehicles error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error. Please try again later.'
        });
    }
};

// Approve Vehicle
const approveVehicle = async (req, res) => {
    try {
        const { vehicleId } = req.params;
        const { businessOwnerId } = req.params;
        const { dailyRate, weeklyRate, monthlyRate, approvalNotes } = req.body;

        const vehicle = await Vehicle.findById(vehicleId);
        if (!vehicle) {
            return res.status(404).json({
                success: false,
                message: 'Vehicle not found'
            });
        }

        if (vehicle.status !== 'pending') {
            return res.status(400).json({
                success: false,
                message: 'Vehicle is not pending approval'
            });
        }

        // Update vehicle with approval details
        vehicle.status = 'available';
        vehicle.availability.isAvailable = true;
        vehicle.rentalPrice.dailyRate = dailyRate || 0;
        vehicle.rentalPrice.weeklyRate = weeklyRate || 0;
        vehicle.rentalPrice.monthlyRate = monthlyRate || 0;
        vehicle.approvalDetails = {
            approvedBy: businessOwnerId,
            approvedAt: new Date(),
            approvalNotes: approvalNotes || ''
        };

        await vehicle.save();

        res.status(200).json({
            success: true,
            message: 'Vehicle approved successfully',
            vehicle
        });

    } catch (error) {
        console.error('Approve vehicle error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error. Please try again later.'
        });
    }
};

// Reject Vehicle
const rejectVehicle = async (req, res) => {
    try {
        const { vehicleId } = req.params;
        const { businessOwnerId } = req.params;
        const { rejectionReason } = req.body;

        const vehicle = await Vehicle.findById(vehicleId);
        if (!vehicle) {
            return res.status(404).json({
                success: false,
                message: 'Vehicle not found'
            });
        }

        if (vehicle.status !== 'pending') {
            return res.status(400).json({
                success: false,
                message: 'Vehicle is not pending approval'
            });
        }

        // Update vehicle with rejection details
        vehicle.status = 'rejected';
        vehicle.approvalDetails = {
            approvedBy: businessOwnerId,
            approvedAt: new Date(),
            rejectionReason: rejectionReason || 'No reason provided'
        };

        await vehicle.save();

        res.status(200).json({
            success: true,
            message: 'Vehicle rejected',
            vehicle
        });

    } catch (error) {
        console.error('Reject vehicle error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error. Please try again later.'
        });
    }
};

// Upload Vehicle Document
const uploadVehicleDocument = async (req, res) => {
    try {
        const { vehicleId } = req.params;
        const { documentType } = req.body;

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No document file provided'
            });
        }

        const vehicle = await Vehicle.findById(vehicleId);
        if (!vehicle) {
            return res.status(404).json({
                success: false,
                message: 'Vehicle not found'
            });
        }

        // Validate document type
        const validDocumentTypes = ['insurance', 'registration', 'emissionTest'];
        if (!validDocumentTypes.includes(documentType)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid document type'
            });
        }

        // Upload to Cloudinary
        const result = await uploadToCloudinary(req.file.path, `vehicles/${vehicleId}/documents`);

        // Update vehicle document in database
        const documentData = {
            url: result.secure_url,
            publicId: result.public_id,
            fileName: req.file.originalname,
            uploadedAt: new Date()
        };

        // Update the specific document type
        vehicle.documents = vehicle.documents || {};
        vehicle.documents[documentType] = documentData;

        await vehicle.save();

        res.status(200).json({
            success: true,
            message: `${documentType} document uploaded successfully`,
            document: documentData
        });

    } catch (error) {
        console.error('Upload vehicle document error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error. Please try again later.'
        });
    }
};

// Get Available Vehicles for Rental
const getAvailableVehicles = async (req, res) => {
    try {
        const filters = req.query;
        const vehicles = await Vehicle.getAvailableVehicles(filters);

        res.status(200).json({
            success: true,
            vehicles,
            count: vehicles.length
        });

    } catch (error) {
        console.error('Get available vehicles error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error. Please try again later.'
        });
    }
};

module.exports = {
    addVehicle,
    uploadVehicleImages,
    getVehiclesByOwner,
    getVehicleDetails,
    updateVehicle,
    deleteVehicle,
    addMaintenanceSchedule,
    updateMaintenanceSchedule,
    getMaintenanceSchedule,
    getPendingVehicles,
    approveVehicle,
    rejectVehicle,
    uploadVehicleDocument,
    getAvailableVehicles
};
