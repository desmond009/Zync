import { ApiError } from '../../utils/ApiError.js';
import { Team, TeamMember, User, Project } from '../../models/index.js';
import { nanoid } from 'nanoid';

class TeamService {
  /**
   * Create a new team
   */
  async createTeam(userId, teamData) {
    const { name, description } = teamData;

    const team = new Team({
      name,
      description,
      ownerId: userId,
      inviteCode: nanoid(10),
    });

    await team.save();

    // Add user as owner
    const member = new TeamMember({
      teamId: team._id,
      userId,
      role: 'OWNER',
    });

    await member.save();

    // Populate and return
    await team.populate([
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
    const team = await Team.findById(teamId).populate([
      {
        path: 'owner',
        select: 'id email firstName lastName avatar',
      },
      {
        path: 'members',
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
}

export default new TeamService();
