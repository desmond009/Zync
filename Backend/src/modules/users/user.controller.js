import { asyncHandler } from '../../utils/asyncHandler.js';
import { sendSuccess, sendPaginatedResponse } from '../../utils/ApiResponse.js';
import userService from './user.service.js';

class UserController {
  /**
   * @route   GET /api/v1/users/:userId
   * @desc    Get user by ID
   * @access  Private
   */
  getUserById = asyncHandler(async (req, res) => {
    const { userId } = req.params;

    const user = await userService.getUserById(userId);

    sendSuccess(res, 200, { user }, 'User retrieved successfully');
  });

  /**
   * @route   PATCH /api/v1/users/profile
   * @desc    Update user profile
   * @access  Private
   */
  updateProfile = asyncHandler(async (req, res) => {
    const user = await userService.updateProfile(req.user.id, req.body);

    sendSuccess(res, 200, { user }, 'Profile updated successfully');
  });

  /**
   * @route   POST /api/v1/users/avatar
   * @desc    Upload user avatar
   * @access  Private
   */
  uploadAvatar = asyncHandler(async (req, res) => {
    if (!req.file) {
      throw new ApiError(400, 'Please upload an image');
    }

    const user = await userService.uploadAvatar(req.user.id, req.file.path);

    sendSuccess(res, 200, { user }, 'Avatar uploaded successfully');
  });

  /**
   * @route   DELETE /api/v1/users/account
   * @desc    Delete user account
   * @access  Private
   */
  deleteAccount = asyncHandler(async (req, res) => {
    await userService.deleteAccount(req.user.id);

    sendSuccess(res, 200, null, 'Account deleted successfully');
  });

  /**
   * @route   GET /api/v1/users/search
   * @desc    Search users
   * @access  Private
   */
  searchUsers = asyncHandler(async (req, res) => {
    const { query, page, limit } = req.query;

    const { users, pagination } = await userService.searchUsers(query, page, limit);

    sendPaginatedResponse(res, 200, { users }, pagination, 'Users retrieved successfully');
  });

  /**
   * @route   GET /api/v1/users/teams
   * @desc    Get user's teams
   * @access  Private
   */
  getUserTeams = asyncHandler(async (req, res) => {
    const teams = await userService.getUserTeams(req.user.id);

    sendSuccess(res, 200, { teams }, 'Teams retrieved successfully');
  });

  /**
   * @route   GET /api/v1/users/projects
   * @desc    Get user's projects
   * @access  Private
   */
  getUserProjects = asyncHandler(async (req, res) => {
    const projects = await userService.getUserProjects(req.user.id);

    sendSuccess(res, 200, { projects }, 'Projects retrieved successfully');
  });

  /**
   * @route   GET /api/v1/users/tasks
   * @desc    Get user's tasks
   * @access  Private
   */
  getUserTasks = asyncHandler(async (req, res) => {
    const { status } = req.query;

    const tasks = await userService.getUserTasks(req.user.id, status);

    sendSuccess(res, 200, { tasks }, 'Tasks retrieved successfully');
  });
}

export default new UserController();
