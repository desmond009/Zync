import express from 'express';
import projectController from './project.controller.js';
import { authenticate } from '../../middleware/auth.middleware.js';
import { validate } from '../../middleware/validation.js';
import {
  createProjectSchema,
  updateProjectSchema,
  getProjectSchema,
  addProjectMemberSchema,
  updateProjectMemberSchema,
} from './project.validation.js';

const router = express.Router();

router.use(authenticate);

router.post('/', validate(createProjectSchema), projectController.createProject);
router.get('/', projectController.getUserProjects);
router.get('/:projectId', validate(getProjectSchema), projectController.getProjectById);
router.patch('/:projectId', validate(updateProjectSchema), projectController.updateProject);
router.delete('/:projectId', validate(getProjectSchema), projectController.deleteProject);

router.post('/:projectId/members', validate(addProjectMemberSchema), projectController.addProjectMember);
router.patch('/:projectId/members/:memberId', validate(updateProjectMemberSchema), projectController.updateProjectMemberRole);
router.delete('/:projectId/members/:memberId', validate(getProjectSchema), projectController.removeProjectMember);

router.get('/:projectId/messages', validate(getProjectSchema), projectController.getProjectMessages);
router.post('/:projectId/messages', validate(getProjectSchema), projectController.sendMessage);
router.get('/:projectId/members', validate(getProjectSchema), projectController.getProjectMembers);

export default router;
