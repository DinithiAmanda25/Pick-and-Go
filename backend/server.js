require('dotenv').config({ quiet: true });
const express = require("express");
const cors = require("cors");
const { connectDB } = require("./config/database");

// Set JWT_SECRET if not already set
if (!process.env.JWT_SECRET) {
  process.env.JWT_SECRET = 'your-super-secret-jwt-key-for-pick-and-go-application-2024';
}

const app = express();

const corsOptions = {
  origin: ["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173"],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};

app.use(cors(corsOptions));
app.use(express.json());

// Import Routes
const mainAuthRoutes = require('./routes/MainAuthRoute');
const uploadRoutes = require('./routes/UploadRoute');
const vehicleRoutes = require('./routes/VehicleRoute');
const businessAgreementRoutes = require('./routes/BusinessAgreementRoute');
const bookingRoutes = require('./routes/BookingRoute');
const adminRoutes = require('./routes/AdminRoute');
const driverRoutes = require('./routes/DriverRoute');
const paymentRoutes = require('./routes/PaymentRoute');
const packageRoutes = require('./routes/PackageRoute');
// Root Route
app.get("/", (req, res) => {
  res.send("🚀 Pick & Go Auth Service is Running!");
});

// API Routes
app.use('/api/drivers', driverRoutes);

app.use('/api/auth', mainAuthRoutes);
app.use('/auth', mainAuthRoutes); // Legacy route support
app.use('/api/upload', uploadRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/business-agreement', businessAgreementRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/admin-reports', adminRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/packages', packageRoutes);
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