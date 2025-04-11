const express = require('express');
const { 
    sendNotification, 
    updateNotificationStatus,
    getUserNotifications,
    getUnreadCount,
    deleteNotification,
    getNotificationById,
    markAllAsRead,
    deleteAllNotifications
} = require('../Services/NotificationService');

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

// Route to get user notifications with filtering
router.get('/user/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;
        const { status, type, limit, offset } = req.query;
        const filter = {
            status,
            type,
            limit: limit ? parseInt(limit) : undefined,
            offset: offset ? parseInt(offset) : undefined
        };
        const notifications = await getUserNotifications(userId, filter);
        res.json(notifications);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Route to get unread notification count
router.get('/user/:userId/unread-count', async (req, res) => {
    try {
        const userId = req.params.userId;
        const count = await getUnreadCount(userId);
        res.json({ count });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Route to get notification by id
router.get('/:id', async (req, res) => {
    try {
        const notification = await getNotificationById(req.params.id);
        if (!notification) {
            return res.status(404).json({ error: 'Notification not found' });
        }
        res.json(notification);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Route to delete a notification
router.delete('/:id', async (req, res) => {
    try {
        const deleted = await deleteNotification(req.params.id);
        res.json(deleted);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Route to mark all notifications as read
router.put('/user/:userId/mark-all-read', async (req, res) => {
    try {
        const userId = req.params.userId;
        const result = await markAllAsRead(userId);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Route to delete all notifications for a user
router.delete('/user/:userId/all', async (req, res) => {
    try {
        const userId = req.params.userId;
        const result = await deleteAllNotifications(userId);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;