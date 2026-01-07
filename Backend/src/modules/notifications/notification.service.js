import { ApiError } from '../../utils/ApiError.js';
import { getPaginationMeta, getSkip } from '../../utils/pagination.js';
import { Notification } from '../../models/index.js';

class NotificationService {
  async createNotification(userId, type, content) {
    const notification = new Notification({
      userId,
      type,
      content,
    });

    await notification.save();
    return notification;
  }

  async getUserNotifications(userId, page = 1, limit = 20, unreadOnly = false) {
    const skip = getSkip(page, limit);
    const where = { userId };

    if (unreadOnly) {
      where.isRead = false;
    }

    const [notifications, total] = await Promise.all([
      Notification.find(where)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Notification.countDocuments(where),
    ]);

    const pagination = getPaginationMeta(total, page, limit);

    return { notifications, pagination };
  }

  async markAsRead(notificationId, userId) {
    const notification = await Notification.findById(notificationId);

    if (!notification) {
      throw new ApiError(404, 'Notification not found');
    }

    if (notification.userId.toString() !== userId) {
      throw new ApiError(403, 'You can only mark your own notifications as read');
    }

    const updated = await Notification.findByIdAndUpdate(
      notificationId,
      { isRead: true },
      { new: true }
    );

    return updated;
  }

  async markAllAsRead(userId) {
    await Notification.updateMany(
      {
        userId,
        isRead: false,
      },
      { isRead: true }
    );

    return true;
  }

  async deleteNotification(notificationId, userId) {
    const notification = await Notification.findById(notificationId);

    if (!notification) {
      throw new ApiError(404, 'Notification not found');
    }

    if (notification.userId.toString() !== userId) {
      throw new ApiError(403, 'You can only delete your own notifications');
    }

    await Notification.findByIdAndDelete(notificationId);

    return true;
  }

  async getUnreadCount(userId) {
    const count = await Notification.countDocuments({
      userId,
      isRead: false,
    });

    return count;
  }
}

export default new NotificationService();
