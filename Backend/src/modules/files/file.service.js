import { ApiError } from '../../utils/ApiError.js';
import { FileMetadata, ProjectMember, Project } from '../../models/index.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../../config/cloudinary.js';

class FileService {
  /**
   * Upload file to project
   */
  async uploadFile(projectId, userId, file) {
    // Validate user has access to project
    const member = await ProjectMember.findOne({ projectId, userId });
    if (!member) {
      throw new ApiError(403, 'You do not have access to this project');
    }

    // Get project to extract teamId
    const project = await Project.findById(projectId).select('teamId');
    if (!project) {
      throw new ApiError(404, 'Project not found');
    }

    // Validate file size (e.g., 10MB limit)
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    if (file.size > MAX_FILE_SIZE) {
      throw new ApiError(400, 'File size exceeds maximum allowed (10MB)');
    }

    // Validate file type (whitelist approach)
    const ALLOWED_MIME_TYPES = [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
      'text/plain',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ];

    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      throw new ApiError(400, 'File type not allowed');
    }

    // Upload to Cloudinary
    const uploadResult = await uploadToCloudinary(file.path, {
      folder: `zync/projects/${projectId}`,
      resource_type: 'auto',
    });

    // Save file metadata to database
    const fileMetadata = new FileMetadata({
      filename: file.filename,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      url: uploadResult.url,
      publicId: uploadResult.publicId,
      projectId,
      teamId: project.teamId,
      uploaderId: userId,
    });

    await fileMetadata.save();
    await fileMetadata.populate([
      { path: 'uploader', select: 'id firstName lastName avatar' },
      { path: 'project', select: 'id name' },
    ]);

    return fileMetadata;
  }

  /**
   * Get project files
   */
  async getProjectFiles(projectId, userId, cursor = null, limit = 50) {
    // Validate user has access to project
    const member = await ProjectMember.findOne({ projectId, userId });
    if (!member) {
      throw new ApiError(403, 'You do not have access to this project');
    }

    const query = { projectId, deletedAt: null };
    if (cursor) {
      query._id = { $lt: cursor };
    }

    const files = await FileMetadata.find(query)
      .populate({ path: 'uploader', select: 'id firstName lastName avatar' })
      .sort({ createdAt: -1 })
      .limit(limit + 1);

    const hasMore = files.length > limit;
    const data = hasMore ? files.slice(0, -1) : files;
    const nextCursor = hasMore ? data[data.length - 1]._id : null;

    return { files: data, nextCursor, hasMore };
  }

  /**
   * Delete file (soft delete)
   */
  async deleteFile(fileId, userId) {
    const file = await FileMetadata.findById(fileId);

    if (!file) {
      throw new ApiError(404, 'File not found');
    }

    // Validate user has access to project
    const member = await ProjectMember.findOne({
      projectId: file.projectId,
      userId,
    });

    if (!member) {
      throw new ApiError(403, 'You do not have access to this project');
    }

    // Only uploader or project managers can delete files
    if (file.uploaderId.toString() !== userId && member.role !== 'MANAGER') {
      throw new ApiError(403, 'You do not have permission to delete this file');
    }

    // Soft delete
    file.deletedAt = new Date();
    await file.save();

    // Optionally delete from Cloudinary (uncomment for hard delete)
    // await deleteFromCloudinary(file.publicId);

    return true;
  }

  /**
   * Delete all project files (on project deletion)
   */
  async deleteProjectFiles(projectId) {
    const files = await FileMetadata.find({ projectId, deletedAt: null });

    // Soft delete all files
    await FileMetadata.updateMany(
      { projectId, deletedAt: null },
      { deletedAt: new Date() }
    );

    // Optionally delete from Cloudinary
    // for (const file of files) {
    //   await deleteFromCloudinary(file.publicId);
    // }

    return true;
  }

  /**
   * Validate file access (for serving files)
   */
  async validateFileAccess(fileId, userId) {
    const file = await FileMetadata.findById(fileId);

    if (!file || file.deletedAt) {
      throw new ApiError(404, 'File not found');
    }

    // Validate user has access to project
    const member = await ProjectMember.findOne({
      projectId: file.projectId,
      userId,
    });

    if (!member) {
      throw new ApiError(403, 'You do not have access to this file');
    }

    return file;
  }
}

export default new FileService();
