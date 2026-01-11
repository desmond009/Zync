import { asyncHandler } from '../../utils/asyncHandler.js';
import activityService from './activity.service.js';
import { sendSuccess } from '../../utils/ApiResponse.js';

class ActivityController {
  /**
   * GET /api/v1/activities?projectId=xxx&page=1&limit=50
   * Get project activities (frontend route)
   */
  getProjectActivities = asyncHandler(async (req, res) => {
    const { projectId, page = 1, limit = 50, type, actorId } = req.query;

    const filters = {};
    if (type) filters.type = type;
    if (actorId) filters.actorId = actorId;

    const result = await activityService.getProjectActivity(
      projectId,
      req.user.id,
      null,
      parseInt(limit),
      filters
    );

    sendSuccess(res, 200, result, 'Activity feed retrieved successfully');
  });

  /**
   * Get project activity feed (legacy route)
   */
  getProjectActivity = asyncHandler(async (req, res) => {
    const { projectId } = req.params;
    const { cursor, limit = 50, type, actorId } = req.query;

    const filters = {};
    if (type) filters.type = type;
    if (actorId) filters.actorId = actorId;

    const result = await activityService.getProjectActivity(
      projectId,
      req.user.id,
      cursor,
      parseInt(limit),
      filters
    );

    sendSuccess(res, 200, result, 'Activity feed retrieved successfully');
  });

  /**
   * Get team activity feed
   */
  getTeamActivity = asyncHandler(async (req, res) => {
    const { teamId } = req.params;
    const { cursor, limit = 50 } = req.query;

    const result = await activityService.getTeamActivity(
      teamId,
      req.user.id,
      cursor,
      parseInt(limit)
    );

    sendSuccess(res, 200, result, 'Team activity retrieved successfully');
  });
}

export default new ActivityController();
