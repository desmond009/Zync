import { Task, ProjectMember } from '../../models/index.js';
import { checkTeamAccess as teamMiddleware } from '../../middleware/team.middleware.js';

export const setupTaskEvents = (io, socket) => {
  /**
   * Join task room
   */
  socket.on('task:join', async (taskId) => {
    try {
      // Verify user has access to task
      const task = await Task.findById(taskId).populate('project');

      if (!task) {
        return socket.emit('error', { message: 'Task not found' });
      }

      const hasAccess = await ProjectMember.findOne({
        projectId: task.projectId,
        userId: socket.user.id,
      });

      if (!hasAccess) {
        return socket.emit('error', { message: 'Access denied' });
      }

      socket.join(`task:${taskId}`);
      console.log(`User ${socket.user.id} joined task:${taskId}`);
    } catch (error) {
      console.error('Task join error:', error);
      socket.emit('error', { message: 'Failed to join task room' });
    }
  });

  /**
   * Leave task room
   */
  socket.on('task:leave', (taskId) => {
    socket.leave(`task:${taskId}`);
  });

  /**
   * Create task
   */
  socket.on('task:create', async (data, ack) => {
    try {
      const { projectId, ...taskData } = data;

      // Validate team membership and role
      const member = await ProjectMember.findOne({ projectId, userId: socket.user.id });
      if (!member || !teamMiddleware.validateRole(member.role, 'MEMBER')) {
        return ack({ success: false, error: 'Unauthorized' });
      }

      const session = await Task.startSession();
      session.startTransaction();
      try {
        // Create task in DB
        const task = new Task({ ...taskData, projectId, createdById: socket.user.id });
        await task.save({ session });
        await task.populate(['project', 'assignedTo', 'createdBy']);

        // Commit transaction
        await session.commitTransaction();

        // Broadcast committed state
        io.to(`project:${projectId}`).emit('task:created', task);

        // Acknowledge success
        ack({ success: true, task });
      } catch (error) {
        await session.abortTransaction();
        console.error('Task creation error:', error);
        ack({ success: false, error: 'Failed to create task' });
      } finally {
        session.endSession();
      }
    } catch (error) {
      console.error('Task creation error:', error);
      ack({ success: false, error: 'Failed to create task' });
    }
  });

  /**
   * Update task
   */
  socket.on('task:update', async (data, ack) => {
    try {
      const { taskId, ...updateData } = data;

      // Fetch task and validate role
      const task = await Task.findById(taskId);
      if (!task) {
        return ack({ success: false, error: 'Task not found' });
      }

      const member = await ProjectMember.findOne({ projectId: task.projectId, userId: socket.user.id });
      if (!member || !teamMiddleware.validateRole(member.role, 'MEMBER')) {
        return ack({ success: false, error: 'Unauthorized' });
      }

      // Update task in DB
      Object.assign(task, updateData);
      await task.save();
      await task.populate(['project', 'assignedTo', 'createdBy']);

      // Broadcast committed state
      io.to(`project:${task.projectId}`).emit('task:updated', task);

      // Acknowledge success
      ack({ success: true, task });
    } catch (error) {
      console.error('Task update error:', error);
      ack({ success: false, error: 'Failed to update task' });
    }
  });

  /**
   * Delete task
   */
  socket.on('task:delete', async (data, ack) => {
    try {
      const { taskId } = data;

      // Fetch task and validate role
      const task = await Task.findById(taskId);
      if (!task) {
        return ack({ success: false, error: 'Task not found' });
      }

      const member = await ProjectMember.findOne({ projectId: task.projectId, userId: socket.user.id });
      if (!member || !teamMiddleware.validateRole(member.role, 'ADMIN')) {
        return ack({ success: false, error: 'Unauthorized' });
      }

      // Delete task in DB
      await task.remove();

      // Broadcast committed state
      io.to(`project:${task.projectId}`).emit('task:deleted', { taskId });

      // Acknowledge success
      ack({ success: true });
    } catch (error) {
      console.error('Task deletion error:', error);
      ack({ success: false, error: 'Failed to delete task' });
    }
  });
};
