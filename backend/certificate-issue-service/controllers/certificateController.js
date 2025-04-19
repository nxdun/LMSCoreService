const { createCertificatePDF } = require('../services/certificateService');
const mongoose = require('mongoose');
const { uploadToGridFS, getGridFSBucket } = require('../config/db');

const generateCertificate = async (req, res) => {
  const { username, courseName } = req.body;

  if (!username || !courseName) {
    return res.status(400).json({ message: 'Username and course name are required.' });
  }

  try {
    const fileId = await createCertificatePDF(username, courseName);
    res.status(201).json({
      message: 'Certificate created and saved to MongoDB',
      fileId,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating certificate', error: error.message });
  }
};
const getCertificateById = async (req, res) => {
    try {
      const fileId = new mongoose.Types.ObjectId(req.params.id);
      const bucket = getGridFSBucket();
  
      const downloadStream = bucket.openDownloadStream(fileId);
  
      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="certificate.pdf"`,
      });
  
      downloadStream.pipe(res);
      downloadStream.on('error', (err) => {
        res.status(404).json({ message: 'Certificate not found', error: err.message });
      });
    } catch (error) {
      res.status(400).json({ message: 'Invalid certificate ID', error: error.message });
    }
  };

module.exports = { generateCertificate,getCertificateById };
