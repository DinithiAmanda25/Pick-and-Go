require('dotenv').config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");


const app = express();

const corsOptions = {
  origin: "*",
  credentials: true,
};

app.use(express.json());

// example 

// Root Route
app.get("/", (req, res) => {
  res.send("🚀 Customer Auth Service is Running!");
});

// MongoDB Connection & Server Start
const PORT = process.env.PORT || 9000;

mongoose
  .connect(process.env.MONGO_URI, {

  })
  .then(() => {
    console.log("✅ MongoDB connected");
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err.message);
  });