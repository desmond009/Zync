export const setupNotificationEvents = (io, socket) => {
  /**
   * Join user's personal notification room
   */
  socket.on('notification:join', () => {
    socket.join(`user:${socket.user.id}`);
    console.log(`User ${socket.user.id} joined notification room`);
  });

  /**
   * Send notification to specific user
   */
  const sendNotificationToUser = (userId, notification) => {
    io.to(`user:${userId}`).emit('notification:new', notification);
  };

  // Expose method for other parts of the application
  socket.sendNotification = sendNotificationToUser;
};

/**
 * Helper function to emit notifications (can be called from services)
 */
export const emitNotification = (io, userId, notification) => {
  io.to(`user:${userId}`).emit('notification:new', notification);
};
