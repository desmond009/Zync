import express from 'express';
import activityController from './activity.controller.js';
import { authenticate as authMiddleware } from '../../middleware/auth.middleware.js';

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

// Project activity feed
router.get('/projects/:projectId', activityController.getProjectActivity);

// Team activity feed
router.get('/teams/:teamId', activityController.getTeamActivity);

export default router;
