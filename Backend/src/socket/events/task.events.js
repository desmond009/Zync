import { prisma } from '../../config/database.js';

export const setupTaskEvents = (io, socket) => {
  /**
   * Join task room
   */
  socket.on('task:join', async (taskId) => {
    try {
      // Verify user has access to task
      const task = await prisma.task.findUnique({
        where: { id: taskId },
        include: { project: true },
      });

      if (!task) {
        return socket.emit('error', { message: 'Task not found' });
      }

      const hasAccess = await prisma.projectMember.findUnique({
        where: {
          projectId_userId: {
            projectId: task.projectId,
            userId: socket.user.id,
          },
        },
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
   * Task created event
   */
  socket.on('task:created', (data) => {
    io.to(`project:${data.projectId}`).emit('task:created', data);
  });

  /**
   * Task updated event
   */
  socket.on('task:updated', (data) => {
    io.to(`project:${data.projectId}`).emit('task:updated', data);
    io.to(`task:${data.taskId}`).emit('task:updated', data);
  });

  /**
   * Task deleted event
   */
  socket.on('task:deleted', (data) => {
    io.to(`project:${data.projectId}`).emit('task:deleted', data);
  });

  /**
   * Task assigned event
   */
  socket.on('task:assigned', (data) => {
    io.to(`user:${data.assignedToId}`).emit('task:assigned', data);
    io.to(`project:${data.projectId}`).emit('task:assigned', data);
  });

  /**
   * Comment added event
   */
  socket.on('comment:added', (data) => {
    io.to(`task:${data.taskId}`).emit('comment:added', data);
  });
};
