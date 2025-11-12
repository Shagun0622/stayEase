const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");

// 🧭 Configure your Cloudinary credentials (stored in .env)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

// 🗂️ Set up Multer to use Cloudinary for image uploads
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "StayEase_Listings", // Folder name in your Cloudinary account
    allowed_formats: ["jpeg", "png", "jpg"],
  },
});

// Export both Cloudinary instance and storage engine
module.exports = { cloudinary, storage };
