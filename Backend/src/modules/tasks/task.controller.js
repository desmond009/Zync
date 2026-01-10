import { asyncHandler } from '../../utils/asyncHandler.js';
import { sendSuccess } from '../../utils/ApiResponse.js';
import taskService from './task.service.js';

class TaskController {
  /**
   * GET /api/v1/tasks?projectId=xxx
   * Fetch all tasks for a project
   */
  getTasks = asyncHandler(async (req, res) => {
    const { projectId, status, assignedToId, page, limit } = req.query;
    const tasks = await taskService.getTasks(projectId, {
      status,
      assignedToId,
      page: parseInt(page),
      limit: parseInt(limit),
    });
    sendSuccess(res, 200, { tasks }, 'Tasks retrieved successfully');
  });

  /**
   * POST /api/v1/tasks
   * Create a new task
   */
  createTask = asyncHandler(async (req, res) => {
    const task = await taskService.createTask(req.user.id, req.body, req.project, req.io);
    sendSuccess(res, 201, { task }, 'Task created successfully');
  });

  /**
   * GET /api/v1/tasks/:taskId
   * Get single task details
   */
  getTaskById = asyncHandler(async (req, res) => {
    const { taskId } = req.params;
    const task = await taskService.getTaskById(taskId, req.user.id);
    sendSuccess(res, 200, { task }, 'Task retrieved successfully');
  });

  /**
   * PATCH /api/v1/tasks/:taskId
   * Update task details
   */
  updateTask = asyncHandler(async (req, res) => {
    const { taskId } = req.params;
    const task = await taskService.updateTask(taskId, req.user.id, req.body, req.project, req.io);
    sendSuccess(res, 200, { task }, 'Task updated successfully');
  });

  /**
   * PATCH /api/v1/tasks/:taskId/move
   * Move task to different status/position
   */
  moveTask = asyncHandler(async (req, res) => {
    const { taskId } = req.params;
    const { status, position, projectId } = req.body;
    const task = await taskService.moveTask(taskId, req.user.id, status, position, projectId, req.io);
    sendSuccess(res, 200, { task }, 'Task moved successfully');
  });

  /**
   * PATCH /api/v1/tasks/:taskId/assign
   * Assign task to user
   */
  assignTask = asyncHandler(async (req, res) => {
    const { taskId } = req.params;
    const { assignedToId, projectId } = req.body;
    const task = await taskService.assignTask(taskId, req.user.id, assignedToId, projectId, req.io);
    sendSuccess(res, 200, { task }, assignedToId ? 'Task assigned successfully' : 'Task unassigned successfully');
  });

  /**
   * PATCH /api/v1/tasks/:taskId/complete
   * Mark task as completed
   */
  completeTask = asyncHandler(async (req, res) => {
    const { taskId } = req.params;
    const task = await taskService.completeTask(taskId, req.user.id, req.body.projectId, req.io);
    sendSuccess(res, 200, { task }, 'Task completed successfully');
  });

  /**
   * DELETE /api/v1/tasks/:taskId
   * Delete task
   */
  deleteTask = asyncHandler(async (req, res) => {
    const { taskId } = req.params;
    await taskService.deleteTask(taskId, req.user.id, req.body.projectId || req.query.projectId, req.io);
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
