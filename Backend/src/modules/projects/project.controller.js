import { asyncHandler } from '../../utils/asyncHandler.js';
import { sendSuccess } from '../../utils/ApiResponse.js';
import projectService from './project.service.js';

class ProjectController {
  createProject = asyncHandler(async (req, res) => {
    const project = await projectService.createProject(req.user.id, req.body);
    sendSuccess(res, 201, { project }, 'Project created successfully');
  });

  getUserProjects = asyncHandler(async (req, res) => {
    const projects = await projectService.getUserProjects(req.user.id);
    sendSuccess(res, 200, { projects }, 'Projects retrieved successfully');
  });

  getProjectById = asyncHandler(async (req, res) => {
    const { projectId } = req.params;
    const project = await projectService.getProjectById(projectId, req.user.id);
    sendSuccess(res, 200, { project }, 'Project retrieved successfully');
  });

  updateProject = asyncHandler(async (req, res) => {
    const { projectId } = req.params;
    const project = await projectService.updateProject(projectId, req.user.id, req.body);
    sendSuccess(res, 200, { project }, 'Project updated successfully');
  });

  deleteProject = asyncHandler(async (req, res) => {
    const { projectId } = req.params;
    await projectService.deleteProject(projectId, req.user.id);
    sendSuccess(res, 200, null, 'Project deleted successfully');
  });

  addProjectMember = asyncHandler(async (req, res) => {
    const { projectId } = req.params;
    const { userId, role } = req.body;
    const member = await projectService.addProjectMember(projectId, req.user.id, userId, role);
    sendSuccess(res, 201, { member }, 'Member added successfully');
  });

  updateProjectMemberRole = asyncHandler(async (req, res) => {
    const { projectId, memberId } = req.params;
    const { role } = req.body;
    const member = await projectService.updateProjectMemberRole(projectId, req.user.id, memberId, role);
    sendSuccess(res, 200, { member }, 'Member role updated successfully');
  });

  removeProjectMember = asyncHandler(async (req, res) => {
    const { projectId, memberId } = req.params;
    await projectService.removeProjectMember(projectId, req.user.id, memberId);
    sendSuccess(res, 200, null, 'Member removed successfully');
  });

  getProjectMessages = asyncHandler(async (req, res) => {
    const { projectId } = req.params;
    const { cursor, limit } = req.query;
    const result = await projectService.getProjectMessages(projectId, req.user.id, cursor, limit);
    sendSuccess(res, 200, result, 'Messages retrieved successfully');
  });
}

export default new ProjectController();
