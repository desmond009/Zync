import { asyncHandler } from '../../utils/asyncHandler.js';
import { sendSuccess, sendPaginatedResponse } from '../../utils/ApiResponse.js';
import notificationService from './notification.service.js';

class NotificationController {
  getUserNotifications = asyncHandler(async (req, res) => {
    const { page, limit, unreadOnly } = req.query;
    const { notifications, pagination } = await notificationService.getUserNotifications(
      req.user.id,
      page,
      limit,
      unreadOnly === 'true'
    );
    sendPaginatedResponse(res, 200, { notifications }, pagination, 'Notifications retrieved successfully');
  });

  markAsRead = asyncHandler(async (req, res) => {
    const { notificationId } = req.params;
    const notification = await notificationService.markAsRead(notificationId, req.user.id);
    sendSuccess(res, 200, { notification }, 'Notification marked as read');
  });

  markAllAsRead = asyncHandler(async (req, res) => {
    await notificationService.markAllAsRead(req.user.id);
    sendSuccess(res, 200, null, 'All notifications marked as read');
  });

  deleteNotification = asyncHandler(async (req, res) => {
    const { notificationId } = req.params;
    await notificationService.deleteNotification(notificationId, req.user.id);
    sendSuccess(res, 200, null, 'Notification deleted successfully');
  });

  getUnreadCount = asyncHandler(async (req, res) => {
    const count = await notificationService.getUnreadCount(req.user.id);
    sendSuccess(res, 200, { count }, 'Unread count retrieved successfully');
  });
}

export default new NotificationController();
