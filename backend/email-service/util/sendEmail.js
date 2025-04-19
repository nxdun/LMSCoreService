// nodemailerSetup.js
const nodemailer = require('nodemailer');

function sendEmail(to, subject, text) {
    let transporter = nodemailer.createTransport({
        host: "smtp.zoho.com",
        secure: true,
        port: 465,
        auth: {
            user: 'udeeshagamage12@zohomail.com',
            pass: 'r731EzXLULg1'
        }
    });

    let mailOptions = {
        from: 'udeeshagamage12@zohomail.com',
        to: to,
        subject: subject,
        text: text
    };

    transporter.sendMail(mailOptions, function(error, info){
        if (error) {
            console.log("Failed to send email:", error);
        } else {
            console.log('Email sent successfully:', info.response);
        }
    });
}

module.exports = sendEmail;
