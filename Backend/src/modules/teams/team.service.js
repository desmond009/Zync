import { ApiError } from '../../utils/ApiError.js';
import { Team, TeamMember, TeamInvitation, User, Project } from '../../models/index.js';
import { nanoid } from 'nanoid';
import { sendEmail } from '../../utils/email.service.js';
import mongoose from 'mongoose';

class TeamService {
  /**
   * Create a new team
   */
  async createTeam(userId, teamData) {
    const { name, description, avatar } = teamData;

    const team = new Team({
      name,
      description,
      avatar,
      ownerId: userId,
    });

    await team.save();

    // Add user as owner with full permissions
    const member = new TeamMember({
      teamId: team._id,
      userId,
      role: 'OWNER',
      status: 'ACTIVE',
      joinedAt: new Date(),
    });

    await member.save();

    // Populate and return
    await team.populate([
      {
        path: 'owner',
        select: 'id email firstName lastName avatar',
      },
      {
        path: 'members',
        populate: {
          path: 'userId',
          select: 'id email firstName lastName avatar',
        },
      },
    ]);

    return team;
  }

  /**
   * Get team by ID
   */
  async getTeamById(teamId, userId) {
    const team = await Team.findById(teamId)
      .where('isActive').equals(true)
      .populate([
        {
          path: 'owner',
          select: 'id email firstName lastName avatar',
        },
        {
          path: 'members',
          match: { status: 'ACTIVE' },
          populate: {
            path: 'userId',
            select: 'id email firstName lastName avatar lastSeenAt',
          },
          options: { sort: { joinedAt: 1 } },
        },
        {
          path: 'projects',
          select: 'id name description status color createdAt',
          options: { sort: { createdAt: -1 } },
        },
        {
          path: 'memberCount',
        },
      ]);

    if (!team) {
      throw new ApiError(404, 'Team not found');
    }

    // Check if user is a member
    const isMember = team.members.some(
      (member) => member.userId._id.toString() === userId
    );
    if (!isMember) {
      throw new ApiError(403, 'You are not a member of this team');
    }

    return team;
  }

  /**
   * Update team
   */
  async updateTeam(teamId, userId, updateData) {
    // Check if user is owner or admin
    await this.checkTeamPermission(teamId, userId, ['OWNER', 'ADMIN']);

    const team = await Team.findByIdAndUpdate(teamId, updateData, {
      new: true,
    });

    return team;
  }

  /**
   * Delete team
   */
  async deleteTeam(teamId, userId) {
    // Check if user is owner
    await this.checkTeamPermission(teamId, userId, ['OWNER']);

    await Team.findByIdAndDelete(teamId);
    await TeamMember.deleteMany({ teamId });
    await Project.deleteMany({ teamId });

    return true;
  }

  /**
   * Invite member to team
   */
  async inviteMember(teamId, userId, email, role) {
    // Check if user is owner or admin
    await this.checkTeamPermission(teamId, userId, ['OWNER', 'ADMIN']);

    // Find user by email
    const userToInvite = await User.findOne({ email });

    if (!userToInvite) {
      throw new ApiError(404, 'User not found');
    }

    // Check if user is already a member
    const existingMember = await TeamMember.findOne({
      teamId,
      userId: userToInvite._id,
    });

    if (existingMember) {
      throw new ApiError(400, 'User is already a member of this team');
    }

    // Add member
    const member = new TeamMember({
      teamId,
      userId: userToInvite._id,
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
   * Update member role
   */
  async updateMemberRole(teamId, userId, memberId, newRole) {
    // Check if user is owner or admin
    await this.checkTeamPermission(teamId, userId, ['OWNER', 'ADMIN']);

    // Cannot change owner role
    const member = await TeamMember.findOne({
      teamId,
      userId: memberId,
    });

    if (!member) {
      throw new ApiError(404, 'Member not found');
    }

    if (member.role === 'OWNER') {
      throw new ApiError(400, 'Cannot change owner role');
    }

    const updatedMember = await TeamMember.findOneAndUpdate(
      {
        teamId,
        userId: memberId,
      },
      { role: newRole },
      { new: true }
    ).populate({
      path: 'userId',
      select: 'id email firstName lastName avatar',
    });

    return updatedMember;
  }

  /**
   * Remove member from team
   */
  async removeMember(teamId, userId, memberId) {
    // Check if user is owner or admin
    await this.checkTeamPermission(teamId, userId, ['OWNER', 'ADMIN']);

    // Cannot remove owner
    const member = await TeamMember.findOne({
      teamId,
      userId: memberId,
    });

    if (!member) {
      throw new ApiError(404, 'Member not found');
    }

    if (member.role === 'OWNER') {
      throw new ApiError(400, 'Cannot remove team owner');
    }

    await TeamMember.deleteOne({
      teamId,
      userId: memberId,
    });

    return true;
  }

  /**
   * Leave team
   */
  async leaveTeam(teamId, userId) {
    const member = await TeamMember.findOne({
      teamId,
      userId,
    });

    if (!member) {
      throw new ApiError(404, 'You are not a member of this team');
    }

    if (member.role === 'OWNER') {
      throw new ApiError(400, 'Owner cannot leave the team. Transfer ownership or delete the team.');
    }

    await TeamMember.deleteOne({
      teamId,
      userId,
    });

    return true;
  }

  /**
   * Join team with invite code
   */
  async joinTeam(userId, inviteCode) {
    const team = await Team.findOne({ inviteCode });

    if (!team) {
      throw new ApiError(404, 'Invalid invite code');
    }

    // Check if already a member
    const existingMember = await TeamMember.findOne({
      teamId: team._id,
      userId,
    });

    if (existingMember) {
      throw new ApiError(400, 'You are already a member of this team');
    }

    const member = new TeamMember({
      teamId: team._id,
      userId,
      role: 'MEMBER',
    });

    await member.save();
    await member.populate({
      path: 'team',
      select: 'id name description',
    });

    return member;
  }

  /**
   * Regenerate invite code
   */
  async regenerateInviteCode(teamId, userId) {
    // Check if user is owner or admin
    await this.checkTeamPermission(teamId, userId, ['OWNER', 'ADMIN']);

    const team = await Team.findByIdAndUpdate(
      teamId,
      { inviteCode: nanoid(10) },
      { new: true }
    ).select('id name inviteCode');

    return team;
  }

  /**
   * Helper: Check team permission
   */
  async checkTeamPermission(teamId, userId, allowedRoles) {
    const member = await TeamMember.findOne({
      teamId,
      userId,
    });

    if (!member) {
      throw new ApiError(403, 'You are not a member of this team');
    }

    if (!allowedRoles.includes(member.role)) {
      throw new ApiError(403, 'You do not have permission to perform this action');
    }

    return member;
  }

  /**
   * Get all teams for a user
   */
  async getUserTeams(userId) {
    const memberships = await TeamMember.find({
      userId,
      status: 'ACTIVE',
    }).populate({
      path: 'teamId',
      match: { isActive: true },
      populate: [
        {
          path: 'owner',
          select: 'firstName lastName avatar',
        },
        {
          path: 'memberCount',
        },
      ],
    });

    // Filter out null teams (soft deleted)
    const teams = memberships
      .filter((m) => m.teamId !== null)
      .map((m) => ({
        ...m.teamId.toObject(),
        userRole: m.role,
        userPermissions: m.permissions,
        joinedAt: m.joinedAt,
      }));

    return teams;
  }

  /**
   * Invite member via email (creates invitation)
   */
  async inviteMemberByEmail(teamId, userId, email, role) {
    // Check if user is owner or admin
    await this.checkTeamPermission(teamId, userId, ['OWNER', 'ADMIN']);

    const team = await Team.findById(teamId);
    if (!team) {
      throw new ApiError(404, 'Team not found');
    }

    // Check if invitation already exists
    const existingInvitation = await TeamInvitation.findOne({
      teamId,
      email: email.toLowerCase(),
      status: 'PENDING',
    });

    if (existingInvitation) {
      throw new ApiError(400, 'An invitation has already been sent to this email');
    }

    // Check if user already exists and is a member
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      const existingMember = await TeamMember.findOne({
        teamId,
        userId: existingUser._id,
      });

      if (existingMember) {
        throw new ApiError(400, 'User is already a member of this team');
      }
    }

    // Create invitation
    const invitation = new TeamInvitation({
      teamId,
      email: email.toLowerCase(),
      invitedBy: userId,
      role: role || 'MEMBER',
    });

    await invitation.save();

    // Send invitation email
    const inviter = await User.findById(userId);
    try {
      await sendEmail({
        to: email,
        subject: `You've been invited to join ${team.name} on Zync`,
        template: 'team-invitation',
        data: {
          teamName: team.name,
          inviterName: `${inviter.firstName} ${inviter.lastName}`,
          inviteLink: `${process.env.FRONTEND_URL}/teams/accept-invite/${invitation.token}`,
          role: role || 'MEMBER',
        },
      });
    } catch (emailError) {
      console.error('Failed to send invitation email:', emailError);
      // Don't fail the invitation if email fails
    }

    await invitation.populate([
      {
        path: 'team',
        select: 'name avatar',
      },
      {
        path: 'inviter',
        select: 'firstName lastName avatar',
      },
    ]);

    return invitation;
  }

  /**
   * Accept team invitation
   */
  async acceptInvitation(userId, token) {
    const invitation = await TeamInvitation.findOne({
      token,
      status: 'PENDING',
    }).populate('teamId');

    if (!invitation) {
      throw new ApiError(404, 'Invitation not found or has expired');
    }

    if (invitation.isExpired()) {
      invitation.status = 'EXPIRED';
      await invitation.save();
      throw new ApiError(400, 'This invitation has expired');
    }

    const user = await User.findById(userId);
    if (user.email.toLowerCase() !== invitation.email) {
      throw new ApiError(403, 'This invitation is not for your email address');
    }

    // Check if already a member
    const existingMember = await TeamMember.findOne({
      teamId: invitation.teamId,
      userId,
    });

    if (existingMember) {
      throw new ApiError(400, 'You are already a member of this team');
    }

    // Create team member
    const member = new TeamMember({
      teamId: invitation.teamId,
      userId,
      role: invitation.role,
      status: 'ACTIVE',
      invitedBy: invitation.invitedBy,
      invitedAt: invitation.createdAt,
      joinedAt: new Date(),
    });

    await member.save();

    // Update invitation status
    invitation.status = 'ACCEPTED';
    invitation.acceptedAt = new Date();
    await invitation.save();

    await member.populate([
      {
        path: 'teamId',
        select: 'id name slug avatar description',
      },
      {
        path: 'userId',
        select: 'id email firstName lastName avatar',
      },
    ]);

    return member;
  }

  /**
   * Get team invitations (pending)
   */
  async getTeamInvitations(teamId, userId) {
    await this.checkTeamPermission(teamId, userId, ['OWNER', 'ADMIN']);

    const invitations = await TeamInvitation.find({
      teamId,
      status: 'PENDING',
      expiresAt: { $gt: new Date() },
    })
      .populate({
        path: 'inviter',
        select: 'firstName lastName avatar',
      })
      .sort({ createdAt: -1 });

    return invitations;
  }

  /**
   * Cancel invitation
   */
  async cancelInvitation(teamId, userId, invitationId) {
    await this.checkTeamPermission(teamId, userId, ['OWNER', 'ADMIN']);

    const invitation = await TeamInvitation.findById(invitationId);

    if (!invitation || invitation.teamId.toString() !== teamId) {
      throw new ApiError(404, 'Invitation not found');
    }

    invitation.status = 'EXPIRED';
    await invitation.save();

    return true;
  }

  /**
   * Transfer team ownership
   */
  async transferOwnership(teamId, currentOwnerId, newOwnerId) {
    // Verify current user is owner
    await this.checkTeamPermission(teamId, currentOwnerId, ['OWNER']);

    // Verify new owner is a member
    const newOwnerMember = await TeamMember.findOne({
      teamId,
      userId: newOwnerId,
      status: 'ACTIVE',
    });

    if (!newOwnerMember) {
      throw new ApiError(400, 'New owner must be an active member of the team');
    }

    // Update team owner
    await Team.findByIdAndUpdate(teamId, { ownerId: newOwnerId });

    // Update current owner to admin
    await TeamMember.findOneAndUpdate(
      { teamId, userId: currentOwnerId },
      { role: 'ADMIN' }
    );

    // Update new owner role
    await TeamMember.findOneAndUpdate(
      { teamId, userId: newOwnerId },
      { role: 'OWNER' }
    );

    const team = await Team.findById(teamId).populate([
      {
        path: 'owner',
        select: 'id email firstName lastName avatar',
      },
      {
        path: 'members',
        populate: {
          path: 'userId',
          select: 'id email firstName lastName avatar',
        },
      },
    ]);

    return team;
  }

  /**
   * Update team settings
   */
  async updateTeamSettings(teamId, userId, settings) {
    await this.checkTeamPermission(teamId, userId, ['OWNER']);

    const team = await Team.findByIdAndUpdate(
      teamId,
      { settings },
      { new: true, runValidators: true }
    );

    return team;
  }

  /**
   * Get team statistics
   */
  async getTeamStats(teamId, userId) {
    await this.checkTeamPermission(teamId, userId, ['OWNER', 'ADMIN', 'MEMBER', 'VIEWER']);

    const [memberCount, projectCount, taskStats] = await Promise.all([
      TeamMember.countDocuments({ teamId, status: 'ACTIVE' }),
      Project.countDocuments({ teamId }),
      Project.aggregate([
        { $match: { teamId: mongoose.Types.ObjectId(teamId) } },
        {
          $lookup: {
            from: 'tasks',
            localField: '_id',
            foreignField: 'projectId',
            as: 'tasks',
          },
        },
        {
          $unwind: { path: '$tasks', preserveNullAndEmptyArrays: true },
        },
        {
          $group: {
            _id: null,
            totalTasks: { $sum: 1 },
            completedTasks: {
              $sum: { $cond: [{ $eq: ['$tasks.status', 'DONE'] }, 1, 0] },
            },
            inProgressTasks: {
              $sum: { $cond: [{ $eq: ['$tasks.status', 'IN_PROGRESS'] }, 1, 0] },
            },
          },
        },
      ]),
    ]);

    return {
      memberCount,
      projectCount,
      totalTasks: taskStats[0]?.totalTasks || 0,
      completedTasks: taskStats[0]?.completedTasks || 0,
      inProgressTasks: taskStats[0]?.inProgressTasks || 0,
    };
  }
}

export default new TeamService();
