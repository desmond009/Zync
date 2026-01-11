import express from 'express';
import activityController from './activity.controller.js';
import { authenticate as authMiddleware } from '../../middleware/auth.middleware.js';
import { requireProjectAccess } from '../../middleware/project.middleware.js';

const router = express.Router();

// All routes require authentication
router.use(authMiddleware);

/**
 * GET /api/v1/activities?projectId=xxx
 * Get activities for a project (for frontend compatibility)
 */
router.get('/', requireProjectAccess, activityController.getProjectActivities);

// Project activity feed (legacy route)
router.get('/projects/:projectId', activityController.getProjectActivity);

// Team activity feed
router.get('/teams/:teamId', activityController.getTeamActivity);

export default router;
