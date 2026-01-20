import http from 'http';
import { config } from './config/env.js';
import createApp from './app.js';
import databaseClient from './config/database.js';
import redisClient from './config/redis.js';
import initializeSocketIO from './socket/socket.handler.js';
import logger from './middleware/logger.js';

/**
 * Create HTTP server and initialize Socket.io
 */
const startServer = async () => {
  try {
    // Connect to database
    await databaseClient.connect();

    // Connect to Redis
    await redisClient.connect();

    // Create Express app
    const app = createApp();

    // Create HTTP server
    const httpServer = http.createServer(app);

    // Initialize Socket.io
    const io = initializeSocketIO(httpServer);

    // Store io instance in app for access in routes
    app.set('io', io);

    // Start server with error handling
    httpServer.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        logger.error(`Port ${config.port} is already in use. Please free the port or change it.`);
        process.exit(1);
      }
      throw err;
    });

    httpServer.listen(config.port, () => {
      logger.info(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🚀 ZYNC - Real-time Collaboration Platform             ║
║                                                           ║
║   Environment: ${config.env.padEnd(43)}║
║   Server:      http://localhost:${config.port.toString().padEnd(31)}║
║   API:         http://localhost:${config.port}/api/${config.apiVersion.padEnd(19)}║
║                                                           ║
║   Status:      ✅ Server is running                      ║
║   Database:    ✅ Connected                              ║
║   Redis:       ✅ Connected                              ║
║   Socket.io:   ✅ Initialized                            ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
      `);
    });

    // ==================== GRACEFUL SHUTDOWN ====================

    const gracefulShutdown = async (signal) => {
      logger.info(`\n${signal} received. Starting graceful shutdown...`);

      httpServer.close(async () => {
        logger.info('HTTP server closed');

        try {
          // Close database connection
          await databaseClient.disconnect();

          // Close Redis connection
          await redisClient.disconnect();

          logger.info('✅ All connections closed. Exiting...');
          process.exit(0);
        } catch (error) {
          logger.error('Error during shutdown:', error);
          process.exit(1);
        }
      });

      // Force shutdown after 10 seconds
      setTimeout(() => {
        logger.error('⚠️  Forced shutdown after timeout');
        process.exit(1);
      }, 10000);
    };

    // Handle shutdown signals
    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

    // Handle uncaught exceptions
    process.on('uncaughtException', (error) => {
      logger.error('Uncaught Exception:', error);
      gracefulShutdown('UNCAUGHT_EXCEPTION');
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason, promise) => {
      logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
      gracefulShutdown('UNHANDLED_REJECTION');
    });

  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
startServer();
