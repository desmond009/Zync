import { ApiError } from '../../utils/ApiError.js';
import { Project, ProjectMember, TeamMember, Task } from '../../models/index.js';

class ProjectService {
  /**
   * Create a new project
   */
  async createProject(userId, projectData) {
    const { name, description, teamId, color } = projectData;

    // Check if user is team member
    const teamMember = await TeamMember.findOne({
      teamId,
      userId,
    });

    if (!teamMember) {
      throw new ApiError(403, 'You are not a member of this team');
    }

    const project = new Project({
      name,
      description,
      teamId,
      color: color || '#3B82F6',
    });

    await project.save();

    // Add user as project manager
    const projectMember = new ProjectMember({
      projectId: project._id,
      userId,
      role: 'MANAGER',
    });

    await projectMember.save();

    // Populate and return
    await project.populate([
      { path: 'team', select: 'id name' },
      {
        path: 'members',
        populate: {
          path: 'userId',
          select: 'id email firstName lastName avatar',
        },
      },
    ]);

    return project;
  }

  /**
   * Get project by ID
   */
  async getProjectById(projectId, userId) {
    const project = await Project.findById(projectId).populate([
      { path: 'team', select: 'id name' },
      {
        path: 'members',
        populate: {
          path: 'userId',
          select: 'id email firstName lastName avatar',
        },
      },
      {
        path: 'tasks',
        populate: {
          path: 'assignedTo',
          select: 'id firstName lastName avatar',
        },
        options: { sort: { position: 1, createdAt: -1 } },
      },
    ]);

    if (!project) {
      throw new ApiError(404, 'Project not found');
    }

    // Check if user is a project member
    const isMember = project.members.some(
      (member) => member.userId._id.toString() === userId
    );
    if (!isMember) {
      throw new ApiError(403, 'You do not have access to this project');
    }

    return project;
  }

  /**
   * Update project
   */
  async updateProject(projectId, userId, updateData) {
    await this.checkProjectPermission(projectId, userId, ['MANAGER']);

    const project = await Project.findByIdAndUpdate(projectId, updateData, {
      new: true,
    });

    return project;
  }

  /**
   * Delete project
   */
  async deleteProject(projectId, userId) {
    await this.checkProjectPermission(projectId, userId, ['MANAGER']);

    await Project.findByIdAndDelete(projectId);
    await ProjectMember.deleteMany({ projectId });
    await Task.deleteMany({ projectId });

    return true;
  }

  /**
   * Add member to project
   */
  async addProjectMember(projectId, userId, memberUserId, role) {
    await this.checkProjectPermission(projectId, userId, ['MANAGER']);

    // Check if user is already a member
    const existingMember = await ProjectMember.findOne({
      projectId,
      userId: memberUserId,
    });

    if (existingMember) {
      throw new ApiError(400, 'User is already a project member');
    }

    const member = new ProjectMember({
      projectId,
      userId: memberUserId,
      role,
    });

    await member.save();
    await member.populate({
      path: 'userId',
      select: 'id email firstName lastName avatar',
    });

    return member;
  }

  /**
   * Update project member role
   */
  async updateProjectMemberRole(projectId, userId, memberId, newRole) {
    await this.checkProjectPermission(projectId, userId, ['MANAGER']);

    const member = await ProjectMember.findOneAndUpdate(
      {
        projectId,
        userId: memberId,
      },
      { role: newRole },
      { new: true }
    ).populate({
      path: 'userId',
      select: 'id email firstName lastName avatar',
    });

    return member;
  }

  /**
   * Remove project member
   */
  async removeProjectMember(projectId, userId, memberId) {
    await this.checkProjectPermission(projectId, userId, ['MANAGER']);

    await ProjectMember.deleteOne({
      projectId,
      userId: memberId,
    });

    return true;
  }

  /**
   * Get project messages
   */
  async getProjectMessages(projectId, userId, cursor = null, limit = 50) {
    await this.checkProjectPermission(projectId, userId);

    const query = { projectId };
    if (cursor) {
      query._id = { $lt: cursor };
    }

    const messages = await Message.find(query)
      .populate({
        path: 'sender',
        select: 'id firstName lastName avatar',
      })
      .sort({ createdAt: -1 })
      .limit(limit + 1);

    const hasMore = messages.length > limit;
    const data = hasMore ? messages.slice(0, -1) : messages;
    const nextCursor = hasMore ? data[data.length - 1]._id : null;

    return { messages: data, nextCursor, hasMore };
  }

  /**
   * Helper: Check project permission
   */
  async checkProjectPermission(projectId, userId, allowedRoles = null) {
    const member = await ProjectMember.findOne({
      projectId,
      userId,
    });

    if (!member) {
      throw new ApiError(403, 'You do not have access to this project');
    }

    if (allowedRoles && !allowedRoles.includes(member.role)) {
      throw new ApiError(403, 'You do not have permission to perform this action');
    }

    return member;
  }
}

export default new ProjectService();
