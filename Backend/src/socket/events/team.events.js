/**
 * Team Socket.io Events
 * Real-time updates for team activities
 */

export const setupTeamEvents = (io, socket) => {
  /**
   * Join team room for real-time updates
   */
  socket.on('team:join', async (teamId) => {
    try {
      socket.join(`team:${teamId}`);
      console.log(`User ${socket.user.id} joined team:${teamId}`);

      // Notify others in the team
      socket.to(`team:${teamId}`).emit('team:member-online', {
        userId: socket.user.id,
        userName: `${socket.user.firstName} ${socket.user.lastName}`,
        avatar: socket.user.avatar,
        timestamp: new Date(),
      });

      // Send current online members count
      const room = io.sockets.adapter.rooms.get(`team:${teamId}`);
      const onlineCount = room ? room.size : 0;
      socket.emit('team:online-count', { teamId, count: onlineCount });
    } catch (error) {
      console.error('Team join error:', error);
      socket.emit('error', { message: 'Failed to join team room' });
    }
  });

  /**
   * Leave team room
   */
  socket.on('team:leave', (teamId) => {
    socket.leave(`team:${teamId}`);
    socket.to(`team:${teamId}`).emit('team:member-offline', {
      userId: socket.user.id,
      userName: `${socket.user.firstName} ${socket.user.lastName}`,
      timestamp: new Date(),
    });

    // Send updated online count
    const room = io.sockets.adapter.rooms.get(`team:${teamId}`);
    const onlineCount = room ? room.size : 0;
    io.to(`team:${teamId}`).emit('team:online-count', { teamId, count: onlineCount });
  });

  /**
   * Member is typing in team chat
   */
  socket.on('team:typing', ({ teamId, projectId }) => {
    socket.to(`team:${teamId}`).emit('team:member-typing', {
      userId: socket.user.id,
      userName: `${socket.user.firstName} ${socket.user.lastName}`,
      projectId,
      timestamp: new Date(),
    });
  });

  /**
   * Member stopped typing
   */
  socket.on('team:stop-typing', ({ teamId, projectId }) => {
    socket.to(`team:${teamId}`).emit('team:member-stop-typing', {
      userId: socket.user.id,
      projectId,
    });
  });
};

/**
 * Emit team member added event
 */
export const emitMemberAdded = (io, teamId, member) => {
  io.to(`team:${teamId}`).emit('team:member-added', {
    member,
    timestamp: new Date(),
  });
};

/**
 * Emit team member removed event
 */
export const emitMemberRemoved = (io, teamId, memberId) => {
  io.to(`team:${teamId}`).emit('team:member-removed', {
    memberId,
    timestamp: new Date(),
  });
};

/**
 * Emit team member role updated event
 */
export const emitMemberRoleUpdated = (io, teamId, member) => {
  io.to(`team:${teamId}`).emit('team:member-role-updated', {
    member,
    timestamp: new Date(),
  });
};

/**
 * Emit team updated event
 */
export const emitTeamUpdated = (io, teamId, updates) => {
  io.to(`team:${teamId}`).emit('team:updated', {
    teamId,
    updates,
    timestamp: new Date(),
  });
};

/**
 * Emit team settings updated event
 */
export const emitTeamSettingsUpdated = (io, teamId, settings) => {
  io.to(`team:${teamId}`).emit('team:settings-updated', {
    teamId,
    settings,
    timestamp: new Date(),
  });
};

/**
 * Emit ownership transferred event
 */
export const emitOwnershipTransferred = (io, teamId, oldOwnerId, newOwnerId) => {
  io.to(`team:${teamId}`).emit('team:ownership-transferred', {
    teamId,
    oldOwnerId,
    newOwnerId,
    timestamp: new Date(),
  });
};

/**
 * Emit team deleted event
 */
export const emitTeamDeleted = (io, teamId) => {
  io.to(`team:${teamId}`).emit('team:deleted', {
    teamId,
    timestamp: new Date(),
  });
};

/**
 * Emit invitation sent event
 */
export const emitInvitationSent = (io, teamId, invitation) => {
  io.to(`team:${teamId}`).emit('team:invitation-sent', {
    invitation,
    timestamp: new Date(),
  });
};
