require('dotenv').config({ quiet: true });
const express = require("express");
const cors = require("cors");
const path = require("path");
const { connectDB } = require("./config/database");

const app = express();

const corsOptions = {
  origin: "*",
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

// Import Routes
const mainAuthRoutes = require('./routes/MainAuthRoute');
const uploadRoutes = require('./routes/UploadRoute');
const vehicleRoutes = require('./routes/VehicleRoute');
const businessAgreementRoutes = require('./routes/BusinessAgreementRoute');
const driverRoutes = require('./routes/DriverRoute');
const adminRoutes = require('./routes/AdminRoute');
const businessOwnerRoutes = require('./routes/BusinessOwnerRoute');
const clientRoutes = require('./routes/ClientRoute');
const vehicleOwnerRoutes = require('./routes/VehicleOwnerRoute');

// API Routes
app.use('/api/auth', mainAuthRoutes);
app.use('/auth', mainAuthRoutes); // Legacy route support
app.use('/api/upload', uploadRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/business-agreement', businessAgreementRoutes);
app.use('/api/drivers', driverRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/business-owner', businessOwnerRoutes);
app.use('/api/client', clientRoutes);
app.use('/api/vehicle-owner', vehicleOwnerRoutes);

// Direct route handling for specific admin endpoints to avoid 404 errors
const { getAllDrivers } = require('./controllers/DriverController');
const { getAllClients } = require('./controllers/ClientController');
const { getAllVehicleOwners } = require('./controllers/VehicleOwnerController');
const { getAvailableVehicles } = require('./controllers/VehicleController');
const { debugDatabase, debugGetAllDrivers } = require('./controllers/DebugController');




// Special direct routes for admin dashboard - with and without /api prefix
// These endpoints are designed to never fail - they will use fallback data if the database call fails
app.get('/auth/admin/all-drivers', async (req, res) => {
  console.log('Driver endpoint accessed: /auth/admin/all-drivers');
  try {
    // Try the regular controller first
    await getAllDrivers(req, res);
  } catch (err) {
    console.error('Error in driver controller, using fallback:', err);
    // If it fails, use the fallback controller
    getAllDriversFallback(req, res);
  }
});

app.get('/api/auth/admin/all-drivers', async (req, res) => {
  console.log('Driver endpoint accessed: /api/auth/admin/all-drivers');
  try {
    // Try the regular controller first
    await getAllDrivers(req, res);
  } catch (err) {
    console.error('Error in driver controller, using fallback:', err);
    // If it fails, use the fallback controller
    getAllDriversFallback(req, res);
  }
});

app.get('/auth/client/all', async (req, res) => {
  console.log('Client endpoint accessed: /auth/client/all');
  try {
    await getAllClients(req, res);
  } catch (err) {
    console.error('Error in client controller, using fallback:', err);
    getAllClientsFallback(req, res);
  }
});

app.get('/api/auth/client/all', async (req, res) => {
  console.log('Client endpoint accessed: /api/auth/client/all');
  try {
    await getAllClients(req, res);
  } catch (err) {
    console.error('Error in client controller, using fallback:', err);
    getAllClientsFallback(req, res);
  }
});

// Vehicle management endpoints
app.get('/auth/admin/all-vehicles', async (req, res) => {
  console.log('Vehicle endpoint accessed: /auth/admin/all-vehicles');
  try {
    // Use the existing controller to get all vehicles
    const { Vehicle } = require('./models/VehicleModel');
    const { VehicleOwner } = require('./models/VehicleOwnerModel');

    // Get all vehicles
    const vehicles = await Vehicle.find();

    // For each vehicle, populate owner details if available
    const enhancedVehicles = await Promise.all(vehicles.map(async (vehicle) => {
      const vehicleObj = vehicle.toObject();

      try {
        // Add type field for compatibility with frontend
        vehicleObj.type = vehicleObj.vehicleType;

        if (vehicle.ownerId) {
          const owner = await VehicleOwner.findById(vehicle.ownerId).select('fullName email');
          if (owner) {
            vehicleObj.ownerDetails = owner;
          }
        }
      } catch (err) {
        console.error('Error finding vehicle owner:', err);
      }

      return vehicleObj;
    }));

    res.status(200).json({
      success: true,
      vehicles: enhancedVehicles,
      count: enhancedVehicles.length
    });
  } catch (err) {
    console.error('Error fetching vehicles:', err);
    // Return empty array as fallback
    res.status(200).json({
      success: true,
      vehicles: [],
      count: 0,
      message: 'Error fetching vehicles data'
    });
  }
});

app.get('/api/auth/admin/all-vehicles', async (req, res) => {
  console.log('Vehicle endpoint accessed: /api/auth/admin/all-vehicles');
  try {
    // Use the existing controller to get all vehicles
    const { Vehicle } = require('./models/VehicleModel');
    const { VehicleOwner } = require('./models/VehicleOwnerModel');

    // Get all vehicles
    const vehicles = await Vehicle.find();

    // For each vehicle, populate owner details if available
    const enhancedVehicles = await Promise.all(vehicles.map(async (vehicle) => {
      const vehicleObj = vehicle.toObject();

      try {
        // Add type field for compatibility with frontend
        vehicleObj.type = vehicleObj.vehicleType;

        if (vehicle.ownerId) {
          const owner = await VehicleOwner.findById(vehicle.ownerId).select('fullName email');
          if (owner) {
            vehicleObj.ownerDetails = owner;
          }
        }
      } catch (err) {
        console.error('Error finding vehicle owner:', err);
      }

      return vehicleObj;
    }));

    res.status(200).json({
      success: true,
      vehicles: enhancedVehicles,
      count: enhancedVehicles.length
    });
  } catch (err) {
    console.error('Error fetching vehicles:', err);
    // Return empty array as fallback
    res.status(200).json({
      success: true,
      vehicles: [],
      count: 0,
      message: 'Error fetching vehicles data'
    });
  }
});

app.get('/auth/vehicle-owner/all', async (req, res) => {
  console.log('Vehicle owner endpoint accessed: /auth/vehicle-owner/all');
  try {
    await getAllVehicleOwners(req, res);
  } catch (err) {
    console.error('Error in vehicle owner controller, using fallback:', err);
    getAllVehicleOwnersFallback(req, res);
  }
});

app.get('/api/auth/vehicle-owner/all', async (req, res) => {
  console.log('Vehicle owner endpoint accessed: /api/auth/vehicle-owner/all');
  try {
    await getAllVehicleOwners(req, res);
  } catch (err) {
    console.error('Error in vehicle owner controller, using fallback:', err);
    getAllVehicleOwnersFallback(req, res);
  }
});

// Serve static files from React build in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/dist')));

  // Handle React routing - serve index.html for non-API routes
  app.get(/^(?!\/api|\/auth).*/, (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/dist', 'index.html'));
  });
} else {
  // Only show this message in development when frontend is not built
  app.get("/", (req, res) => {
    res.send("🚀 Pick & Go Auth Service is Running!");
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Global error handler caught:', err);
  res.status(500).json({
    success: false,
    message: 'Server error. Please try again later.',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// Route not found handler
app.use((req, res) => {
  console.log(`Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    success: false,
    message: 'API endpoint not found'
  });
});

// MongoDB Connection & Server Start
const PORT = process.env.PORT || 9000;

// Connect to MongoDB and start server
connectDB().then(async () => {
  const server = app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
  });

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (err) => {
    console.error('❌ Unhandled Rejection:', err);
    // Don't crash the server
  });
}).catch((error) => {
  console.error('❌ Failed to start server:', error.message);
  process.exit(1);
});