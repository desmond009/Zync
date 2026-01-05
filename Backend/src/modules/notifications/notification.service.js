import { prisma } from '../../config/database.js';
import { ApiError } from '../../utils/ApiError.js';
import { getPaginationMeta, getSkip } from '../../utils/pagination.js';

class NotificationService {
  async createNotification(userId, type, content) {
    const notification = await prisma.notification.create({
      data: {
        userId,
        type,
        content,
      },
    });

    return notification;
  }

  async getUserNotifications(userId, page = 1, limit = 20, unreadOnly = false) {
    const skip = getSkip(page, limit);
    const where = { userId };

    if (unreadOnly) {
      where.isRead = false;
    }

    const [notifications, total] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.notification.count({ where }),
    ]);

    const pagination = getPaginationMeta(total, page, limit);

    return { notifications, pagination };
  }

  async markAsRead(notificationId, userId) {
    const notification = await prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification) {
      throw new ApiError(404, 'Notification not found');
    }

    if (notification.userId !== userId) {
      throw new ApiError(403, 'You can only mark your own notifications as read');
    }

    const updated = await prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });

    return updated;
  }

  async markAllAsRead(userId) {
    await prisma.notification.updateMany({
      where: {
        userId,
        isRead: false,
      },
      data: { isRead: true },
    });

    return true;
  }

  async deleteNotification(notificationId, userId) {
    const notification = await prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification) {
      throw new ApiError(404, 'Notification not found');
    }

    if (notification.userId !== userId) {
      throw new ApiError(403, 'You can only delete your own notifications');
    }

    await prisma.notification.delete({
      where: { id: notificationId },
    });

    return true;
  }

  async getUnreadCount(userId) {
    const count = await prisma.notification.count({
      where: {
        userId,
        isRead: false,
      },
    });

    return count;
  }
}

export default new NotificationService();
