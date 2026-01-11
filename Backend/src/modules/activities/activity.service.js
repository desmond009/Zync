import { ApiError } from '../../utils/ApiError.js';
import { Activity, ProjectMember } from '../../models/index.js';

class ActivityService {
  /**
   * Create activity entry (transactional with action)
   */
  async createActivity(type, projectId, teamId, actorId, metadata, options = {}) {
    const { targetId = null, targetType = null, session = null } = options;

    const activity = new Activity({
      type,
      projectId,
      teamId,
      actorId,
      metadata,
      targetId,
      targetType,
    });

    if (session) {
      await activity.save({ session });
    } else {
      await activity.save();
    }

    return activity;
  }

  /**
   * Get project activity feed
   */
  async getProjectActivity(projectId, userId, cursor = null, limit = 50, filters = {}) {
    // Validate user has access to project
    const member = await ProjectMember.findOne({ projectId, userId });
    if (!member) {
      throw new ApiError(403, 'You do not have access to this project');
    }

    const where = { projectId };

    // Apply filters
    if (filters.type) {
      where.type = filters.type;
    }

    if (filters.actorId) {
      where.actorId = filters.actorId;
    }

    // Cursor-based pagination
    const query = cursor ? { _id: { $lt: cursor }, ...where } : where;

    const activities = await Activity.find(query)
      .populate([
        { path: 'actor', select: 'id firstName lastName avatar' },
        { path: 'project', select: 'id name color' },
      ])
      .sort({ createdAt: -1 })
      .limit(limit + 1);

    const hasMore = activities.length > limit;
    const data = hasMore ? activities.slice(0, -1) : activities;
    const nextCursor = hasMore ? data[data.length - 1]._id : null;

    return { activities: data, nextCursor, hasMore };
  }

  /**
   * Get team activity feed (across all projects)
   */
  async getTeamActivity(teamId, userId, cursor = null, limit = 50) {
    // Validate user is team member
    const TeamMember = (await import('../../models/index.js')).TeamMember;
    const member = await TeamMember.findOne({ teamId, userId });
    if (!member) {
      throw new ApiError(403, 'You do not have access to this team');
    }

    const query = cursor ? { _id: { $lt: cursor }, teamId } : { teamId };

    const activities = await Activity.find(query)
      .populate([
        { path: 'actor', select: 'id firstName lastName avatar' },
        { path: 'project', select: 'id name color' },
      ])
      .sort({ createdAt: -1 })
      .limit(limit + 1);

    const hasMore = activities.length > limit;
    const data = hasMore ? activities.slice(0, -1) : activities;
    const nextCursor = hasMore ? data[data.length - 1]._id : null;

    return { activities: data, nextCursor, hasMore };
  }

  /**
   * Delete activities for a project (soft cascade)
   */
  async deleteProjectActivities(projectId) {
    await Activity.deleteMany({ projectId });
    return true;
  }
}

export default new ActivityService();
