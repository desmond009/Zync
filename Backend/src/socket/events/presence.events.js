import { User, ProjectMember } from '../../models/index.js';

export const setupPresenceEvents = (io, socket) => {
  /**
   * User comes online
   */
  socket.on('presence:online', async () => {
    try {
      // Update user's last seen
      await User.findByIdAndUpdate(socket.user.id, {
        lastSeenAt: new Date(),
      });

      // Get user's projects
      const projectMemberships = await ProjectMember.find({
        userId: socket.user.id,
      }).select('projectId');

      // Broadcast to all user's projects
      projectMemberships.forEach((membership) => {
        io.to(`project:${membership.projectId}`).emit('presence:online', {
          userId: socket.user.id,
          userName: `${socket.user.firstName} ${socket.user.lastName}`,
        });
      });
    } catch (error) {
      console.error('Presence online error:', error);
    }
  });

  /**
   * User goes offline
   */
  socket.on('disconnect', async () => {
    try {
      const timestamp = new Date();
      // Update user's last seen
      await User.findByIdAndUpdate(socket.user.id, {
        lastSeenAt: timestamp,
      });

      // Get rooms the socket is currently in
      const rooms = Array.from(socket.rooms).filter((room) => room.startsWith('project:'));

      // Broadcast to all user's project rooms
      rooms.forEach((room) => {
        io.to(room).emit('presence:offline', {
          userId: socket.user.id,
          lastSeenAt: timestamp,
        });
      });

      console.log(`User ${socket.user.id} disconnected`);
    } catch (error) {
      console.error('Presence disconnect error:', error);
    }
  });

  /**
   * Get online users in project
   */
  socket.on('presence:get', async (projectId) => {
    try {
      const socketsInRoom = await io.in(`project:${projectId}`).fetchSockets();
      const onlineUsers = socketsInRoom.map((s) => ({
        userId: s.user?.id,
        userName: `${s.user?.firstName} ${s.user?.lastName}`,
      }));

      socket.emit('presence:list', { projectId, onlineUsers });
    } catch (error) {
      console.error('Presence get error:', error);
    }
  });
};
