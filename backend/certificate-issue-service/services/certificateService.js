const PDFDocument = require('pdfkit');
const { Readable } = require('stream');
const { getGridFSBucket } = require('../config/db');

const createCertificatePDF = (username, courseName) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument();
    const buffers = [];

    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', async () => {
      const pdfBuffer = Buffer.concat(buffers);
      const bucket = getGridFSBucket();

      const uploadStream = bucket.openUploadStream(`${username}_${courseName}.pdf`, {
        metadata: {
          username,
          courseName,
          createdAt: new Date(),
        },
      });

      const readStream = Readable.from(pdfBuffer);
      readStream.pipe(uploadStream);

      uploadStream.on('finish', () => {
        resolve(uploadStream.id);
      });

      uploadStream.on('error', reject);
    });

    doc.fontSize(24).text('Certificate of Completion', { align: 'center', underline: true });
    doc.moveDown().fontSize(20).text(`This certifies that`);
    doc.fontSize(26).text(username, { align: 'center' });
    doc.moveDown().fontSize(20).text(`has completed the course`);
    doc.fontSize(24).text(courseName, { align: 'center' });
    doc.moveDown().fontSize(16).text(`Date: ${new Date().toLocaleDateString()}`, { align: 'right' });

    doc.end();
  });
};

module.exports = { createCertificatePDF };
