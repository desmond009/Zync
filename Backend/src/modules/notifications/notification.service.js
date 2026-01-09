import { ApiError } from '../../utils/ApiError.js';
import { Notification, ProjectMember } from '../../models/index.js';

class NotificationService {
  /**
   * Create notification with deduplication and scoping
   */
  async createNotification(userId, type, content, options = {}) {
    const { projectId = null, teamId = null, deduplicationKey = null } = options;

    // If projectId is provided, validate user has access
    if (projectId) {
      const member = await ProjectMember.findOne({ projectId, userId });
      if (!member) {
        throw new ApiError(403, 'User does not have access to this project');
      }
    }

    // Check for duplicate notification using deduplication key
    if (deduplicationKey) {
      const existing = await Notification.findOne({
        userId,
        deduplicationKey,
      });

      if (existing) {
        // Update existing notification instead of creating duplicate
        existing.content = content;
        existing.isRead = false;
        existing.createdAt = new Date();
        await existing.save();
        return existing;
      }
    }

    const notification = new Notification({
      userId,
      type,
      content,
      projectId,
      teamId,
      deduplicationKey,
    });

    await notification.save();
    return notification;
  }

  async getUserNotifications(userId, cursor = null, limit = 20, filters = {}) {
    const { unreadOnly = false, projectId = null, teamId = null } = filters;
    
    const where = { userId };

    if (unreadOnly) {
      where.isRead = false;
    }

    if (projectId) {
      where.projectId = projectId;
    }

    if (teamId) {
      where.teamId = teamId;
    }

    // Optimize pagination with cursor-based strategy
    const query = cursor ? { _id: { $gt: cursor }, ...where } : where;
    
    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(limit);

    const nextCursor = notifications.length > 0 ? notifications[notifications.length - 1]._id : null;

    return { notifications, nextCursor };
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
