const { Admin, BusinessOwner, Driver, Client, VehicleOwner } = require('../models/UserModel');

// Helper function to find user by email across all collections
const findUserByEmail = async (email) => {
  const collections = [
    { model: Admin, role: 'admin' },
    { model: BusinessOwner, role: 'business_owner' },
    { model: Driver, role: 'driver' },
    { model: Client, role: 'client' },
    { model: VehicleOwner, role: 'vehicle_owner' }
  ];

  for (const { model, role } of collections) {
    const user = await model.findOne({ email, isActive: true });
    if (user) {
      return { user, role };
    }
  }
  return null;
};

// Helper function to find all user roles for an email
const findAllUserRolesByEmail = async (email) => {
  const collections = [
    { model: Admin, role: 'admin' },
    { model: BusinessOwner, role: 'business_owner' },
    { model: Driver, role: 'driver' },
    { model: Client, role: 'client' },
    { model: VehicleOwner, role: 'vehicle_owner' }
  ];

  const results = [];
  for (const { model, role } of collections) {
    const user = await model.findOne({ email, isActive: true });
    if (user) {
      results.push({ user, role });
    }
  }
  return results;
};

// Helper function to find user by username (for admin/business owner)
const findUserByUsername = async (username) => {
  // Check Admin
  const admin = await Admin.findOne({ username, isActive: true });
  if (admin) return { user: admin, role: 'admin' };

  // Check Business Owner
  const businessOwner = await BusinessOwner.findOne({ username, isActive: true });
  if (businessOwner) return { user: businessOwner, role: 'business_owner' };

  return null;
};

// Login Controller
const login = async (req, res) => {
  try {
    const { identifier, password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email/username and password'
      });
    }

    let userResult = null;

    // First, try to find by email across all collections
    userResult = await findUserByEmail(identifier);
    
    // If not found by email, try to find by username (for admin/business owner)
    if (!userResult) {
      userResult = await findUserByUsername(identifier);
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

    // Check if email already exists for clients
    const existingClient = await Client.findOne({ email, isActive: true });
    if (existingClient) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered as a client'
      });
    }

    // Create new client
    const newClient = new Client({
      firstName,
      lastName,
      email,
      password, // Store as plain text for now
      phone,
      dateOfBirth,
      address,
      preferences,
      role: 'client'
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

    // Check if email already exists for vehicle owners
    const existingVehicleOwner = await VehicleOwner.findOne({ email, isActive: true });
    if (existingVehicleOwner) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered as a vehicle owner'
      });
    }

    // Create new vehicle owner
    const newVehicleOwner = new VehicleOwner({
      firstName,
      lastName,
      email,
      password, // Store as plain text for now
      phone,
      address,
      role: 'vehicle_owner'
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
    const { 
      fullName,
      email,
      phone,
      licenseNumber,
      vehicleType,
      address,
      emergencyContact,
      documents
    } = req.body;

    if (!fullName || !email || !phone || !licenseNumber || !vehicleType || !address) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    // Check if email already exists for drivers
    const existingDriver = await Driver.findOne({ email, isActive: true });
    if (existingDriver) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered as a driver'
      });
    }

    // Generate temporary password
    const tempPassword = Math.random().toString(36).slice(-8);
    
    // Generate driver ID
    const driverId = 'DRV' + Date.now().toString().slice(-6);

    // Create new driver
    const newDriver = new Driver({
      fullName,
      email,
      password: tempPassword, // Temporary password
      phone,
      licenseNumber,
      vehicleType,
      address,
      emergencyContact,
      documents,
      driverId,
      status: 'pending',
      role: 'driver'
    });

    await newDriver.save();

    // TODO: Send email with credentials (implement email service later)
    console.log(`Driver credentials - Email: ${email}, Password: ${tempPassword}, Driver ID: ${driverId}`);

    res.status(201).json({
      success: true,
      message: 'Driver application submitted successfully. You will receive login credentials via email once approved.',
      driver: {
        id: newDriver._id,
        driverId: newDriver.driverId,
        fullName: newDriver.fullName,
        email: newDriver.email,
        status: newDriver.status
      }
    });

  } catch (error) {
    console.error('Driver registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again later.'
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

module.exports = {
  login,
  registerClient,
  registerVehicleOwner,
  registerDriver,
  getProfile,
  approveDriver
};
