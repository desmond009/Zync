import express from 'express';
import userController from './user.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { validate } from '../../middleware/validation.js';
import { updateProfileSchema, getUserSchema, searchUsersSchema } from './user.validation.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Profile routes
router.get('/profile', userController.getProfile);

router.get('/search', validate(searchUsersSchema), userController.searchUsers);

router.get('/teams', userController.getUserTeams);

router.get('/projects', userController.getUserProjects);

router.get('/tasks', userController.getUserTasks);

router.get('/:userId', validate(getUserSchema), userController.getUserById);

router.patch('/profile', validate(updateProfileSchema), userController.updateProfile);

router.delete('/account', userController.deleteAccount);

export default router;
