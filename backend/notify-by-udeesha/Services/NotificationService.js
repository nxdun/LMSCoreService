import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Function to send a new notification
export async function sendNotification(userId, title, message, type) {
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
export async function updateNotificationStatus(notificationId, status) {
    const updatedNotification = await prisma.notification.update({
        where: { id: notificationId },
        data: { status, sentAt: new Date() }
    });
    console.log("Notification Updated:", updatedNotification);
    return updatedNotification;
}
