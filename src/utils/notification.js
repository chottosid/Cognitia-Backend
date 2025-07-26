import { PrismaClient } from '@prisma/client';
import { publishNotification } from './queue.js';

const prisma = new PrismaClient();

export async function createAndSendNotification({ userId, type, title, message }) {
  // Save notification to the database
  const notification = await prisma.notification.create({
    data: {
      userId,
      type,
      title,
      message,
    },
  });

  // Publish notification to Redis
  publishNotification({
    id: notification.id,
    userId,
    type,
    title,
    message,
    createdAt: notification.createdAt,
    isRead: notification.isRead,
  });

  return notification;
}
