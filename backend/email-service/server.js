const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const sendEmail = require('./util/sendEmail');

const app = express();

const cors = require('cors');

app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:8076'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true,
}));
app.use(bodyParser.json());
app.use(express.json());
app.use(cookieParser());

// Email routes
app.post('/api/send-email', async (req, res) => {
    try {
        const { to, subject, text } = req.body;
        
        // Validate input
        if (!to || !subject || !text) {
            return res.status(400).json({ 
                success: false, 
                message: 'Missing required fields: to, subject, or text' 
            });
        }
        
        // Send email
        sendEmail(to, subject, text);
        
        res.status(200).json({ 
            success: true, 
            message: 'Email sent successfully' 
        });
    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to send email', 
            error: error.message 
        });
    }
});

// Support notification route - specifically for support tickets
app.post('/api/notify-support', async (req, res) => {
    try {
        const { ticketId, userEmail, issueType, description } = req.body;
        
        // Validate input
        if (!ticketId || !userEmail || !issueType) {
            return res.status(400).json({ 
                success: false, 
                message: 'Missing required fields: ticketId, userEmail, or issueType' 
            });
        }
        
        const subject = `Support Ticket #${ticketId}: ${issueType}`;
        const text = `
A new support ticket has been created:

Ticket ID: ${ticketId}
User Email: ${userEmail}
Issue Type: ${issueType}
Description: ${description || 'No description provided'}

Please respond to this ticket as soon as possible.
`;
        
        // Send email
        sendEmail('support@yourlms.com', subject, text);
        
        // Also notify the user
        const userSubject = `Your Support Ticket #${ticketId} has been received`;
        const userText = `
Dear user,

We have received your support request (Ticket #${ticketId}) regarding: ${issueType}

Our support team will review your issue and get back to you as soon as possible.

Thank you for your patience.
LMS Support Team
`;
        
        sendEmail(userEmail, userSubject, userText);
        
        res.status(200).json({ 
            success: true, 
            message: 'Support notifications sent successfully' 
        });
    } catch (error) {
        console.error('Error sending support notification:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to send support notification', 
            error: error.message 
        });
    }
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});

const port = 8076;

app.listen(port, () => console.log(`Email service up and running on port ${port}!`));
