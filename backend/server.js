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

// API Routes
app.use('/api/auth', mainAuthRoutes);
app.use('/auth', mainAuthRoutes); // Legacy route support
app.use('/api/upload', uploadRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/business-agreement', businessAgreementRoutes);
app.use('/api/drivers', driverRoutes);
app.use('/api/admin', adminRoutes);

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

// MongoDB Connection & Server Start
const PORT = process.env.PORT || 9000;

// Connect to MongoDB and start server
connectDB().then(async () => {
  app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
  });
}).catch((error) => {
  console.error('❌ Failed to start server:', error.message);
  process.exit(1);
});