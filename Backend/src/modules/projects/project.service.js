import { prisma } from '../../config/database.js';
import { ApiError } from '../../utils/ApiError.js';

class ProjectService {
  /**
   * Create a new project
   */
  async createProject(userId, projectData) {
    const { name, description, teamId, color } = projectData;

    // Check if user is team member
    const teamMember = await prisma.teamMember.findUnique({
      where: {
        teamId_userId: {
          teamId,
          userId,
        },
      },
    });

    if (!teamMember) {
      throw new ApiError(403, 'You are not a member of this team');
    }

    const project = await prisma.project.create({
      data: {
        name,
        description,
        teamId,
        color: color || '#3B82F6',
        members: {
          create: {
            userId,
            role: 'MANAGER',
          },
        },
      },
      include: {
        team: {
          select: {
            id: true,
            name: true,
          },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                avatar: true,
              },
            },
          },
        },
      },
    });

    return project;
  }

  /**
   * Get project by ID
   */
  async getProjectById(projectId, userId) {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        team: {
          select: {
            id: true,
            name: true,
          },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                avatar: true,
              },
            },
          },
        },
        tasks: {
          include: {
            assignedTo: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                avatar: true,
              },
            },
          },
          orderBy: [{ position: 'asc' }, { createdAt: 'desc' }],
        },
        _count: {
          select: {
            tasks: true,
            members: true,
            messages: true,
          },
        },
      },
    });

    if (!project) {
      throw new ApiError(404, 'Project not found');
    }

    // Check if user is a project member
    const isMember = project.members.some((member) => member.userId === userId);
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

    const project = await prisma.project.update({
      where: { id: projectId },
      data: updateData,
    });

    return project;
  }

  /**
   * Delete project
   */
  async deleteProject(projectId, userId) {
    await this.checkProjectPermission(projectId, userId, ['MANAGER']);

    await prisma.project.delete({
      where: { id: projectId },
    });

    return true;
  }

  /**
   * Add member to project
   */
  async addProjectMember(projectId, userId, memberUserId, role) {
    await this.checkProjectPermission(projectId, userId, ['MANAGER']);

    // Check if user is already a member
    const existingMember = await prisma.projectMember.findUnique({
      where: {
        projectId_userId: {
          projectId,
          userId: memberUserId,
        },
      },
    });

    if (existingMember) {
      throw new ApiError(400, 'User is already a project member');
    }

    const member = await prisma.projectMember.create({
      data: {
        projectId,
        userId: memberUserId,
        role,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
      },
    });

    return member;
  }

  /**
   * Update project member role
   */
  async updateProjectMemberRole(projectId, userId, memberId, newRole) {
    await this.checkProjectPermission(projectId, userId, ['MANAGER']);

    const member = await prisma.projectMember.update({
      where: {
        projectId_userId: {
          projectId,
          userId: memberId,
        },
      },
      data: { role: newRole },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
      },
    });

    return member;
  }

  /**
   * Remove project member
   */
  async removeProjectMember(projectId, userId, memberId) {
    await this.checkProjectPermission(projectId, userId, ['MANAGER']);

    await prisma.projectMember.delete({
      where: {
        projectId_userId: {
          projectId,
          userId: memberId,
        },
      },
    });

    return true;
  }

  /**
   * Get project messages
   */
  async getProjectMessages(projectId, userId, cursor = null, limit = 50) {
    await this.checkProjectPermission(projectId, userId);

    const messages = await prisma.message.findMany({
      where: { projectId },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit + 1,
      ...(cursor && {
        cursor: { id: cursor },
        skip: 1,
      }),
    });

    const hasMore = messages.length > limit;
    const data = hasMore ? messages.slice(0, -1) : messages;
    const nextCursor = hasMore ? data[data.length - 1].id : null;

    return { messages: data, nextCursor, hasMore };
  }

  /**
   * Helper: Check project permission
   */
  async checkProjectPermission(projectId, userId, allowedRoles = null) {
    const member = await prisma.projectMember.findUnique({
      where: {
        projectId_userId: {
          projectId,
          userId,
        },
      },
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
