import { prisma } from '../../config/database.js';

export const setupChatEvents = (io, socket) => {
  /**
   * Send message in project chat
   */
  socket.on('chat:message', async (data) => {
    try {
      const { projectId, content, type = 'TEXT', fileUrl = null } = data;

      // Verify user has access to project
      const hasAccess = await prisma.projectMember.findUnique({
        where: {
          projectId_userId: {
            projectId,
            userId: socket.user.id,
          },
        },
      });

      if (!hasAccess) {
        return socket.emit('error', { message: 'Access denied' });
      }

      // Save message to database
      const message = await prisma.message.create({
        data: {
          content,
          type,
          fileUrl,
          projectId,
          senderId: socket.user.id,
        },
        include: {
          sender: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatar: true,
            },
          },
        },
      });

      // Broadcast to project room
      io.to(`project:${projectId}`).emit('chat:message', message);
    } catch (error) {
      console.error('Chat message error:', error);
      socket.emit('error', { message: 'Failed to send message' });
    }
  });

  /**
   * Typing indicator
   */
  socket.on('chat:typing', (data) => {
    const { projectId, isTyping } = data;
    socket.to(`project:${projectId}`).emit('chat:typing', {
      userId: socket.user.id,
      userName: `${socket.user.firstName} ${socket.user.lastName}`,
      isTyping,
    });
  });

  /**
   * Mark messages as read
   */
  socket.on('chat:read', async (data) => {
    try {
      const { messageId } = data;

      await prisma.messageReadReceipt.upsert({
        where: {
          messageId_userId: {
            messageId,
            userId: socket.user.id,
          },
        },
        create: {
          messageId,
          userId: socket.user.id,
        },
        update: {
          readAt: new Date(),
        },
      });

      // Get message to find project
      const message = await prisma.message.findUnique({
        where: { id: messageId },
      });

      if (message) {
        io.to(`project:${message.projectId}`).emit('chat:read', {
          messageId,
          userId: socket.user.id,
        });
      }
    } catch (error) {
      console.error('Chat read error:', error);
    }
  });
};
