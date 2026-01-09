import { ApiError } from '../utils/ApiError.js';
import { TeamMember } from '../models/index.js';

/**
 * Role hierarchy for permission checks
 */
const ROLE_HIERARCHY = {
  OWNER: 4,
  ADMIN: 3,
  MEMBER: 2,
  VIEWER: 1,
};

/**
 * Check if user has access to team (is a member)
 */
export const checkTeamAccess = async (req, res, next) => {
  try {
    const { teamId } = req.params;
    const userId = req.user.id;

    const member = await TeamMember.findOne({
      teamId,
      userId,
      status: 'ACTIVE',
    });

    if (!member) {
      throw new ApiError(403, 'You are not a member of this team');
    }

    // Attach member info to request
    req.teamMember = member;
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Check if user has specific permission
 */
export const checkPermission = (permission) => {
  return async (req, res, next) => {
    try {
      const { teamId } = req.params;
      const userId = req.user.id;

      const member = await TeamMember.findOne({
        teamId,
        userId,
        status: 'ACTIVE',
      });

      if (!member) {
        throw new ApiError(403, 'You are not a member of this team');
      }

      if (!member.hasPermission(permission)) {
        throw new ApiError(403, `You don't have permission to ${permission}`);
      }

      req.teamMember = member;
      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Require minimum role level
 * Usage: requireRole('ADMIN') - requires ADMIN or OWNER
 */
export const requireRole = (minRole) => {
  return async (req, res, next) => {
    try {
      const { teamId } = req.params;
      const userId = req.user.id;

      const member = await TeamMember.findOne({
        teamId,
        userId,
        status: 'ACTIVE',
      });

      if (!member) {
        throw new ApiError(403, 'You are not a member of this team');
      }

      const memberLevel = ROLE_HIERARCHY[member.role] || 0;
      const requiredLevel = ROLE_HIERARCHY[minRole] || 0;

      if (memberLevel < requiredLevel) {
        throw new ApiError(403, `This action requires ${minRole} role or higher`);
      }

      req.teamMember = member;
      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Require specific role(s)
 * Usage: requireExactRole(['OWNER', 'ADMIN'])
 */
export const requireExactRole = (roles) => {
  const allowedRoles = Array.isArray(roles) ? roles : [roles];

  return async (req, res, next) => {
    try {
      const { teamId } = req.params;
      const userId = req.user.id;

      const member = await TeamMember.findOne({
        teamId,
        userId,
        status: 'ACTIVE',
      });

      if (!member) {
        throw new ApiError(403, 'You are not a member of this team');
      }

      if (!allowedRoles.includes(member.role)) {
        throw new ApiError(403, `This action requires one of the following roles: ${allowedRoles.join(', ')}`);
      }

      req.teamMember = member;
      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Check if user is team owner
 */
export const requireOwner = requireExactRole('OWNER');

/**
 * Check if user is owner or admin
 */
export const requireOwnerOrAdmin = requireExactRole(['OWNER', 'ADMIN']);

/**
 * Validate permission matrix based on role
 */
export const validateRolePermissions = (role) => {
  const permissions = {
    OWNER: {
      canCreateProjects: true,
      canDeleteProjects: true,
      canInviteMembers: true,
      canManageMembers: true,
      canManageSettings: true,
      canTransferOwnership: true,
      canDeleteTeam: true,
    },
    ADMIN: {
      canCreateProjects: true,
      canDeleteProjects: true,
      canInviteMembers: true,
      canManageMembers: true,
      canManageSettings: false,
      canTransferOwnership: false,
      canDeleteTeam: false,
    },
    MEMBER: {
      canCreateProjects: true,
      canDeleteProjects: false,
      canInviteMembers: false,
      canManageMembers: false,
      canManageSettings: false,
      canTransferOwnership: false,
      canDeleteTeam: false,
    },
    VIEWER: {
      canCreateProjects: false,
      canDeleteProjects: false,
      canInviteMembers: false,
      canManageMembers: false,
      canManageSettings: false,
      canTransferOwnership: false,
      canDeleteTeam: false,
    },
  };

  return permissions[role] || permissions.VIEWER;
};
