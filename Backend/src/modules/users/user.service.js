import { ApiError } from '../../utils/ApiError.js';
import { getPaginationMeta, getSkip } from '../../utils/pagination.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../../config/cloudinary.js';
import { User, TeamMember, ProjectMember, Task } from '../../models/index.js';

class UserService {
  /**
   * Get user profile by ID
   */
  async getUserById(userId) {
    const user = await User.findById(userId).select(
      'id email firstName lastName avatar role isEmailVerified lastSeenAt createdAt'
    );

    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    return user;
  }

  /**
   * Update user profile
   */
  async updateProfile(userId, updateData) {
    const user = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
    }).select(
      'id email firstName lastName avatar role isEmailVerified lastSeenAt createdAt'
    );

    return user;
  }

  /**
   * Upload user avatar
   */
  async uploadAvatar(userId, filePath) {
    // Get current user to check if avatar exists
    const user = await User.findById(userId).select('avatar');

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
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { avatar: uploadResult.url },
      { new: true }
    ).select('id email firstName lastName avatar');

    return updatedUser;
  }

  /**
   * Delete user account (soft delete)
   */
  async deleteAccount(userId) {
    await User.findByIdAndUpdate(userId, {
      deletedAt: new Date(),
      refreshToken: null,
    });

    return true;
  }

  /**
   * Search users
   */
  async searchUsers(query, page = 1, limit = 20) {
    const skip = getSkip(page, limit);

    const searchRegex = new RegExp(query, 'i');
    const [users, total] = await Promise.all([
      User.find({
        $or: [
          { firstName: searchRegex },
          { lastName: searchRegex },
          { email: searchRegex },
        ],
      })
        .select('id email firstName lastName avatar')
        .skip(skip)
        .limit(limit)
        .sort({ firstName: 1 }),
      User.countDocuments({
        $or: [
          { firstName: searchRegex },
          { lastName: searchRegex },
          { email: searchRegex },
        ],
      }),
    ]);

    const pagination = getPaginationMeta(total, page, limit);

    return { users, pagination };
  }

  /**
   * Get user's teams
   */
  async getUserTeams(userId) {
    const teamMemberships = await TeamMember.find({
      userId,
    })
      .populate({
        path: 'teamId',
        select: 'id name description ownerId createdAt',
      })
      .sort({ joinedAt: -1 });

    return teamMemberships.map((membership) => ({
      ...membership.teamId.toObject(),
      role: membership.role,
      joinedAt: membership.joinedAt,
    }));
  }

  /**
   * Get user's projects
   */
  async getUserProjects(userId) {
    const projectMemberships = await ProjectMember.find({
      userId,
    })
      .populate({
        path: 'projectId',
        select: 'id name description status color teamId createdAt',
        populate: {
          path: 'teamId',
          select: 'id name',
        },
      })
      .sort({ joinedAt: -1 });

    return projectMemberships.map((membership) => ({
      ...membership.projectId.toObject(),
      role: membership.role,
      joinedAt: membership.joinedAt,
    }));
  }

  /**
   * Get user's tasks
   */
  async getUserTasks(userId, status = null) {
    const where = {
      $or: [{ createdById: userId }, { assignedToId: userId }],
    };

    if (status) {
      where.status = status;
    }

    const tasks = await Task.find(where)
      .populate([
        { path: 'projectId', select: 'id name color' },
        { path: 'assignedToId', select: 'id firstName lastName avatar' },
        { path: 'createdById', select: 'id firstName lastName avatar' },
      ])
      .sort({ dueDate: 1, createdAt: -1 });

    return tasks;
  }
}

export default new UserService();
