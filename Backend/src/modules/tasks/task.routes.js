import express from 'express';
import taskController from './task.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { requireProjectAccess, requireProjectWrite } from '../../middleware/project.middleware.js';
import { validate } from '../../middleware/validation.js';
import {
  createTaskSchema,
  updateTaskSchema,
  getTaskSchema,
  createCommentSchema,
  updateCommentSchema,
  deleteCommentSchema,
  moveTaskSchema,
  assignTaskSchema,
  getTasksSchema,
} from './task.validation.js';

const router = express.Router();

router.use(authenticate);

/**
 * GET /api/v1/tasks?projectId=xxx
 * Fetch all tasks for a project
 */
router.get('/', validate(getTasksSchema), requireProjectAccess, taskController.getTasks);

/**
 * POST /api/v1/tasks
 * Create a new task
 */
router.post('/', validate(createTaskSchema), requireProjectAccess, requireProjectWrite, taskController.createTask);

/**
 * GET /api/v1/tasks/:taskId
 * Get single task details
 */
router.get('/:taskId', validate(getTaskSchema), requireProjectAccess, taskController.getTaskById);

/**
 * PATCH /api/v1/tasks/:taskId
 * Update task details
 */
router.patch('/:taskId', validate(updateTaskSchema), requireProjectAccess, requireProjectWrite, taskController.updateTask);

/**
 * PATCH /api/v1/tasks/:taskId/move
 * Move task to different status/position
 */
router.patch('/:taskId/move', validate(moveTaskSchema), requireProjectAccess, requireProjectWrite, taskController.moveTask);

/**
 * PATCH /api/v1/tasks/:taskId/assign
 * Assign task to user
 */
router.patch('/:taskId/assign', validate(assignTaskSchema), requireProjectAccess, requireProjectWrite, taskController.assignTask);

/**
 * PATCH /api/v1/tasks/:taskId/complete
 * Mark task as completed
 */
router.patch('/:taskId/complete', requireProjectAccess, requireProjectWrite, taskController.completeTask);

/**
 * DELETE /api/v1/tasks/:taskId
 * Delete task
 */
router.delete('/:taskId', validate(getTaskSchema), requireProjectAccess, requireProjectWrite, taskController.deleteTask);

router.post('/:taskId/comments', validate(createCommentSchema), taskController.createComment);
router.patch('/:taskId/comments/:commentId', validate(updateCommentSchema), taskController.updateComment);
router.delete('/:taskId/comments/:commentId', validate(deleteCommentSchema), taskController.deleteComment);

export default router;
