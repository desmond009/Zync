import { asyncHandler } from '../../utils/asyncHandler.js';
import { sendSuccess } from '../../utils/ApiResponse.js';
import fileService from './file.service.js';

class FileController {
  /**
   * GET /api/v1/files?projectId=xxx
   * Get all files for a project
   */
  getProjectFiles = asyncHandler(async (req, res) => {
    const { projectId } = req.query;
    const files = await fileService.getProjectFiles(projectId);
    sendSuccess(res, 200, { files }, 'Files retrieved successfully');
  });

  /**
   * POST /api/v1/files
   * Upload a file
   */
  uploadFile = asyncHandler(async (req, res) => {
    const file = await fileService.uploadFile(req.user.id, req.body.projectId, req.file, req.project, req.io);
    sendSuccess(res, 201, { file }, 'File uploaded successfully');
  });

  /**
   * DELETE /api/v1/files/:fileId
   * Delete a file
   */
  deleteFile = asyncHandler(async (req, res) => {
    const { fileId } = req.params;
    await fileService.deleteFile(fileId, req.user.id, req.body.projectId || req.query.projectId, req.io);
    sendSuccess(res, 200, null, 'File deleted successfully');
  });

  /**
   * GET /api/v1/files/:fileId/download
   * Get download URL
   */
  getDownloadUrl = asyncHandler(async (req, res) => {
    const { fileId } = req.params;
    const url = await fileService.getDownloadUrl(fileId, req.user.id);
    sendSuccess(res, 200, { url }, 'Download URL retrieved successfully');
  });
}

export default new FileController();
