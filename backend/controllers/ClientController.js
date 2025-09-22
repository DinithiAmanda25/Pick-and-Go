const { Client } = require('../models/ClientModel');
const { uploadToCloudinary } = require('../middleware/cloudinaryUpload');

// Register Client
const registerClient = async (req, res) => {
    try {
        const {
            firstName,
            lastName,
            email,
            password,
            phone,
            dateOfBirth,
            address,
            preferences
        } = req.body;

        // Check if client already exists
        const existingClient = await Client.findOne({ email });
        if (existingClient) {
            return res.status(400).json({
                success: false,
                message: 'Email already registered'
            });
        }

        // Create new client
        const client = new Client({
            firstName,
            lastName,
            email,
            password,
            phone,
            role: 'client',
            dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
            address,
            preferences: preferences || {}
        });

        await client.save();

        // Return client data (excluding password)
        const clientData = client.toObject();
        delete clientData.password;

        res.status(201).json({
            success: true,
            message: 'Client registered successfully',
            client: clientData
        });

    } catch (error) {
        console.error('Register client error:', error);
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

// Client Login
const clientLogin = async (req, res) => {
    try {
        const { identifier, password } = req.body;

        if (!identifier || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email and password'
            });
        }

        // Find client by email
        const client = await Client.findOne({ email: identifier, isActive: true });

        if (!client) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Simple password check
        if (client.password !== password) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }

        // Prepare client data (excluding password)
        const clientData = {
            id: client._id,
            firstName: client.firstName,
            lastName: client.lastName,
            email: client.email,
            phone: client.phone,
            dateOfBirth: client.dateOfBirth ? client.dateOfBirth.toISOString().split('T')[0] : '',// Format as YYYY-MM-DD
            address: client.address,
            preferences: client.preferences,
            profileImage: client.profileImage,
            role: client.role,
            createdAt: client.createdAt
        };

        res.status(200).json({
            success: true,
            message: 'Login successful',
            user: clientData,
            dashboardRoute: '/client/dashboard'
        });

    } catch (error) {
        console.error('Client login error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error. Please try again later.'
        });
    }
};

// Get Client Profile
const getClientProfile = async (req, res) => {
    try {
        const { userId } = req.params;

        const client = await Client.findById(userId).select('-password');
        if (!client) {
            return res.status(404).json({
                success: false,
                message: 'Client not found'
            });
        }

        res.status(200).json({
            success: true,
            client: client
        });
    } catch (error) {
        console.error('Get client profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error. Please try again later.'
        });
    }
};

// Update Client Profile
const updateClientProfile = async (req, res) => {
    try {
        const { userId } = req.params;
        const {
            firstName,
            lastName,
            email,
            phone,
            dateOfBirth,
            address,
            preferences
        } = req.body;

        console.log('Updating client profile for user:', userId);
        console.log('Update data received:', req.body);

        // Validate required fields
        if (!firstName || !lastName || !email || !phone) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields'
            });
        }

        // Check if client exists
        const client = await Client.findById(userId);
        if (!client) {
            return res.status(404).json({
                success: false,
                message: 'Client not found'
            });
        }

        // Check for duplicate email if changed
        if (email !== client.email) {
            const existingEmail = await Client.findOne({ email, _id: { $ne: userId } });
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
            preferences: preferences || {},
            updatedAt: new Date()
        };

        // Handle date of birth
        if (dateOfBirth) {
            updateData.dateOfBirth = new Date(dateOfBirth);
        }

        console.log('Update data to be saved:', updateData);

        // Update client
        const updatedClient = await Client.findByIdAndUpdate(
            userId,
            updateData,
            { new: true, runValidators: true }
        ).select('-password');

        console.log('Client updated successfully:', updatedClient);

        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
            client: updatedClient
        });

    } catch (error) {
        console.error('Update client profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error. Please try again later.'
        });
    }
};

// Upload Client Profile Image
const uploadClientProfileImage = async (req, res) => {
    try {
        const { userId } = req.params;

        console.log('Uploading profile image for user:', userId);
        console.log('File received:', req.file);

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No image file provided'
            });
        }

        const client = await Client.findById(userId);
        if (!client) {
            return res.status(404).json({
                success: false,
                message: 'Client not found'
            });
        }

        // Delete old profile image if exists
        if (client.profileImage && client.profileImage.publicId) {
            // Add cloudinary deletion logic here if needed
        }

        // Update profile image
        client.profileImage = {
            url: req.file.path,
            publicId: req.file.filename,
            uploadedAt: new Date()
        };
        client.updatedAt = new Date();

        await client.save();

        console.log('Profile image uploaded successfully');

        res.status(200).json({
            success: true,
            message: 'Profile image uploaded successfully',
            profileImage: client.profileImage
        });

    } catch (error) {
        console.error('Upload profile image error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error. Please try again later.'
        });
    }
};

// Change Client Password
const changeClientPassword = async (req, res) => {
    try {
        const { userId } = req.params;
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                success: false,
                message: 'Please provide current and new password'
            });
        }

        const client = await Client.findById(userId);
        if (!client) {
            return res.status(404).json({
                success: false,
                message: 'Client not found'
            });
        }

        // Check current password
        if (client.password !== currentPassword) {
            return res.status(400).json({
                success: false,
                message: 'Current password is incorrect'
            });
        }

        // Update password
        client.password = newPassword;
        client.updatedAt = new Date();
        await client.save();

        res.status(200).json({
            success: true,
            message: 'Password changed successfully'
        });

    } catch (error) {
        console.error('Change password error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error. Please try again later.'
        });
    }
};

// Delete Client Profile
const deleteClientProfile = async (req, res) => {
    try {
        const { userId } = req.params;

        const client = await Client.findById(userId);
        if (!client) {
            return res.status(404).json({
                success: false,
                message: 'Client not found'
            });
        }

        // Set as inactive instead of deleting
        client.isActive = false;
        client.updatedAt = new Date();
        await client.save();

        res.status(200).json({
            success: true,
            message: 'Profile deleted successfully'
        });

    } catch (error) {
        console.error('Delete client profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error. Please try again later.'
        });
    }
};

// Get All Clients (Admin function)
const getAllClients = async (req, res) => {
    try {
        const clients = await Client.find({ isActive: true }).select('-password');

        res.status(200).json({
            success: true,
            clients: clients
        });

    } catch (error) {
        console.error('Get all clients error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error. Please try again later.'
        });
    }
};

module.exports = {
    registerClient,
    clientLogin,
    getClientProfile,
    updateClientProfile,
    uploadClientProfileImage,
    changeClientPassword,
    deleteClientProfile,
    getAllClients
};
