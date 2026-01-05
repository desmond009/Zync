import express from 'express';
import teamController from './team.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { validate } from '../../middleware/validation.js';
import {
  createTeamSchema,
  updateTeamSchema,
  getTeamSchema,
  inviteMemberSchema,
  updateMemberRoleSchema,
  removeMemberSchema,
  joinTeamSchema,
} from './team.validation.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Team routes
router.post('/', validate(createTeamSchema), teamController.createTeam);

router.post('/join', validate(joinTeamSchema), teamController.joinTeam);

router.get('/:teamId', validate(getTeamSchema), teamController.getTeamById);

router.patch('/:teamId', validate(updateTeamSchema), teamController.updateTeam);

router.delete('/:teamId', validate(getTeamSchema), teamController.deleteTeam);

// Member management routes
router.post('/:teamId/invite', validate(inviteMemberSchema), teamController.inviteMember);

router.patch('/:teamId/members/:memberId', validate(updateMemberRoleSchema), teamController.updateMemberRole);

router.delete('/:teamId/members/:memberId', validate(removeMemberSchema), teamController.removeMember);

router.post('/:teamId/leave', validate(getTeamSchema), teamController.leaveTeam);

router.post('/:teamId/regenerate-invite', validate(getTeamSchema), teamController.regenerateInviteCode);

export default router;
