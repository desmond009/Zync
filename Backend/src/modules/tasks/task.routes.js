import express from 'express';
import taskController from './task.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { validate } from '../../middleware/validation.js';
import {
  createTaskSchema,
  updateTaskSchema,
  getTaskSchema,
  createCommentSchema,
  updateCommentSchema,
  deleteCommentSchema,
} from './task.validation.js';

const router = express.Router();

router.use(authenticate);

router.post('/', validate(createTaskSchema), taskController.createTask);
router.get('/:taskId', validate(getTaskSchema), taskController.getTaskById);
router.patch('/:taskId', validate(updateTaskSchema), taskController.updateTask);
router.delete('/:taskId', validate(getTaskSchema), taskController.deleteTask);

router.post('/:taskId/comments', validate(createCommentSchema), taskController.createComment);
router.patch('/:taskId/comments/:commentId', validate(updateCommentSchema), taskController.updateComment);
router.delete('/:taskId/comments/:commentId', validate(deleteCommentSchema), taskController.deleteComment);

export default router;
