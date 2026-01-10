import { ApiError } from '../../utils/ApiError.js';
import { Task, ProjectMember, Comment, Project } from '../../models/index.js';
import activityService from '../activities/activity.service.js';

class TaskService {
  async createTask(userId, taskData) {
    const { projectId, ...rest } = taskData;

    // Check if user has access to project
    const projectMember = await ProjectMember.findOne({
      projectId,
      userId,
    });

    if (!projectMember) {
      throw new ApiError(403, 'You do not have access to this project');
    }

    if (projectMember.role === 'VIEWER') {
      throw new ApiError(403, 'Viewers cannot create tasks');
    }

    // Get project to extract teamId
    const project = await Project.findById(projectId).select('teamId');
    if (!project) {
      throw new ApiError(404, 'Project not found');
    }

    // Create task with transaction
    const session = await Task.startSession();
    session.startTransaction();

    try {
      const task = new Task({
        ...rest,
        projectId,
        createdById: userId,
      });

      await task.save({ session });
      await task.populate([
        { path: 'project', select: 'id name color' },
        { path: 'assignedTo', select: 'id firstName lastName avatar' },
        { path: 'createdBy', select: 'id firstName lastName avatar' },
      ]);

      // Create activity entry
      await activityService.createActivity(
        'TASK_CREATED',
        projectId,
        project.teamId,
        userId,
        {
          taskId: task._id,
          taskTitle: task.title,
        },
        { targetId: task._id, targetType: 'Task', session }
      );

      await session.commitTransaction();
      session.endSession();

      return task;
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      throw error;
    }
  }

  async getTaskById(taskId, userId) {
    const task = await Task.findById(taskId).populate([
      { path: 'project', select: 'id name color teamId' },
      { path: 'assignedTo', select: 'id firstName lastName avatar email' },
      { path: 'createdBy', select: 'id firstName lastName avatar' },
      {
        path: 'comments',
        match: { deletedAt: null },
        populate: {
          path: 'userId',
          select: 'id firstName lastName avatar',
        },
        options: { sort: { createdAt: 1 } },
      },
    ]);

    if (!task) {
      throw new ApiError(404, 'Task not found');
    }

    // Check if user has access to the project
    const hasAccess = await ProjectMember.findOne({
      projectId: task.projectId,
      userId,
    });

    if (!hasAccess) {
      throw new ApiError(403, 'You do not have access to this task');
    }

    return task;
  }

  async updateTask(taskId, userId, updateData) {
    const task = await this.getTaskById(taskId, userId);

    // Check if user can edit
    const projectMember = await ProjectMember.findOne({
      projectId: task.projectId,
      userId,
    });

    if (projectMember.role === 'VIEWER') {
      throw new ApiError(403, 'Viewers cannot edit tasks');
    }

    const updatedTask = await Task.findByIdAndUpdate(taskId, updateData, {
      new: true,
    }).populate([
      { path: 'project', select: 'id name color' },
      { path: 'assignedTo', select: 'id firstName lastName avatar' },
    ]);

    return updatedTask;
  }

  async deleteTask(taskId, userId) {
    const task = await this.getTaskById(taskId, userId);

    // Check if user can delete (Manager or task creator)
    const projectMember = await ProjectMember.findOne({
      projectId: task.projectId,
      userId,
    });

    if (
      projectMember.role === 'VIEWER' ||
      (projectMember.role === 'CONTRIBUTOR' && task.createdById.toString() !== userId)
    ) {
      throw new ApiError(403, 'You do not have permission to delete this task');
    }

    await Task.findByIdAndDelete(taskId);
    await Comment.deleteMany({ taskId });

    return true;
  }

  async createComment(taskId, userId, content) {
    const task = await this.getTaskById(taskId, userId);

    const comment = new Comment({
      content,
      taskId,
      userId,
    });

    await comment.save();
    await comment.populate({
      path: 'userId',
      select: 'id firstName lastName avatar',
    });

    return comment;
  }

  async updateComment(commentId, userId, content) {
    const comment = await Comment.findById(commentId);

    if (!comment) {
      throw new ApiError(404, 'Comment not found');
    }

    if (comment.userId.toString() !== userId) {
      throw new ApiError(403, 'You can only edit your own comments');
    }

    const updatedComment = await Comment.findByIdAndUpdate(
      commentId,
      { content },
      { new: true }
    ).populate({
      path: 'userId',
      select: 'id firstName lastName avatar',
    });

    return updatedComment;
  }

  async deleteComment(commentId, userId) {
    const comment = await Comment.findById(commentId);

    if (!comment) {
      throw new ApiError(404, 'Comment not found');
    }

    if (comment.userId.toString() !== userId) {
      throw new ApiError(403, 'You can only delete your own comments');
    }

    await Comment.findByIdAndUpdate(commentId, { deletedAt: new Date() });

    return true;
  }

  async getProjectTasks(projectId, userId, filters = {}) {
    // Check access
    const hasAccess = await ProjectMember.findOne({
      projectId,
      userId,
    });

    if (!hasAccess) {
      throw new ApiError(403, 'You do not have access to this project');
    }

    const where = { projectId };

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.assignedToId) {
      where.assignedToId = filters.assignedToId;
    }

    if (filters.priority) {
      where.priority = filters.priority;
    }

    // Validate task status transitions
    const validStatuses = ['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE'];
    if (filters.status && !validStatuses.includes(filters.status)) {
      throw new ApiError(400, 'Invalid task status');
    }

    const tasks = await Task.find(where)
      .populate([
        { path: 'assignedTo', select: 'id firstName lastName avatar' },
        { path: 'createdBy', select: 'id firstName lastName' },
      ])
      .sort({ position: 1, createdAt: -1 });

    return tasks;
  }
}

export default new TaskService();
