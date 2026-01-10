import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { Project, ProjectMember, TeamMember } from '../models/index.js';

/**
 * CRITICAL: Project Authorization Middleware
 * 
 * Ensures:
 * 1. User belongs to the team
 * 2. User has access to the project
 * 3. No information leakage about project existence
 * 4. Consistent authorization across all project operations
 */

/**
 * Verify user has access to project
 * Attaches project and member info to request
 */
export const requireProjectAccess = asyncHandler(async (req, res, next) => {
  const projectId = req.params.projectId || req.body.projectId || req.query.projectId;
  const userId = req.user.id;

  if (!projectId) {
    throw new ApiError(400, 'Project ID is required');
  }

  // Fetch project
  const project = await Project.findById(projectId);
  if (!project) {
    throw new ApiError(404, 'Project not found');
  }

  // Verify user is team member
  const teamMember = await TeamMember.findOne({
    teamId: project.teamId,
    userId,
  });

  if (!teamMember) {
    // Don't leak project existence
    throw new ApiError(404, 'Project not found');
  }

  // Verify user is project member
  const projectMember = await ProjectMember.findOne({
    projectId,
    userId,
  });

  if (!projectMember) {
    throw new ApiError(403, 'Access denied to this project');
  }

  // Attach to request for downstream use
  req.project = project;
  req.projectMember = projectMember;
  req.teamMember = teamMember;

  next();
});

/**
 * Verify user has specific role in project
 */
export const requireProjectRole = (allowedRoles) => {
  return asyncHandler(async (req, res, next) => {
    if (!req.projectMember) {
      throw new ApiError(500, 'Project access must be verified first');
    }

    if (!allowedRoles.includes(req.projectMember.role)) {
      throw new ApiError(403, 'Insufficient permissions for this operation');
    }

    next();
  });
};

/**
 * Verify user is project manager
 */
export const requireProjectManager = requireProjectRole(['MANAGER']);

/**
 * Verify user can write to project
 */
export const requireProjectWrite = requireProjectRole(['MANAGER', 'CONTRIBUTOR']);

/**
 * Helper function for service-level authorization
 * Use this in services when middleware isn't applicable
 */
export const verifyProjectAccess = async (projectId, userId) => {
  const project = await Project.findById(projectId);
  if (!project) {
    throw new ApiError(404, 'Project not found');
  }

  const teamMember = await TeamMember.findOne({
    teamId: project.teamId,
    userId,
  });

  if (!teamMember) {
    throw new ApiError(404, 'Project not found');
  }

  const projectMember = await ProjectMember.findOne({
    projectId,
    userId,
  });

  if (!projectMember) {
    throw new ApiError(403, 'Access denied to this project');
  }

  return { project, projectMember, teamMember };
};

/**
 * Verify multiple users have project access
 * Used for assignment operations
 */
export const verifyUsersInProject = async (projectId, userIds) => {
  const project = await Project.findById(projectId);
  if (!project) {
    throw new ApiError(404, 'Project not found');
  }

  const projectMembers = await ProjectMember.find({
    projectId,
    userId: { $in: userIds },
  });

  const foundUserIds = projectMembers.map((pm) => pm.userId.toString());
  const missingUsers = userIds.filter((id) => !foundUserIds.includes(id.toString()));

  if (missingUsers.length > 0) {
    throw new ApiError(400, 'Some users are not members of this project');
  }

  return { project, projectMembers };
};
