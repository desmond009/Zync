import { asyncHandler } from '../../utils/asyncHandler.js';
import { sendSuccess } from '../../utils/ApiResponse.js';
import taskService from './task.service.js';

class TaskController {
  createTask = asyncHandler(async (req, res) => {
    const task = await taskService.createTask(req.user.id, req.body);
    sendSuccess(res, 201, { task }, 'Task created successfully');
  });

  getTaskById = asyncHandler(async (req, res) => {
    const { taskId } = req.params;
    const task = await taskService.getTaskById(taskId, req.user.id);
    sendSuccess(res, 200, { task }, 'Task retrieved successfully');
  });

  updateTask = asyncHandler(async (req, res) => {
    const { taskId } = req.params;
    const task = await taskService.updateTask(taskId, req.user.id, req.body);
    sendSuccess(res, 200, { task }, 'Task updated successfully');
  });

  deleteTask = asyncHandler(async (req, res) => {
    const { taskId } = req.params;
    await taskService.deleteTask(taskId, req.user.id);
    sendSuccess(res, 200, null, 'Task deleted successfully');
  });

  createComment = asyncHandler(async (req, res) => {
    const { taskId } = req.params;
    const { content } = req.body;
    const comment = await taskService.createComment(taskId, req.user.id, content);
    sendSuccess(res, 201, { comment }, 'Comment added successfully');
  });

  updateComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const { content } = req.body;
    const comment = await taskService.updateComment(commentId, req.user.id, content);
    sendSuccess(res, 200, { comment }, 'Comment updated successfully');
  });

  deleteComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    await taskService.deleteComment(commentId, req.user.id);
    sendSuccess(res, 200, null, 'Comment deleted successfully');
  });
}

export default new TaskController();
