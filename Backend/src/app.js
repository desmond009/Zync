import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import { config } from './config/env.js';
import { httpLogger } from './middleware/logger.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';
import { generalLimiter } from './middleware/rateLimiter.js';

// Import routes
import authRoutes from './modules/auth/auth.routes.js';
import userRoutes from './modules/users/user.routes.js';
import teamRoutes from './modules/teams/team.routes.js';
import projectRoutes from './modules/projects/project.routes.js';
import taskRoutes from './modules/tasks/task.routes.js';
import notificationRoutes from './modules/notifications/notification.routes.js';
import activityRoutes from './modules/activities/activity.routes.js';

/**
 * Create Express application
 */
const createApp = () => {
  const app = express();

  // ==================== SECURITY MIDDLEWARE ====================
  
  // Helmet for security headers
  app.use(helmet());

  // CORS configuration
  app.use(
    cors({
      origin: config.frontend.url,
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  );

  // ==================== GENERAL MIDDLEWARE ====================

  // Body parsers
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Cookie parser
  app.use(cookieParser());

  // HTTP request logging
  if (config.isDevelopment) {
    app.use(morgan('dev'));
  }
  app.use(httpLogger);

  // Rate limiting
  app.use(generalLimiter);

  // ==================== HEALTH CHECK ====================
  
  app.get('/health', (req, res) => {
    res.status(200).json({
      success: true,
      message: 'Server is running',
      environment: config.env,
      timestamp: new Date().toISOString(),
    });
  });

  app.get('/api/health', (req, res) => {
    res.status(200).json({
      success: true,
      message: 'API is running',
      version: config.apiVersion,
      timestamp: new Date().toISOString(),
    });
  });

  // ==================== API ROUTES ====================
  
  const apiRouter = express.Router();

  // Mount routes
  apiRouter.use('/auth', authRoutes);
  apiRouter.use('/users', userRoutes);
  apiRouter.use('/teams', teamRoutes);
  apiRouter.use('/projects', projectRoutes);
  apiRouter.use('/tasks', taskRoutes);
  apiRouter.use('/notifications', notificationRoutes);
  apiRouter.use('/activities', activityRoutes);

  // Mount API router
  app.use(`/api/${config.apiVersion}`, apiRouter);

  // ==================== ERROR HANDLING ====================
  
  // 404 handler
  app.use(notFound);

  // Global error handler
  app.use(errorHandler);

  return app;
};

export default createApp;
