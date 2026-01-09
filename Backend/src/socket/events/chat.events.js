import { ProjectMember, Message, MessageReadReceipt, Project } from '../../models/index.js';

export const setupChatEvents = (io, socket) => {
  /**
   * Send message in project chat
   */
  socket.on('chat:message', async (data, ack) => {
    const session = await Message.startSession();
    session.startTransaction();
    
    try {
      const { projectId, content, type = 'TEXT', fileUrl = null, fileMetadataId = null } = data;

      // Verify user has access to project
      const member = await ProjectMember.findOne({
        projectId,
        userId: socket.user.id,
      });

      if (!member) {
        await session.abortTransaction();
        session.endSession();
        const error = { message: 'Access denied' };
        socket.emit('error', error);
        if (ack) ack({ success: false, error: error.message });
        return;
      }

      // Get project to extract teamId
      const project = await Project.findById(projectId).select('teamId');
      if (!project) {
        await session.abortTransaction();
        session.endSession();
        const error = { message: 'Project not found' };
        socket.emit('error', error);
        if (ack) ack({ success: false, error: error.message });
        return;
      }

      // Get next sequence number for ordering guarantee
      const lastMessage = await Message.findOne({ projectId })
        .sort({ sequenceNumber: -1 })
        .select('sequenceNumber')
        .session(session);
      
      const sequenceNumber = lastMessage ? lastMessage.sequenceNumber + 1 : 1;

      // Validate file URL if present (must not be external)
      if (fileUrl && !fileUrl.startsWith(process.env.CLOUDINARY_URL_PREFIX || 'https://res.cloudinary.com')) {
        await session.abortTransaction();
        session.endSession();
        const error = { message: 'Invalid file URL' };
        socket.emit('error', error);
        if (ack) ack({ success: false, error: error.message });
        return;
      }

      // Save message to database with transaction
      const message = new Message({
        content,
        type,
        fileUrl,
        fileMetadataId,
        projectId,
        teamId: project.teamId,
        senderId: socket.user.id,
        sequenceNumber,
      });

      await message.save({ session });
      await message.populate({
        path: 'sender',
        select: 'id firstName lastName avatar',
      });

      // Commit transaction
      await session.commitTransaction();
      session.endSession();

      // Broadcast to project room AFTER successful DB write
      io.to(`project:${projectId}`).emit('chat:message', message);

      // Acknowledge success
      if (ack) ack({ success: true, message });
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      console.error('Chat message error:', error);
      const errorMsg = { message: 'Failed to send message' };
      socket.emit('error', errorMsg);
      if (ack) ack({ success: false, error: errorMsg.message });
    }
  });

  /**
   * Typing indicator
   */
  socket.on('chat:typing', async (data) => {
    try {
      const { projectId, isTyping } = data;

      // Verify user has access before broadcasting typing indicator
      const member = await ProjectMember.findOne({
        projectId,
        userId: socket.user.id,
      });

      if (!member) {
        return;
      }

      socket.to(`project:${projectId}`).emit('chat:typing', {
        userId: socket.user.id,
        userName: `${socket.user.firstName} ${socket.user.lastName}`,
        isTyping,
      });
    } catch (error) {
      console.error('Chat typing error:', error);
    }
  });

  /**
   * Mark messages as read
   */
  socket.on('chat:read', async (data, ack) => {
    try {
      const { messageId } = data;

      // Get message and validate access
      const message = await Message.findById(messageId).populate('project');

      if (!message) {
        const error = { message: 'Message not found' };
        socket.emit('error', error);
        if (ack) ack({ success: false, error: error.message });
        return;
      }

      // Verify user has access to project
      const member = await ProjectMember.findOne({
        projectId: message.projectId,
        userId: socket.user.id,
      });

      if (!member) {
        const error = { message: 'Access denied' };
        socket.emit('error', error);
        if (ack) ack({ success: false, error: error.message });
        return;
      }

      // Create or update read receipt
      const receipt = await MessageReadReceipt.findOneAndUpdate(
        { messageId, userId: socket.user.id },
        { readAt: new Date() },
        { upsert: true, new: true }
      );

      // Broadcast read receipt
      io.to(`project:${message.projectId}`).emit('chat:read', {
        messageId,
        userId: socket.user.id,
      });

      if (ack) ack({ success: true });
    } catch (error) {
      console.error('Chat read error:', error);
      const errorMsg = { message: 'Failed to mark message as read' };
      socket.emit('error', errorMsg);
      if (ack) ack({ success: false, error: errorMsg.message });
    }
  });
};
  });
};
