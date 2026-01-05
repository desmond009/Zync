import { Server } from 'socket.io';
import { config } from '../config/env.js';
import redisClient from '../config/redis.js';
import { socketAuth, checkProjectAccess } from './socket.middleware.js';
import { setupTaskEvents } from './events/task.events.js';
import { setupChatEvents } from './events/chat.events.js';
import { setupPresenceEvents } from './events/presence.events.js';
import { setupNotificationEvents } from './events/notification.events.js';

/**
 * Initialize Socket.io server
 */
export const initializeSocketIO = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: config.frontend.url,
      credentials: true,
      methods: ['GET', 'POST'],
    },
    transports: ['websocket', 'polling'],
  });

  // Apply authentication middleware
  io.use(socketAuth);

  // Connection handler
  io.on('connection', (socket) => {
    console.log(`✅ Client connected: ${socket.id} (User: ${socket.user.id})`);

    // Join user's personal room
    socket.join(`user:${socket.user.id}`);

    /**
     * Join project room
     */
    socket.on('project:join', async (projectId) => {
      try {
        const hasAccess = await checkProjectAccess(socket, projectId);

        if (!hasAccess) {
          return socket.emit('error', { message: 'Access denied to project' });
        }

        socket.join(`project:${projectId}`);
        console.log(`User ${socket.user.id} joined project:${projectId}`);

        // Notify others in the room
        socket.to(`project:${projectId}`).emit('user:joined', {
          userId: socket.user.id,
          userName: `${socket.user.firstName} ${socket.user.lastName}`,
        });
      } catch (error) {
        console.error('Project join error:', error);
        socket.emit('error', { message: 'Failed to join project room' });
      }
    });

    /**
     * Leave project room
     */
    socket.on('project:leave', (projectId) => {
      socket.leave(`project:${projectId}`);
      socket.to(`project:${projectId}`).emit('user:left', {
        userId: socket.user.id,
        userName: `${socket.user.firstName} ${socket.user.lastName}`,
      });
    });

    // Setup event handlers
    setupTaskEvents(io, socket);
    setupChatEvents(io, socket);
    setupPresenceEvents(io, socket);
    setupNotificationEvents(io, socket);

    /**
     * Handle disconnection
     */
    socket.on('disconnect', () => {
      console.log(`❌ Client disconnected: ${socket.id} (User: ${socket.user.id})`);
    });

    /**
     * Handle errors
     */
    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  });

  // Health check endpoint
  io.of('/').adapter.on('create-room', (room) => {
    console.log(`Room created: ${room}`);
  });

  io.of('/').adapter.on('delete-room', (room) => {
    console.log(`Room deleted: ${room}`);
  });

  return io;
};

export default initializeSocketIO;
