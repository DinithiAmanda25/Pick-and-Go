const { User, Admin, BusinessOwner, Driver, Client, VehicleOwner } = require('../models/UserModel');
const { uploadToCloudinary } = require('../middleware/cloudinaryUpload');

// Helper function to find user by email and role
const findUserByEmail = async (email, role = null) => {
  try {
    // Use the appropriate model based on role
    if (role === 'driver') {
      const user = await Driver.findOne({ email, isActive: true });
      return user ? { user, role: 'driver' } : null;
    } else if (role === 'client') {
      const user = await Client.findOne({ email, isActive: true });
      return user ? { user, role: 'client' } : null;
    } else if (role === 'vehicle_owner') {
      const user = await VehicleOwner.findOne({ email, isActive: true });
      return user ? { user, role: 'vehicle_owner' } : null;
    } else if (role === 'admin') {
      const user = await Admin.findOne({ email, isActive: true });
      return user ? { user, role: 'admin' } : null;
    } else if (role === 'business_owner') {
      const user = await BusinessOwner.findOne({ email, isActive: true });
      return user ? { user, role: 'business_owner' } : null;
    } else {
      // Check all models if no specific role is provided
      const models = [
        { model: Admin, role: 'admin' },
        { model: BusinessOwner, role: 'business_owner' },
        { model: Driver, role: 'driver' },
        { model: Client, role: 'client' },
        { model: VehicleOwner, role: 'vehicle_owner' }
      ];
      for (const { model, role } of models) {
        const user = await model.findOne({ email, isActive: true });
        if (user) return { user, role };
      }
      return null;
    }
  } catch (error) {
    console.error('Error finding user by email:', error);
    return null;
  }
};

// Helper function to find all user roles for an email
// Helper function to find all users with the same email (for multiple role support)
const findAllUserRolesByEmail = async (email) => {
  try {
    const results = [];
    const models = [
      { model: Admin, role: 'admin' },
      { model: BusinessOwner, role: 'business_owner' },
      { model: Driver, role: 'driver' },
      { model: Client, role: 'client' },
      { model: VehicleOwner, role: 'vehicle_owner' }
    ];

    for (const { model, role } of models) {
      const user = await model.findOne({ email, isActive: true });
      if (user) {
        results.push({ user, role });
      }
    }
    return results;
  } catch (error) {
    console.error('Error finding user roles by email:', error);
    return [];
  }
};

// Helper function to find user by username (for admin/business owner)
const findUserByUsername = async (username) => {
  try {
    // Check Admin
    const admin = await Admin.findOne({ username, isActive: true });
    if (admin) return { user: admin, role: 'admin' };

    // Check Business Owner
    const businessOwner = await BusinessOwner.findOne({ username, isActive: true });
    if (businessOwner) return { user: businessOwner, role: 'business_owner' };

    return null;
  } catch (error) {
    console.error('Error finding user by username:', error);
    return null;
  }
};// Login Controller
const login = async (req, res) => {
  try {
    console.log('Login attempt received');
    console.log('Request body:', req.body);

    const { identifier, password } = req.body;

    if (!identifier || !password) {
      console.log('Missing credentials');
      return res.status(400).json({
        success: false,
        message: 'Please provide email/username and password'
      });
    }

    let userResult = null;

    console.log('Searching for user with identifier:', identifier);

    // First, try to find by email across all collections
    userResult = await findUserByEmail(identifier);
    console.log('Email search result:', userResult);

    // If not found by email, try to find by username (for admin/business owner)
    if (!userResult) {
      console.log('Not found by email, trying username...');
      userResult = await findUserByUsername(identifier);
      console.log('Username search result:', userResult);
    }

    if (!userResult) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const { user, role } = userResult;

    // Simple password check (no bcrypt for now)
    if (user.password !== password) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    // Check if driver is approved
    if (role === 'driver' && user.status !== 'approved') {
      return res.status(401).json({
        success: false,
        message: 'Your account is pending approval. Please contact support.'
      });
    }

    // Prepare user data (excluding password)
    const userData = {
      id: user._id,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt
    };

    // Add role-specific data
    switch (role) {
      case 'admin':
        userData.username = user.username;
        userData.fullName = user.fullName;
        break;
      case 'business_owner':
        userData.username = user.username;
        userData.businessName = user.businessName;
        userData.contactNumber = user.contactNumber;
        userData.ownerName = user.ownerName;
        userData.businessType = user.businessType;
        userData.businessAddress = user.businessAddress;
        userData.businessLicense = user.businessLicense;
        userData.taxId = user.taxId;
        userData.website = user.website;
        userData.description = user.description;
        break;
      case 'driver':
        userData.driverId = user.driverId;
        userData.fullName = user.fullName;
        userData.phone = user.phone;
        userData.status = user.status;
        break;
      case 'client':
        userData.firstName = user.firstName;
        userData.lastName = user.lastName;
        userData.phone = user.phone;
        break;
      case 'vehicle_owner':
        userData.firstName = user.firstName;
        userData.lastName = user.lastName;
        userData.phone = user.phone;
        break;
    }

    res.status(200).json({
      success: true,
      message: 'Login successful',
      user: userData,
      dashboardRoute: getDashboardRoute(role)
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
};

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

    if (!firstName || !lastName || !email || !password || !phone || !dateOfBirth) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    // Check if email already exists
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered'
      });
    }

    // Create new client
    const newClient = new Client({
      role: 'client',
      firstName,
      lastName,
      email,
      password, // Store as plain text for now
      phone,
      dateOfBirth,
      address,
      preferences,
      isActive: true
    });

    await newClient.save();

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      user: {
        id: newClient._id,
        firstName: newClient.firstName,
        lastName: newClient.lastName,
        email: newClient.email,
        role: newClient.role
      }
    });

  } catch (error) {
    console.error('Client registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
};

// Register Business Owner
const registerBusinessOwner = async (req, res) => {
  try {
    const {
      username,
      email,
      password,
      businessName,
      contactNumber,
      ownerName,
      businessType,
      businessAddress,
      businessLicense,
      taxId,
      website,
      description
    } = req.body;

    // Validation
    if (!username || !email || !password || !businessName || !contactNumber) {
      return res.status(400).json({
        success: false,
        message: 'Username, email, password, business name, and contact number are required'
      });
    }

    // Check if business owner already exists
    const existingBusinessOwner = await BusinessOwner.findOne({
      $or: [{ email }, { username }]
    });

    if (existingBusinessOwner) {
      return res.status(400).json({
        success: false,
        message: 'Business owner with this email or username already exists'
      });
    }

    // Create new business owner (storing password as plain text for now)
    const newBusinessOwner = new BusinessOwner({
      username,
      email,
      password, // Plain text password (matching current system)
      businessName,
      contactNumber,
      ownerName,
      businessType,
      businessAddress,
      businessLicense,
      taxId,
      website,
      description,
      isActive: true,
      role: 'business_owner'
    });

    await newBusinessOwner.save();

    res.status(201).json({
      success: true,
      message: 'Business owner registered successfully',
      user: {
        id: newBusinessOwner._id,
        username: newBusinessOwner.username,
        email: newBusinessOwner.email,
        businessName: newBusinessOwner.businessName,
        contactNumber: newBusinessOwner.contactNumber,
        role: newBusinessOwner.role
      }
    });

  } catch (error) {
    console.error('Business owner registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
};

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

    if (!firstName || !lastName || !email || !password || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    // Check if email already exists
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered'
      });
    }

    // Create new vehicle owner
    const newVehicleOwner = new VehicleOwner({
      role: 'vehicle_owner',
      firstName,
      lastName,
      email,
      password, // Store as plain text for now
      phone,
      address,
      isActive: true
    });

    await newVehicleOwner.save();

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      user: {
        id: newVehicleOwner._id,
        firstName: newVehicleOwner.firstName,
        lastName: newVehicleOwner.lastName,
        email: newVehicleOwner.email,
        role: newVehicleOwner.role
      }
    });

  } catch (error) {
    console.error('Vehicle Owner registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
};

// Register Driver (through onboarding)
const registerDriver = async (req, res) => {
  try {
    console.log('🚀 Driver registration request received');
    console.log('📝 Body:', req.body);
    console.log('📁 Files:', req.files);

    const {
      fullName,
      email,
      phone,
      dateOfBirth,
      licenseNumber,
      licenseExpiryDate,
      vehicleType,
      yearsOfExperience,
      address,
      emergencyContact
    } = req.body;

    console.log('✅ Required fields extracted:', {
      fullName,
      email,
      phone,
      licenseNumber,
      vehicleType
    });

    // Validate required fields
    if (!fullName || !email || !phone || !licenseNumber || !vehicleType) {
      console.log('❌ Missing required fields');
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    console.log('🔍 Checking for existing driver with email:', email);
    // Check if email already exists
    const existingUser = await Driver.findOne({ email });
    if (existingUser) {
      console.log('❌ Email already exists');
      return res.status(400).json({
        success: false,
        message: 'Email already registered'
      });
    }

    console.log('🔑 Generating credentials...');
    // Generate temporary password
    const tempPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-4).toUpperCase();

    // Generate driver ID
    const driverId = 'DRV' + Date.now().toString().slice(-6);
    console.log('🆔 Generated Driver ID:', driverId);

    // Parse address and emergency contact if they are strings
    let parsedAddress = address;
    let parsedEmergencyContact = emergencyContact;

    console.log('📍 Processing address and emergency contact...');

    if (typeof address === 'string') {
      try {
        parsedAddress = JSON.parse(address);
        console.log('✅ Address parsed successfully');
      } catch (e) {
        console.log('⚠️ Address parsing failed, using fallback');
        parsedAddress = { street: address, city: '', state: '', zipCode: '', country: 'Sri Lanka' };
      }
    }

    if (typeof emergencyContact === 'string') {
      try {
        parsedEmergencyContact = JSON.parse(emergencyContact);
        console.log('✅ Emergency contact parsed successfully');
      } catch (e) {
        console.log('⚠️ Emergency contact parsing failed, using fallback');
        parsedEmergencyContact = { name: '', phone: '', relationship: '' };
      }
    }

    console.log('📄 Processing uploaded files...');
    // Process uploaded files with Cloudinary
    const documents = [];
    if (req.files) {
      console.log('📄 Processing uploaded files with Cloudinary...');

      for (const fieldName of Object.keys(req.files)) {
        if (req.files[fieldName] && req.files[fieldName][0]) {
          const file = req.files[fieldName][0];

          try {
            // Generate unique filename
            const timestamp = Date.now();
            const fileName = `${fieldName}_${driverId}_${timestamp}`;

            console.log(`📤 Uploading ${fieldName} to Cloudinary...`);

            // Upload to Cloudinary
            const cloudinaryResult = await uploadToCloudinary(
              file.buffer,
              fileName,
              'pick-and-go/driver-documents'
            );

            const documentObj = {
              type: fieldName,
              url: cloudinaryResult.secure_url,
              publicId: cloudinaryResult.public_id,
              uploadedAt: new Date()
            };

            documents.push(documentObj);
            console.log(`✅ File uploaded to Cloudinary: ${fieldName}`, {
              url: cloudinaryResult.secure_url,
              publicId: cloudinaryResult.public_id
            });

          } catch (uploadError) {
            console.error(`❌ Error uploading ${fieldName} to Cloudinary:`, uploadError);
            // Continue with other files even if one fails
          }
        }
      }
    }

    console.log('📋 Final documents array:', JSON.stringify(documents, null, 2));
    console.log('📊 Documents array length:', documents.length);
    console.log('📦 Documents array type:', Array.isArray(documents));

    console.log('💾 Creating new driver record...');
    // Create new driver user
    const newDriver = new Driver({
      role: 'driver',
      fullName,
      email,
      password: tempPassword, // Will be hashed by pre-save middleware
      phone,
      dateOfBirth,

      // Driver specific fields
      driverId,
      licenseNumber,
      licenseExpiryDate,
      vehicleType,
      yearsOfExperience: yearsOfExperience ? parseInt(yearsOfExperience) : 0,
      address: parsedAddress,
      emergencyContact: parsedEmergencyContact,
      documents: documents,
      status: 'pending',
      isActive: true
    });

    console.log('🔥 Saving driver to database...');
    await newDriver.save();
    console.log('✅ Driver saved successfully!');

    // TODO: Send email with credentials using nodemailer
    console.log(`🔑 Driver credentials - Email: ${email}, Password: ${tempPassword}, Driver ID: ${driverId}`);

    console.log('📤 Sending success response...');
    res.status(201).json({
      success: true,
      message: 'Driver application submitted successfully. You will receive login credentials via email once approved.',
      driver: {
        id: newDriver._id,
        driverId: newDriver.driverId,
        fullName: newDriver.fullName,
        email: newDriver.email,
        status: newDriver.status,
        role: newDriver.role,
        documentsUploaded: documents.map(doc => doc.type)
      }
    });

  } catch (error) {
    console.error('❌ Driver registration error:', error);
    console.error('📍 Error stack:', error.stack);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Get user profile
const getProfile = async (req, res) => {
  try {
    const { userId, role } = req.params;

    let user = null;
    switch (role) {
      case 'admin':
        user = await Admin.findById(userId).select('-password');
        break;
      case 'business_owner':
        user = await BusinessOwner.findById(userId).select('-password');
        break;
      case 'driver':
        user = await Driver.findById(userId).select('-password');
        break;
      case 'client':
        user = await Client.findById(userId).select('-password');
        break;
      case 'vehicle_owner':
        user = await VehicleOwner.findById(userId).select('-password');
        break;
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid role'
        });
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.status(200).json({
      success: true,
      user
    });

  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
};

// Helper function to get dashboard route based on role
const getDashboardRoute = (role) => {
  const routes = {
    admin: '/admin-dashboard',
    business_owner: '/business-owner-dashboard',
    driver: '/driver-dashboard',
    client: '/client-dashboard',
    vehicle_owner: '/vehicle-owner-dashboard'
  };
  return routes[role] || '/';
};

// Approve Driver (Admin function)
const approveDriver = async (req, res) => {
  try {
    const { driverId } = req.params;
    const { status } = req.body; // 'approved' or 'rejected'

    const driver = await Driver.findById(driverId);
    if (!driver) {
      return res.status(404).json({
        success: false,
        message: 'Driver not found'
      });
    }

    driver.status = status;
    if (status === 'approved') {
      driver.approvedAt = new Date();
    }

    await driver.save();

    // TODO: Send email notification to driver
    console.log(`Driver ${driver.fullName} has been ${status}`);

    res.status(200).json({
      success: true,
      message: `Driver ${status} successfully`,
      driver: {
        id: driver._id,
        fullName: driver.fullName,
        email: driver.email,
        status: driver.status
      }
    });

  } catch (error) {
    console.error('Approve driver error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
};

// Update Business Owner Profile
const updateBusinessOwnerProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const updateData = req.body;

    console.log('Backend - Update profile request for userId:', userId);
    console.log('Backend - Update data:', updateData);

    // Find the business owner
    const businessOwner = await BusinessOwner.findById(userId);
    if (!businessOwner) {
      console.log('Backend - Business owner not found');
      return res.status(404).json({
        success: false,
        message: 'Business owner not found'
      });
    }

    console.log('Backend - Found business owner:', businessOwner.email);

    // Fields that can be updated
    const allowedUpdates = [
      'businessName', 'contactNumber', 'ownerName', 'businessType',
      'businessAddress', 'businessLicense', 'taxId', 'website', 'description'
    ];

    // Update only allowed fields
    allowedUpdates.forEach(field => {
      if (updateData[field] !== undefined) {
        console.log(`Backend - Updating ${field}: ${JSON.stringify(updateData[field])}`);
        businessOwner[field] = updateData[field];
      }
    });

    businessOwner.updatedAt = new Date();
    await businessOwner.save();

    console.log('Backend - Profile saved successfully');

    // Return updated profile data (excluding password)
    const updatedProfile = await BusinessOwner.findById(userId).select('-password');

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      profile: updatedProfile
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
    });
  }
};

module.exports = {
  login,
  registerClient,
  registerBusinessOwner,
  registerVehicleOwner,
  registerDriver,
  getProfile,
  approveDriver,
  updateBusinessOwnerProfile
};
