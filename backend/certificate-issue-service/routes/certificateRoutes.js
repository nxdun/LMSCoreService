const express = require('express');
const router = express.Router();
const {
  generateCertificate,
  getCertificateById,
} = require('../controllers/certificateController');

router.post('/generate', generateCertificate);
router.get('/:id', getCertificateById);

module.exports = router;

