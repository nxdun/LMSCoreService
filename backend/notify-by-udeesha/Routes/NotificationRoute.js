const express =require('express');
const { sendNotification, updateNotificationStatus } =require('../Services/NotificationService');

const router = express.Router();

// Route to create a new notification
router.post('/send', async (req, res) => {
    try {
        const { userId, title, message, type } = req.body;
        const notification = await sendNotification(userId, title, message, type);
        res.json(notification);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Route to update notification status
router.put('/update/:id', async (req, res) => {
    try {
        const { status } = req.body;
        const notification = await updateNotificationStatus(req.params.id, status);
        res.json(notification);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;