import mongoose from 'mongoose';
import { ApiError } from '../../utils/ApiError.js';
import { Task, ProjectMember, Comment, Project, Activity } from '../../models/index.js';
import { verifyProjectAccess, verifyUsersInProject } from '../../middleware/project.middleware.js';
import activityService from '../activities/activity.service.js';

/**
 * PRODUCTION-GRADE TASK SERVICE
 * 
 * Rules:
 * 1. All operations verify project access
 * 2. Status transitions validated
 * 3. Position ordering deterministic
 * 4. MongoDB transactions for multi-step operations
 * 5. Socket events emitted ONLY after successful DB writes
 * 6. Activity logs generated automatically
 */

class TaskService {
  /**
   * Fetch all tasks for a project
   * Supports filtering and pagination
   */
  async getTasks(projectId, options = {}) {
    const { status, assignedToId, page = 1, limit = 50 } = options;

    const filter = {
      projectId,
    };

    if (status) {
      filter.status = status;
    }

    if (assignedToId) {
      filter.assignedToId = assignedToId;
    }

    const tasks = await Task.find(filter)
      .populate('assignedTo', 'id firstName lastName avatar email')
      .populate('createdBy', 'id firstName lastName avatar')
      .sort({ position: 1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    const total = await Task.countDocuments(filter);

    return {
      tasks,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Create a new task
   * Uses MongoDB transaction to ensure consistency
   */
  async createTask(userId, taskData, project, io) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const { projectId, assignedToId, ...rest } = taskData;

      // Verify assignee is in project if specified
      if (assignedToId) {
        await verifyUsersInProject(projectId, [assignedToId]);
      }

      // Calculate position (append to end of status column)
      const maxPosition = await Task.findOne({
        projectId,
        status: taskData.status || 'TODO',
      })
        .select('position')
        .sort({ position: -1 })
        .session(session);

      const position = maxPosition ? maxPosition.position + 1 : 0;

      // Create task
      const [task] = await Task.create(
        [
          {
            ...rest,
            projectId,
            createdById: userId,
            assignedToId: assignedToId || null,
            position,
          },
        ],
        { session }
      );

      // Populate relations
      await task.populate([
        { path: 'assignedTo', select: 'id firstName lastName avatar email' },
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
          status: task.status,
        },
        { targetId: task._id, targetType: 'Task', session }
      );

      await session.commitTransaction();

      // Emit socket event AFTER successful DB write
      if (io) {
        io.to(`project:${projectId}`).emit('task:created', {
          task: task.toObject(),
          actor: { id: userId },
        });
      }

      return task.toObject();
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Get task by ID with authorization
   */
  async getTaskById(taskId, userId) {
    const task = await Task.findById(taskId)
      .populate('project', 'id name color teamId')
      .populate('assignedTo', 'id firstName lastName avatar email')
      .populate('createdBy', 'id firstName lastName avatar')
      .lean();

    if (!task) {
      throw new ApiError(404, 'Task not found');
    }

    // Verify access
    await verifyProjectAccess(task.projectId, userId);

    return task;
  }

  /**
   * Update task details
   * Does NOT handle status changes (use moveTask instead)
   */
  async updateTask(taskId, userId, updateData, project, io) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const task = await Task.findById(taskId).session(session);
      if (!task) {
        throw new ApiError(404, 'Task not found');
      }

      // Verify assignment if changing assignee
      if (updateData.assignedToId !== undefined) {
        if (updateData.assignedToId) {
          await verifyUsersInProject(task.projectId, [updateData.assignedToId]);
        }
      }

      // Prevent status change via this endpoint
      if (updateData.status) {
        delete updateData.status;
      }

      // Store old values for activity log
      const changes = {};
      Object.keys(updateData).forEach((key) => {
        if (task[key] !== updateData[key]) {
          changes[key] = { from: task[key], to: updateData[key] };
        }
      });

      // Update task
      Object.assign(task, updateData);
      await task.save({ session });

      // Populate
      await task.populate([
        { path: 'assignedTo', select: 'id firstName lastName avatar email' },
        { path: 'createdBy', select: 'id firstName lastName avatar' },
      ]);

      // Create activity entry
      await activityService.createActivity(
        'TASK_UPDATED',
        task.projectId,
        project.teamId,
        userId,
        {
          taskId: task._id,
          taskTitle: task.title,
          changes,
        },
        { targetId: task._id, targetType: 'Task', session }
      );

      await session.commitTransaction();

      // Emit socket event
      if (io) {
        io.to(`project:${task.projectId}`).emit('task:updated', {
          task: task.toObject(),
          changes,
          actor: { id: userId },
        });
      }

      return task.toObject();
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Move task to different status/position
   * Handles reordering atomically
   */
  async moveTask(taskId, userId, newStatus, newPosition, projectId, io) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const task = await Task.findById(taskId).session(session);
      if (!task) {
        throw new ApiError(404, 'Task not found');
      }

      const oldStatus = task.status;
      const oldPosition = task.position;

      // Validate status transition
      const validTransitions = {
        TODO: ['IN_PROGRESS', 'DONE'],
        IN_PROGRESS: ['TODO', 'IN_REVIEW', 'DONE'],
        IN_REVIEW: ['IN_PROGRESS', 'DONE'],
        DONE: ['TODO', 'IN_PROGRESS'],
      };

      if (newStatus !== oldStatus && !validTransitions[oldStatus]?.includes(newStatus)) {
        throw new ApiError(400, `Invalid status transition from ${oldStatus} to ${newStatus}`);
      }

      // If moving within same column
      if (newStatus === oldStatus) {
        // Shift tasks between old and new position
        if (newPosition < oldPosition) {
          await Task.updateMany(
            {
              projectId,
              status: newStatus,
              position: { $gte: newPosition, $lt: oldPosition },
            },
            { $inc: { position: 1 } },
            { session }
          );
        } else if (newPosition > oldPosition) {
          await Task.updateMany(
            {
              projectId,
              status: newStatus,
              position: { $gt: oldPosition, $lte: newPosition },
            },
            { $inc: { position: -1 } },
            { session }
          );
        }
      } else {
        // Moving to different column
        // Shift down tasks in old column
        await Task.updateMany(
          {
            projectId,
            status: oldStatus,
            position: { $gt: oldPosition },
          },
          { $inc: { position: -1 } },
          { session }
        );

        // Shift up tasks in new column
        await Task.updateMany(
          {
            projectId,
            status: newStatus,
            position: { $gte: newPosition },
          },
          { $inc: { position: 1 } },
          { session }
        );
      }

      // Update task
      task.status = newStatus;
      task.position = newPosition;
      await task.save({ session });

      // Get project for teamId
      const project = await Project.findById(projectId).select('teamId').session(session);

      // Create activity entry
      await activityService.createActivity(
        'TASK_MOVED',
        projectId,
        project.teamId,
        userId,
        {
          taskId: task._id,
          taskTitle: task.title,
          fromStatus: oldStatus,
          toStatus: newStatus,
        },
        { targetId: task._id, targetType: 'Task', session }
      );

      await session.commitTransaction();

      // Emit socket event
      if (io) {
        io.to(`project:${projectId}`).emit('task:updated', {
          task: task.toObject(),
          moved: true,
          fromStatus: oldStatus,
          toStatus: newStatus,
          actor: { id: userId },
        });
      }

      return task.toObject();
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Assign/unassign task
   */
  async assignTask(taskId, userId, assignedToId, projectId, io) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const task = await Task.findById(taskId).session(session);
      if (!task) {
        throw new ApiError(404, 'Task not found');
      }

      const oldAssigneeId = task.assignedToId;

      // Verify new assignee is in project
      if (assignedToId) {
        await verifyUsersInProject(projectId, [assignedToId]);
      }

      task.assignedToId = assignedToId || null;
      await task.save({ session });

      await task.populate('assignedTo', 'id firstName lastName avatar email');

      // Get project
      const project = await Project.findById(projectId).select('teamId').session(session);

      // Create activity entry
      await activityService.createActivity(
        'TASK_ASSIGNED',
        projectId,
        project.teamId,
        userId,
        {
          taskId: task._id,
          taskTitle: task.title,
          assignedToId,
          unassigned: !assignedToId,
        },
        { targetId: task._id, targetType: 'Task', session }
      );

      await session.commitTransaction();

      // Emit socket event
      if (io) {
        io.to(`project:${projectId}`).emit('task:updated', {
          task: task.toObject(),
          assigned: true,
          assignedToId,
          actor: { id: userId },
        });
      }

      return task.toObject();
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Mark task as completed
   */
  async completeTask(taskId, userId, projectId, io) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const task = await Task.findById(taskId).session(session);
      if (!task) {
        throw new ApiError(404, 'Task not found');
      }

      const wasCompleted = task.status === 'DONE';

      task.status = 'DONE';
      await task.save({ session });

      // Get project
      const project = await Project.findById(projectId).select('teamId').session(session);

      // Create activity entry
      await activityService.createActivity(
        'TASK_COMPLETED',
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

      // Emit socket event
      if (io && !wasCompleted) {
        io.to(`project:${projectId}`).emit('task:updated', {
          task: task.toObject(),
          completed: true,
          actor: { id: userId },
        });
      }

      return task.toObject();
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  /**
   * Delete task
   */
  async deleteTask(taskId, userId, projectId, io) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const task = await Task.findById(taskId).session(session);
      if (!task) {
        throw new ApiError(404, 'Task not found');
      }

      const taskTitle = task.title;
      const taskStatus = task.status;
      const taskPosition = task.position;

      // Delete task
      await Task.findByIdAndDelete(taskId, { session });

      // Delete associated comments
      await Comment.deleteMany({ taskId }, { session });

      // Shift down tasks in same column
      await Task.updateMany(
        {
          projectId,
          status: taskStatus,
          position: { $gt: taskPosition },
        },
        { $inc: { position: -1 } },
        { session }
      );

      // Get project
      const project = await Project.findById(projectId).select('teamId').session(session);

      // Create activity entry
      await activityService.createActivity(
        'TASK_DELETED',
        projectId,
        project.teamId,
        userId,
        {
          taskTitle,
        },
        { session }
      );

      await session.commitTransaction();

      // Emit socket event
      if (io) {
        io.to(`project:${projectId}`).emit('task:deleted', {
          taskId,
          actor: { id: userId },
        });
      }

      return true;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  // ... existing comment methods remain unchanged ...
  async createComment(taskId, userId, content) {
    const task = await this.getTaskById(taskId, userId);

    const comment = await Comment.create({
      taskId,
      userId,
      content,
    });

    await comment.populate('userId', 'id firstName lastName avatar');

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

    comment.content = content;
    await comment.save();

    return comment;
  }

  async deleteComment(commentId, userId) {
    const comment = await Comment.findById(commentId);
    if (!comment) {
      throw new ApiError(404, 'Comment not found');
    }

    if (comment.userId.toString() !== userId) {
      throw new ApiError(403, 'You can only delete your own comments');
    }

    await Comment.findByIdAndDelete(commentId);

    return true;
  }
}

export default new TaskService();
