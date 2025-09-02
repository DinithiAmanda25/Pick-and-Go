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


// Root Route
app.get("/", (req, res) => {
  res.send("🚀 Customer Auth Service is Running!");
});

// MongoDB Connection & Server Start
const PORT = process.env.PORT || 9000;

// Connect to MongoDB and start server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
}).catch((error) => {
  console.error('❌ Failed to start server:', error.message);
  process.exit(1);
});