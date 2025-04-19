// Import necessary modules
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const multer = require("multer");
const { Storage } = require("@google-cloud/storage");
const axios = require("axios");
require("dotenv").config();

const app = express();
const connection = require('./db');
const contentRouter = require('./routes/contentRoutes');

connection(); // Connect to the database

// Middleware setup
app.use(express.json()); // Parse JSON request bodies
app.use(cors()); // Enable Cross-Origin Resource Sharing
app.use(helmet()); // Add security headers
app.use(express.urlencoded({ extended: false })); // Parse URL-encoded request bodies

// Google Cloud Storage setup
const storage = new Storage({
  keyFilename: "./key.json", // Path to your Google Cloud service account key
});
const bucket = storage.bucket(process.env.SERVICE_NAME_BUCKET); // Bucket name from environment variables

// Multer middleware for handling file uploads
const multerMid = multer({
  storage: multer.memoryStorage(), // Store files in memory
  limits: {
    fileSize: 5 * 1024 * 1024, // Limit file size to 5MB
  },
});

// Route for content-related operations
app.use('/api/v1/content', contentRouter);

// File upload and signed URL generation
app.post("/api/upload", multerMid.single("file"), (req, res) => {
  console.log(`Upload received: ${req.file.originalname}, Type: ${req.file.mimetype}`);
  const file = req.file;

  // Validate file presence
  if (!file) {
    res.status(400).send("No file uploaded.");
    return;
  }

  // Generate unique file name and upload to Google Cloud Storage
  const fileName = Date.now() + file.originalname;
  const blob = bucket.file(fileName);
  const blobStream = blob.createWriteStream({
    metadata: {
      contentType: file.mimetype, // Set file MIME type
    },
  });

  // Handle errors during file upload
  blobStream.on("error", (err) => {
    res.status(500).send(err);
  });

  // Handle successful upload and generate signed URL
  blobStream.on("finish", async () => {
    try {
      const file = bucket.file(fileName);
      const [exists] = await file.exists();

      if (!exists) {
        res.status(404).send("File not found");
        return;
      }

      // Generate signed URL for file access
      const signedUrl = await file.getSignedUrl({
        action: "read",
        expires: "03-09-2200", // Set expiration date
      });

      res.status(200).send(signedUrl);
    } catch (err) {
      res.status(500).send(err);
    }
  });

  // End the stream and upload the file
  blobStream.end(file.buffer);
});

// CAPTCHA verification endpoint
app.post("/capcheck", async (req, res) => {
  try {
    // Validate CAPTCHA token presence
    if (!req.body.captcha) {
      return res.status(400).json({ message: "CapToken is required" });
    }

    // Verify CAPTCHA using Google's reCAPTCHA API
    const secretKey = process.env.SERVICE_CAPTCHA_CODE || "ENV NOT LOADED";
    const googleUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${req.body.captcha}`;

    const response = await axios.post(googleUrl);

    if (response.data.success) {
      console.log("CAPTCHA verified from IP:", req.ip);
      res.status(200).json({ message: "CapToken is valid", success: true });
    } else {
      console.log("CAPTCHA not verified from IP:", req.ip);
      res.status(400).json({ message: "CapToken is invalid", success: false });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error", success: false });
  }
});

// Start the server
const port = 2345;
app.listen(port, () => console.log(`Server listening on port ${port}`));

// Export the Express app for testing or further use
module.exports = app;
