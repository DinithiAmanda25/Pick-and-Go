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
// const uploadRoutes = require('./routes/UploadRoute'); // Temporarily disabled due to Cloudinary config

// Root Route
app.get("/", (req, res) => {
  res.send("🚀 Pick & Go Auth Service is Running!");
});

// API Routes
app.use('/api/auth', authRoutes);
// app.use('/api/upload', uploadRoutes); // Temporarily disabled due to Cloudinary config

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