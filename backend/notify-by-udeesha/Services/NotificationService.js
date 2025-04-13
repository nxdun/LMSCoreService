const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Function to send a new notification
async function sendNotification(userId, title, message, type) {
    const notification = await prisma.notification.create({
        data: {
            userId,
            title,
            message,
            type,
            status: "pending"
        }
    });
    console.log("Notification Created:", notification);
    return notification;
}

// Function to mark notification as sent
async function updateNotificationStatus(notificationId, status) {
    const updatedNotification = await prisma.notification.update({
        where: { id: notificationId },
        data: { status, sentAt: new Date() }
    });
    console.log("Notification Updated:", updatedNotification);
    return updatedNotification;
}

// Function to get user notifications with optional filtering
async function getUserNotifications(userId, filter = {}) {
    const { status, type, limit = 10, offset = 0 } = filter;
    
    const where = { userId };
    if (status) where.status = status;
    if (type) where.type = type;
    
    const notifications = await prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset
    });
    
    return notifications;
}

// Function to get count of unread notifications
async function getUnreadCount(userId) {
    const count = await prisma.notification.count({
        where: {
            userId,
            status: "pending"
        }
    });
    return count;
}

// Function to delete a notification
async function deleteNotification(notificationId) {
    const deleted = await prisma.notification.delete({
        where: { id: notificationId }
    });
    console.log("Notification Deleted:", deleted);
    return deleted;
}

// Function to get a notification by ID
async function getNotificationById(notificationId) {
    return await prisma.notification.findUnique({
        where: { id: notificationId }
    });
}

// Function to mark all notifications as read for a user
async function markAllAsRead(userId) {
    const result = await prisma.notification.updateMany({
        where: {
            userId,
            status: "pending"
        },
        data: {
            status: "read",
            sentAt: new Date()
        }
    });
    console.log(`Marked ${result.count} notifications as read`);
    return result;
}

// Function to delete all notifications for a user
async function deleteAllNotifications(userId) {
    const result = await prisma.notification.deleteMany({
        where: { userId }
    });
    console.log(`Deleted ${result.count} notifications`);
    return result;
}

module.exports = { 
    sendNotification, 
    updateNotificationStatus,
    getUserNotifications,
    getUnreadCount,
    deleteNotification,
    getNotificationById,
    markAllAsRead,
    deleteAllNotifications
}; // ✅ CommonJS export
