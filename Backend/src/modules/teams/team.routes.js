import express from 'express';
import teamController from './team.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { validate } from '../../middleware/validation.js';
import { requireOwnerOrAdmin, requireOwner, checkTeamAccess } from '../../middleware/team.middleware.js';
import {
  createTeamSchema,
  updateTeamSchema,
  getTeamSchema,
  inviteMemberSchema,
  updateMemberRoleSchema,
  removeMemberSchema,
  joinTeamSchema,
  inviteMemberByEmailSchema,
  transferOwnershipSchema,
  updateSettingsSchema,
} from './team.validation.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Team CRUD routes
router.post('/', validate(createTeamSchema), teamController.createTeam);

router.get('/', teamController.getUserTeams);

router.post('/join', validate(joinTeamSchema), teamController.joinTeam);

router.post('/accept-invite/:token', teamController.acceptInvitation);

router.get('/:teamId', validate(getTeamSchema), checkTeamAccess, teamController.getTeamById);

router.patch('/:teamId', validate(updateTeamSchema), checkTeamAccess, teamController.updateTeam);

router.delete('/:teamId', validate(getTeamSchema), requireOwner, teamController.deleteTeam);

// Team statistics
router.get('/:teamId/stats', validate(getTeamSchema), checkTeamAccess, teamController.getTeamStats);

// Team settings
router.patch('/:teamId/settings', validate(updateSettingsSchema), requireOwner, teamController.updateTeamSettings);

// Ownership transfer
router.post('/:teamId/transfer-ownership', validate(transferOwnershipSchema), requireOwner, teamController.transferOwnership);

// Invite code management
router.post('/:teamId/regenerate-invite', validate(getTeamSchema), requireOwnerOrAdmin, teamController.regenerateInviteCode);

// Email invitation routes
router.post('/:teamId/invite-email', validate(inviteMemberByEmailSchema), requireOwnerOrAdmin, teamController.inviteMemberByEmail);

router.get('/:teamId/invitations', validate(getTeamSchema), requireOwnerOrAdmin, teamController.getTeamInvitations);

router.delete('/:teamId/invitations/:invitationId', requireOwnerOrAdmin, teamController.cancelInvitation);

// Member management routes
router.post('/:teamId/invite', validate(inviteMemberSchema), requireOwnerOrAdmin, teamController.inviteMember);

router.patch('/:teamId/members/:memberId', validate(updateMemberRoleSchema), requireOwnerOrAdmin, teamController.updateMemberRole);

router.delete('/:teamId/members/:memberId', validate(removeMemberSchema), requireOwnerOrAdmin, teamController.removeMember);

router.post('/:teamId/leave', validate(getTeamSchema), checkTeamAccess, teamController.leaveTeam);

export default router;
