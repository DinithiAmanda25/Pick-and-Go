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
const mainAuthRoutes = require('./routes/MainAuthRoute');
const uploadRoutes = require('./routes/UploadRoute');
const vehicleRoutes = require('./routes/VehicleRoute');
const businessAgreementRoutes = require('./routes/BusinessAgreementRoute');
const feedbackRoutes = require('./routes/FeedbackRoute');
const ratingRoutes = require('./routes/RatingRoute');

// Root Route
app.get("/", (req, res) => {
  res.send("🚀 Pick & Go Auth Service is Running!");
});

// API Routes
app.use('/api/auth', mainAuthRoutes);
app.use('/auth', mainAuthRoutes); // Legacy route support
app.use('/api/upload', uploadRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/business-agreement', businessAgreementRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/rating', ratingRoutes);

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