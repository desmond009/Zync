import express from 'express';
import { authenticate } from '../../middleware/auth.middleware.js';
import { requireProjectAccess, requireProjectWrite } from '../../middleware/project.middleware.js';
import fileController from './file.controller.js';

const router = express.Router();

router.use(authenticate);

/**
 * GET /api/v1/files?projectId=xxx
 * Get all files for a project
 */
router.get('/', requireProjectAccess, fileController.getProjectFiles);

/**
 * POST /api/v1/files
 * Upload a file to project
 */
router.post('/', requireProjectAccess, requireProjectWrite, fileController.uploadFile);

/**
 * DELETE /api/v1/files/:fileId
 * Delete a file
 */
router.delete('/:fileId', requireProjectAccess, requireProjectWrite, fileController.deleteFile);

/**
 * GET /api/v1/files/:fileId/download
 * Get download URL for file
 */
router.get('/:fileId/download', requireProjectAccess, fileController.getDownloadUrl);

export default router;
