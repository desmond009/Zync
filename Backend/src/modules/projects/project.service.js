import { ApiError } from '../../utils/ApiError.js';
import { Project, ProjectMember, TeamMember, Task, Message, User } from '../../models/index.js';
import mongoose from 'mongoose';
import activityService from '../activities/activity.service.js';

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

    // Validate teamId
    if (!teamId) {
      throw new ApiError(400, 'Team ID is required');
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
   * Get all projects for a user
   */
  async getUserProjects(userId) {
    const projects = await Project.find()
      .populate({ path: 'team', select: 'id name' })
      .populate({
        path: 'members',
        populate: {
          path: 'userId',
          select: 'id email firstName lastName avatar',
        },
      })
      .lean();

    // Filter projects where user is a member
    return projects.filter((project) =>
      project.members.some((member) => member.userId._id.toString() === userId)
    );
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
    const member = await this.checkProjectPermission(projectId, userId);

    // Get project to validate teamId
    const project = await Project.findById(projectId).select('teamId');
    if (!project) {
      throw new ApiError(404, 'Project not found');
    }

    const query = { 
      projectId,
      teamId: project.teamId, // Enforce team scoping
    };
    
    if (cursor) {
      query._id = { $lt: cursor };
    }

    const messages = await Message.find(query)
      .populate({
        path: 'sender',
        select: 'id firstName lastName avatar',
      })
      .sort({ sequenceNumber: -1 }) // Sort by sequence number for deterministic ordering
      .limit(limit + 1);

    const hasMore = messages.length > limit;
    const data = hasMore ? messages.slice(0, -1) : messages;
    const nextCursor = hasMore ? data[data.length - 1]._id : null;

    return { messages: data, nextCursor, hasMore };
  }

  /**
   * Get project members
   */
  async getProjectMembers(projectId, userId) {
    // Check access
    await this.checkProjectPermission(projectId, userId, ['MANAGER', 'CONTRIBUTOR', 'VIEWER']);

    const members = await ProjectMember.find({ projectId })
      .populate('userId', 'id email firstName lastName avatar')
      .lean();

    return members;
  }

  /**
   * Send message to project
   */
  async sendMessage(projectId, userId, content, io) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Verify access
      await this.checkProjectPermission(projectId, userId, ['MANAGER', 'CONTRIBUTOR', 'VIEWER']);

      // Get project for teamId
      const project = await Project.findById(projectId).select('teamId').session(session);
      if (!project) {
        throw new ApiError(404, 'Project not found');
      }

      // Get next sequence number atomically
      const lastMessage = await Message.findOne({ projectId })
        .sort({ sequenceNumber: -1 })
        .select('sequenceNumber')
        .session(session);

      const sequenceNumber = lastMessage ? lastMessage.sequenceNumber + 1 : 1;

      // Create message
      const [message] = await Message.create(
        [
          {
            content,
            projectId,
            teamId: project.teamId,
            senderId: userId,
            type: 'TEXT',
            sequenceNumber,
          },
        ],
        { session }
      );

      // Populate sender
      await message.populate('sender', 'id firstName lastName avatar email');

      // Create activity
      await activityService.createActivity(
        'MESSAGE_SENT',
        projectId,
        project.teamId,
        userId,
        {
          messageId: message._id,
          preview: content.substring(0, 100),
        },
        { session }
      );

      await session.commitTransaction();

      // Emit socket event AFTER DB commit
      if (io) {
        io.to(`project:${projectId}`).emit('message:created', {
          message: message.toObject(),
        });
      }

      return message.toObject();
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
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

    // Ensure role-based access control
    if (!allowedRoles) {
      throw new ApiError(400, 'Allowed roles must be specified');
    }

    if (allowedRoles && !allowedRoles.includes(member.role)) {
      throw new ApiError(403, 'You do not have permission to perform this action');
    }

    return member;
  }
}

export default new ProjectService();
