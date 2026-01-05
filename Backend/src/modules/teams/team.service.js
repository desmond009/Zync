import { prisma } from '../../config/database.js';
import { ApiError } from '../../utils/ApiError.js';
import { nanoid } from 'nanoid';

class TeamService {
  /**
   * Create a new team
   */
  async createTeam(userId, teamData) {
    const { name, description } = teamData;

    const team = await prisma.team.create({
      data: {
        name,
        description,
        ownerId: userId,
        inviteCode: nanoid(10),
        members: {
          create: {
            userId,
            role: 'OWNER',
          },
        },
      },
      include: {
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
        _count: {
          select: {
            members: true,
            projects: true,
          },
        },
      },
    });

    return team;
  }

  /**
   * Get team by ID
   */
  async getTeamById(teamId, userId) {
    const team = await prisma.team.findUnique({
      where: { id: teamId },
      include: {
        owner: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            avatar: true,
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
                lastSeenAt: true,
              },
            },
          },
          orderBy: { joinedAt: 'asc' },
        },
        projects: {
          select: {
            id: true,
            name: true,
            description: true,
            status: true,
            color: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
        },
        _count: {
          select: {
            members: true,
            projects: true,
          },
        },
      },
    });

    if (!team) {
      throw new ApiError(404, 'Team not found');
    }

    // Check if user is a member
    const isMember = team.members.some((member) => member.userId === userId);
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

    const team = await prisma.team.update({
      where: { id: teamId },
      data: updateData,
      include: {
        _count: {
          select: {
            members: true,
            projects: true,
          },
        },
      },
    });

    return team;
  }

  /**
   * Delete team
   */
  async deleteTeam(teamId, userId) {
    // Check if user is owner
    await this.checkTeamPermission(teamId, userId, ['OWNER']);

    await prisma.team.delete({
      where: { id: teamId },
    });

    return true;
  }

  /**
   * Invite member to team
   */
  async inviteMember(teamId, userId, email, role) {
    // Check if user is owner or admin
    await this.checkTeamPermission(teamId, userId, ['OWNER', 'ADMIN']);

    // Find user by email
    const userToInvite = await prisma.user.findUnique({
      where: { email },
    });

    if (!userToInvite) {
      throw new ApiError(404, 'User not found');
    }

    // Check if user is already a member
    const existingMember = await prisma.teamMember.findUnique({
      where: {
        teamId_userId: {
          teamId,
          userId: userToInvite.id,
        },
      },
    });

    if (existingMember) {
      throw new ApiError(400, 'User is already a member of this team');
    }

    // Add member
    const member = await prisma.teamMember.create({
      data: {
        teamId,
        userId: userToInvite.id,
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
   * Update member role
   */
  async updateMemberRole(teamId, userId, memberId, newRole) {
    // Check if user is owner or admin
    await this.checkTeamPermission(teamId, userId, ['OWNER', 'ADMIN']);

    // Cannot change owner role
    const member = await prisma.teamMember.findUnique({
      where: {
        teamId_userId: {
          teamId,
          userId: memberId,
        },
      },
    });

    if (!member) {
      throw new ApiError(404, 'Member not found');
    }

    if (member.role === 'OWNER') {
      throw new ApiError(400, 'Cannot change owner role');
    }

    const updatedMember = await prisma.teamMember.update({
      where: {
        teamId_userId: {
          teamId,
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

    return updatedMember;
  }

  /**
   * Remove member from team
   */
  async removeMember(teamId, userId, memberId) {
    // Check if user is owner or admin
    await this.checkTeamPermission(teamId, userId, ['OWNER', 'ADMIN']);

    // Cannot remove owner
    const member = await prisma.teamMember.findUnique({
      where: {
        teamId_userId: {
          teamId,
          userId: memberId,
        },
      },
    });

    if (!member) {
      throw new ApiError(404, 'Member not found');
    }

    if (member.role === 'OWNER') {
      throw new ApiError(400, 'Cannot remove team owner');
    }

    await prisma.teamMember.delete({
      where: {
        teamId_userId: {
          teamId,
          userId: memberId,
        },
      },
    });

    return true;
  }

  /**
   * Leave team
   */
  async leaveTeam(teamId, userId) {
    const member = await prisma.teamMember.findUnique({
      where: {
        teamId_userId: {
          teamId,
          userId,
        },
      },
    });

    if (!member) {
      throw new ApiError(404, 'You are not a member of this team');
    }

    if (member.role === 'OWNER') {
      throw new ApiError(400, 'Owner cannot leave the team. Transfer ownership or delete the team.');
    }

    await prisma.teamMember.delete({
      where: {
        teamId_userId: {
          teamId,
          userId,
        },
      },
    });

    return true;
  }

  /**
   * Join team with invite code
   */
  async joinTeam(userId, inviteCode) {
    const team = await prisma.team.findUnique({
      where: { inviteCode },
    });

    if (!team) {
      throw new ApiError(404, 'Invalid invite code');
    }

    // Check if already a member
    const existingMember = await prisma.teamMember.findUnique({
      where: {
        teamId_userId: {
          teamId: team.id,
          userId,
        },
      },
    });

    if (existingMember) {
      throw new ApiError(400, 'You are already a member of this team');
    }

    const member = await prisma.teamMember.create({
      data: {
        teamId: team.id,
        userId,
        role: 'MEMBER',
      },
      include: {
        team: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
      },
    });

    return member;
  }

  /**
   * Regenerate invite code
   */
  async regenerateInviteCode(teamId, userId) {
    // Check if user is owner or admin
    await this.checkTeamPermission(teamId, userId, ['OWNER', 'ADMIN']);

    const team = await prisma.team.update({
      where: { id: teamId },
      data: { inviteCode: nanoid(10) },
      select: { id: true, name: true, inviteCode: true },
    });

    return team;
  }

  /**
   * Helper: Check team permission
   */
  async checkTeamPermission(teamId, userId, allowedRoles) {
    const member = await prisma.teamMember.findUnique({
      where: {
        teamId_userId: {
          teamId,
          userId,
        },
      },
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
