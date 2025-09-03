require('dotenv').config({ quiet: true });
const express = require("express");
const cors = require("cors");
const { connectDB } = require("./config/database");

const app = express();

const corsOptions = {
  origin: "*",
  credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());

// Import Routes
const authRoutes = require('./routes/AuthRoute');
const uploadRoutes = require('./routes/UploadRoute');

// Root Route
app.get("/", (req, res) => {
  res.send("🚀 Pick & Go Auth Service is Running!");
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/upload', uploadRoutes);

// MongoDB Connection & Server Start
const PORT = process.env.PORT || 9000;

// Connect to MongoDB and start server
connectDB().then(async () => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📋 API Endpoints:`);
    console.log(`   POST /api/auth/login`);
    console.log(`   POST /api/auth/register/client`);
    console.log(`   POST /api/auth/register/vehicle-owner`);
    console.log(`   POST /api/auth/register/driver`);
    console.log(`   GET /api/auth/profile/:role/:userId`);
    console.log(`   PUT /api/auth/admin/approve-driver/:driverId`);
    console.log(`   🖼️ Upload Endpoints:`);
    console.log(`   POST /api/upload/single - Upload single file`);
    console.log(`   POST /api/upload/multiple - Upload multiple files`);
    console.log(`   POST /api/upload/profile - Upload profile image`);
    console.log(`   POST /api/upload/document - Upload document`);
    console.log(`   DELETE /api/upload/:publicId - Delete file`);
  });
}).catch((error) => {
  console.error('❌ Failed to start server:', error.message);
  process.exit(1);
});