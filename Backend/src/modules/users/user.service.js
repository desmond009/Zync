import { prisma } from '../../config/database.js';
import { ApiError } from '../../utils/ApiError.js';
import { getPaginationMeta, getSkip } from '../../utils/pagination.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../../config/cloudinary.js';

class UserService {
  /**
   * Get user profile by ID
   */
  async getUserById(userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        avatar: true,
        role: true,
        isEmailVerified: true,
        lastSeenAt: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    return user;
  }

  /**
   * Update user profile
   */
  async updateProfile(userId, updateData) {
    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        avatar: true,
        role: true,
        isEmailVerified: true,
        lastSeenAt: true,
        createdAt: true,
      },
    });

    return user;
  }

  /**
   * Upload user avatar
   */
  async uploadAvatar(userId, filePath) {
    // Get current user to check if avatar exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { avatar: true },
    });

    // Delete old avatar if exists
    if (user.avatar) {
      const publicId = user.avatar.split('/').pop().split('.')[0];
      await deleteFromCloudinary(publicId);
    }

    // Upload new avatar
    const uploadResult = await uploadToCloudinary(filePath, {
      folder: 'zync/avatars',
      transformation: [
        { width: 400, height: 400, crop: 'fill', gravity: 'face' },
        { quality: 'auto' },
      ],
    });

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { avatar: uploadResult.url },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        avatar: true,
      },
    });

    return updatedUser;
  }

  /**
   * Delete user account (soft delete)
   */
  async deleteAccount(userId) {
    await prisma.user.update({
      where: { id: userId },
      data: {
        deletedAt: new Date(),
        refreshToken: null,
      },
    });

    return true;
  }

  /**
   * Search users
   */
  async searchUsers(query, page = 1, limit = 20) {
    const skip = getSkip(page, limit);

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where: {
          OR: [
            { firstName: { contains: query, mode: 'insensitive' } },
            { lastName: { contains: query, mode: 'insensitive' } },
            { email: { contains: query, mode: 'insensitive' } },
          ],
        },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          avatar: true,
        },
        skip,
        take: limit,
        orderBy: { firstName: 'asc' },
      }),
      prisma.user.count({
        where: {
          OR: [
            { firstName: { contains: query, mode: 'insensitive' } },
            { lastName: { contains: query, mode: 'insensitive' } },
            { email: { contains: query, mode: 'insensitive' } },
          ],
        },
      }),
    ]);

    const pagination = getPaginationMeta(total, page, limit);

    return { users, pagination };
  }

  /**
   * Get user's teams
   */
  async getUserTeams(userId) {
    const teamMemberships = await prisma.teamMember.findMany({
      where: { userId },
      include: {
        team: {
          select: {
            id: true,
            name: true,
            description: true,
            ownerId: true,
            createdAt: true,
            _count: {
              select: {
                members: true,
                projects: true,
              },
            },
          },
        },
      },
      orderBy: { joinedAt: 'desc' },
    });

    return teamMemberships.map((membership) => ({
      ...membership.team,
      role: membership.role,
      joinedAt: membership.joinedAt,
    }));
  }

  /**
   * Get user's projects
   */
  async getUserProjects(userId) {
    const projectMemberships = await prisma.projectMember.findMany({
      where: { userId },
      include: {
        project: {
          select: {
            id: true,
            name: true,
            description: true,
            status: true,
            color: true,
            teamId: true,
            createdAt: true,
            team: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: { joinedAt: 'desc' },
    });

    return projectMemberships.map((membership) => ({
      ...membership.project,
      role: membership.role,
      joinedAt: membership.joinedAt,
    }));
  }

  /**
   * Get user's tasks
   */
  async getUserTasks(userId, status = null) {
    const where = {
      OR: [{ createdById: userId }, { assignedToId: userId }],
    };

    if (status) {
      where.status = status;
    }

    const tasks = await prisma.task.findMany({
      where,
      include: {
        project: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
      },
      orderBy: [{ dueDate: 'asc' }, { createdAt: 'desc' }],
    });

    return tasks;
  }
}

export default new UserService();
