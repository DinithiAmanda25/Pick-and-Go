const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,// Cloud name from environment variables
  api_key: process.env.CLOUDINARY_API_KEY,// API key from environment variables
  api_secret: process.env.CLOUDINARY_API_SECRET,// API secret from environment variables
});

module.exports = cloudinary; // Export the configured Cloudinary instance
