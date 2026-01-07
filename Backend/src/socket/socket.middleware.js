import jwt from 'jsonwebtoken';
import { config } from '../config/env.js';
import { User, ProjectMember } from '../models/index.js';

/**
 * Socket.io authentication middleware
 */
export const socketAuth = async (socket, next) => {
  try {
    const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return next(new Error('Authentication required'));
    }

    // Verify token
    const decoded = jwt.verify(token, config.jwt.accessSecret);

    // Get user from database
    const user = await User.findById(decoded.userId).select(
      'id email firstName lastName avatar role'
    );

    if (!user) {
      return next(new Error('Invalid token'));
    }

    // Attach user to socket
    socket.user = user;
    next();
  } catch (error) {
    console.error('Socket auth error:', error);
    return next(new Error('Authentication failed'));
  }
};

/**
 * Check if user has access to a project room
 */
export const checkProjectAccess = async (socket, projectId) => {
  const member = await ProjectMember.findOne({
    projectId,
    userId: socket.user.id,
  });

  return !!member;
};
