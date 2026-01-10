import { create } from 'zustand';
import { teamsAPI } from '@/services/api';
import { socketService } from '@/services/socket';
import { toast } from 'react-hot-toast';

export const useTeamStore = create((set, get) => ({
  teams: [],
  currentTeam: null,
  teamMembers: [],
  teamInvitations: [],
  teamStats: null,
  isLoading: false,
  error: null,

  // Fetch all user's teams
  fetchTeams: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await teamsAPI.getUserTeams();
      const teams = data.teams || data.data?.teams || data.data || [];
      set({ teams, isLoading: false });
      return teams;
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to fetch teams';
      set({ error: errorMsg, isLoading: false });
      toast.error(errorMsg);
      throw error;
    }
  },

  // Fetch single team by ID
  fetchTeam: async (teamId) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await teamsAPI.getTeamById(teamId);
      const team = data.data.team;
      set({
        currentTeam: team,
        teamMembers: team.members || [],
        isLoading: false,
      });

      // Join team room for real-time updates
      socketService.joinTeam(teamId);

      return team;
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to fetch team';
      set({ error: errorMsg, isLoading: false });
      toast.error(errorMsg);
      throw error;
    }
  },

  // Create new team
  createTeam: async (teamData) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await teamsAPI.createTeam(teamData);
      const newTeam = data.data.team;
      set((state) => ({
        teams: [...state.teams, newTeam],
        currentTeam: newTeam,
        isLoading: false,
      }));
      toast.success('Team created successfully!');
      return newTeam;
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to create team';
      set({ error: errorMsg, isLoading: false });
      toast.error(errorMsg);
      throw error;
    }
  },

  // Update team
  updateTeam: async (teamId, updates) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await teamsAPI.updateTeam(teamId, updates);
      const updatedTeam = data.data.team;
      set((state) => ({
        teams: state.teams.map((t) => (t._id === teamId ? updatedTeam : t)),
        currentTeam:
          state.currentTeam?._id === teamId ? updatedTeam : state.currentTeam,
        isLoading: false,
      }));
      toast.success('Team updated successfully!');
      return updatedTeam;
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to update team';
      set({ error: errorMsg, isLoading: false });
      toast.error(errorMsg);
      throw error;
    }
  },

  // Delete team
  deleteTeam: async (teamId) => {
    set({ isLoading: true, error: null });
    try {
      await teamsAPI.deleteTeam(teamId);
      set((state) => ({
        teams: state.teams.filter((t) => t._id !== teamId),
        currentTeam: state.currentTeam?._id === teamId ? null : state.currentTeam,
        isLoading: false,
      }));
      socketService.leaveTeam(teamId);
      toast.success('Team deleted successfully!');
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to delete team';
      set({ error: errorMsg, isLoading: false });
      toast.error(errorMsg);
      throw error;
    }
  },

  // Invite member by email
  inviteMemberByEmail: async (teamId, email, role) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await teamsAPI.inviteMemberByEmail(teamId, email, role);
      toast.success('Invitation sent successfully!');
      // Refresh invitations list
      get().fetchTeamInvitations(teamId);
      return data.data.invitation;
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to send invitation';
      set({ error: errorMsg, isLoading: false });
      toast.error(errorMsg);
      throw error;
    }
  },

  // Add member directly (if user exists)
  inviteMember: async (teamId, email, role) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await teamsAPI.inviteMember(teamId, email, role);
      const newMember = data.data.member;
      set((state) => ({
        teamMembers: [...state.teamMembers, newMember],
        isLoading: false,
      }));
      toast.success('Member added successfully!');
      return newMember;
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to add member';
      set({ error: errorMsg, isLoading: false });
      toast.error(errorMsg);
      throw error;
    }
  },

  // Update member role
  updateMemberRole: async (teamId, memberId, role) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await teamsAPI.updateMemberRole(teamId, memberId, role);
      const updatedMember = data.data.member;
      set((state) => ({
        teamMembers: state.teamMembers.map((m) =>
          m.userId._id === memberId ? updatedMember : m
        ),
        isLoading: false,
      }));
      toast.success('Member role updated!');
      return updatedMember;
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to update role';
      set({ error: errorMsg, isLoading: false });
      toast.error(errorMsg);
      throw error;
    }
  },

  // Remove member
  removeMember: async (teamId, memberId) => {
    set({ isLoading: true, error: null });
    try {
      await teamsAPI.removeMember(teamId, memberId);
      set((state) => ({
        teamMembers: state.teamMembers.filter((m) => m.userId._id !== memberId),
        isLoading: false,
      }));
      toast.success('Member removed!');
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to remove member';
      set({ error: errorMsg, isLoading: false });
      toast.error(errorMsg);
      throw error;
    }
  },

  // Leave team
  leaveTeam: async (teamId) => {
    set({ isLoading: true, error: null });
    try {
      await teamsAPI.leaveTeam(teamId);
      set((state) => ({
        teams: state.teams.filter((t) => t._id !== teamId),
        currentTeam: state.currentTeam?._id === teamId ? null : state.currentTeam,
        isLoading: false,
      }));
      socketService.leaveTeam(teamId);
      toast.success('Left team successfully!');
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to leave team';
      set({ error: errorMsg, isLoading: false });
      toast.error(errorMsg);
      throw error;
    }
  },

  // Join team with invite code
  joinTeam: async (inviteCode) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await teamsAPI.joinTeam(inviteCode);
      const newMembership = data.data.member;
      // Refresh teams list
      await get().fetchTeams();
      toast.success(`Joined ${newMembership.team.name}!`);
      return newMembership;
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to join team';
      set({ error: errorMsg, isLoading: false });
      toast.error(errorMsg);
      throw error;
    }
  },

  // Accept invitation
  acceptInvitation: async (token) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await teamsAPI.acceptInvitation(token);
      await get().fetchTeams();
      toast.success('Invitation accepted!');
      return data.data.member;
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to accept invitation';
      set({ error: errorMsg, isLoading: false });
      toast.error(errorMsg);
      throw error;
    }
  },

  // Fetch team invitations
  fetchTeamInvitations: async (teamId) => {
    try {
      const { data } = await teamsAPI.getTeamInvitations(teamId);
      set({ teamInvitations: data.data.invitations });
      return data.data.invitations;
    } catch (error) {
      console.error('Failed to fetch invitations:', error);
      return [];
    }
  },

  // Cancel invitation
  cancelInvitation: async (teamId, invitationId) => {
    try {
      await teamsAPI.cancelInvitation(teamId, invitationId);
      set((state) => ({
        teamInvitations: state.teamInvitations.filter((i) => i._id !== invitationId),
      }));
      toast.success('Invitation cancelled!');
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to cancel invitation';
      toast.error(errorMsg);
      throw error;
    }
  },

  // Regenerate invite code
  regenerateInviteCode: async (teamId) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await teamsAPI.regenerateInviteCode(teamId);
      const updatedTeam = data.data.team;
      set((state) => ({
        currentTeam: state.currentTeam
          ? { ...state.currentTeam, inviteCode: updatedTeam.inviteCode }
          : null,
        isLoading: false,
      }));
      toast.success('Invite code regenerated!');
      return updatedTeam;
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to regenerate code';
      set({ error: errorMsg, isLoading: false });
      toast.error(errorMsg);
      throw error;
    }
  },

  // Transfer ownership
  transferOwnership: async (teamId, newOwnerId) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await teamsAPI.transferOwnership(teamId, newOwnerId);
      const updatedTeam = data.data.team;
      set((state) => ({
        currentTeam: updatedTeam,
        teamMembers: updatedTeam.members || state.teamMembers,
        isLoading: false,
      }));
      toast.success('Ownership transferred!');
      return updatedTeam;
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to transfer ownership';
      set({ error: errorMsg, isLoading: false });
      toast.error(errorMsg);
      throw error;
    }
  },

  // Update team settings
  updateTeamSettings: async (teamId, settings) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await teamsAPI.updateTeamSettings(teamId, settings);
      const updatedTeam = data.data.team;
      set((state) => ({
        currentTeam: state.currentTeam
          ? { ...state.currentTeam, settings: updatedTeam.settings }
          : null,
        isLoading: false,
      }));
      toast.success('Settings updated!');
      return updatedTeam;
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Failed to update settings';
      set({ error: errorMsg, isLoading: false });
      toast.error(errorMsg);
      throw error;
    }
  },

  // Fetch team stats
  fetchTeamStats: async (teamId) => {
    try {
      const { data } = await teamsAPI.getTeamStats(teamId);
      set({ teamStats: data.data.stats });
      return data.data.stats;
    } catch (error) {
      console.error('Failed to fetch stats:', error);
      return null;
    }
  },

  // Real-time socket handlers
  setupTeamListeners: (teamId) => {
    socketService.onTeamMemberAdded((data) => {
      set((state) => ({
        teamMembers: [...state.teamMembers, data.member],
      }));
      toast.success(`${data.member.userId.firstName} joined the team!`);
    });

    socketService.onTeamMemberRemoved((data) => {
      set((state) => ({
        teamMembers: state.teamMembers.filter((m) => m._id !== data.memberId),
      }));
    });

    socketService.onTeamMemberRoleUpdated((data) => {
      set((state) => ({
        teamMembers: state.teamMembers.map((m) =>
          m._id === data.member._id ? data.member : m
        ),
      }));
      toast.info('Member role updated');
    });

    socketService.onTeamUpdated((data) => {
      set((state) => ({
        currentTeam: state.currentTeam
          ? { ...state.currentTeam, ...data.updates }
          : null,
      }));
    });

    socketService.onTeamSettingsUpdated((data) => {
      set((state) => ({
        currentTeam: state.currentTeam
          ? { ...state.currentTeam, settings: data.settings }
          : null,
      }));
    });

    socketService.onOwnershipTransferred((data) => {
      toast.info('Team ownership has been transferred');
      get().fetchTeam(teamId);
    });

    socketService.onTeamDeleted((data) => {
      if (data.teamId === teamId) {
        toast.error('This team has been deleted');
        set({ currentTeam: null, teamMembers: [] });
        socketService.leaveTeam(teamId);
      }
    });
  },

  // Clear current team
  clearCurrentTeam: () => {
    const { currentTeam } = get();
    if (currentTeam) {
      socketService.leaveTeam(currentTeam._id);
    }
    set({ currentTeam: null, teamMembers: [], teamInvitations: [], teamStats: null });
  },

  // Reset store
  reset: () => {
    set({
      teams: [],
      currentTeam: null,
      teamMembers: [],
      teamInvitations: [],
      teamStats: null,
      isLoading: false,
      error: null,
    });
  },
}));
