const PDFDocument = require('pdfkit');
const { Readable } = require('stream');
const { getGridFSBucket } = require('../config/db');

const createCertificatePDF = (username, courseName) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: 'A4',
      margin: 50,
    });

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

    // Draw a blue border rectangle
    const borderWidth = 5;
    doc.rect(
      borderWidth / 2,
      borderWidth / 2,
      doc.page.width - borderWidth,
      doc.page.height - borderWidth
    )
    .lineWidth(borderWidth)
    .strokeColor('blue')
    .stroke();

    // Add Certificate Content
    doc.moveDown(3);
    doc.fontSize(24).fillColor('#000').text('Certificate of Completion', { align: 'center', underline: true });

    doc.moveDown(2);
    doc.fontSize(20).text(`This certifies that`, { align: 'center' });

    doc.moveDown(1);
    doc.fontSize(26).fillColor('black').text(username, { align: 'center', underline: true });

    doc.moveDown(1);
    doc.fontSize(20).fillColor('black').text(`has successfully completed the course`, { align: 'center' });

    doc.moveDown(1);
    doc.fontSize(24).fillColor('blue').text(courseName, { align: 'center' });

    doc.moveDown(2);
    doc.fontSize(16).fillColor('black').text(`Date: ${new Date().toLocaleDateString()}`, { align: 'right' });

    doc.end();
  });
};

module.exports = { createCertificatePDF };

