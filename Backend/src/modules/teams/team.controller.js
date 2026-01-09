import { asyncHandler } from '../../utils/asyncHandler.js';
import { sendSuccess } from '../../utils/ApiResponse.js';
import teamService from './team.service.js';

class TeamController {
  /**
   * @route   POST /api/v1/teams
   * @desc    Create a new team
   * @access  Private
   */
  createTeam = asyncHandler(async (req, res) => {
    const team = await teamService.createTeam(req.user.id, req.body);

    sendSuccess(res, 201, { team }, 'Team created successfully');
  });

  /**
   * @route   GET /api/v1/teams/:teamId
   * @desc    Get team by ID
   * @access  Private
   */
  getTeamById = asyncHandler(async (req, res) => {
    const { teamId } = req.params;

    const team = await teamService.getTeamById(teamId, req.user.id);

    sendSuccess(res, 200, { team }, 'Team retrieved successfully');
  });

  /**
   * @route   PATCH /api/v1/teams/:teamId
   * @desc    Update team
   * @access  Private (Owner/Admin)
   */
  updateTeam = asyncHandler(async (req, res) => {
    const { teamId } = req.params;

    const team = await teamService.updateTeam(teamId, req.user.id, req.body);

    sendSuccess(res, 200, { team }, 'Team updated successfully');
  });

  /**
   * @route   DELETE /api/v1/teams/:teamId
   * @desc    Delete team
   * @access  Private (Owner)
   */
  deleteTeam = asyncHandler(async (req, res) => {
    const { teamId } = req.params;

    await teamService.deleteTeam(teamId, req.user.id);

    sendSuccess(res, 200, null, 'Team deleted successfully');
  });

  /**
   * @route   POST /api/v1/teams/:teamId/invite
   * @desc    Invite member to team
   * @access  Private (Owner/Admin)
   */
  inviteMember = asyncHandler(async (req, res) => {
    const { teamId } = req.params;
    const { email, role } = req.body;

    const member = await teamService.inviteMember(teamId, req.user.id, email, role);

    sendSuccess(res, 201, { member }, 'Member invited successfully');
  });

  /**
   * @route   PATCH /api/v1/teams/:teamId/members/:memberId
   * @desc    Update member role
   * @access  Private (Owner/Admin)
   */
  updateMemberRole = asyncHandler(async (req, res) => {
    const { teamId, memberId } = req.params;
    const { role } = req.body;

    const member = await teamService.updateMemberRole(teamId, req.user.id, memberId, role);

    sendSuccess(res, 200, { member }, 'Member role updated successfully');
  });

  /**
   * @route   DELETE /api/v1/teams/:teamId/members/:memberId
   * @desc    Remove member from team
   * @access  Private (Owner/Admin)
   */
  removeMember = asyncHandler(async (req, res) => {
    const { teamId, memberId } = req.params;

    await teamService.removeMember(teamId, req.user.id, memberId);

    sendSuccess(res, 200, null, 'Member removed successfully');
  });

  /**
   * @route   POST /api/v1/teams/:teamId/leave
   * @desc    Leave team
   * @access  Private
   */
  leaveTeam = asyncHandler(async (req, res) => {
    const { teamId } = req.params;

    await teamService.leaveTeam(teamId, req.user.id);

    sendSuccess(res, 200, null, 'Left team successfully');
  });

  /**
   * @route   POST /api/v1/teams/join
   * @desc    Join team with invite code
   * @access  Private
   */
  joinTeam = asyncHandler(async (req, res) => {
    const { inviteCode } = req.body;

    const member = await teamService.joinTeam(req.user.id, inviteCode);

    sendSuccess(res, 200, { member }, 'Joined team successfully');
  });

  /**
   * @route   POST /api/v1/teams/:teamId/regenerate-invite
   * @desc    Regenerate team invite code
   * @access  Private (Owner/Admin)
   */
  regenerateInviteCode = asyncHandler(async (req, res) => {
    const { teamId } = req.params;

    const team = await teamService.regenerateInviteCode(teamId, req.user.id);

    sendSuccess(res, 200, { team }, 'Invite code regenerated successfully');
  });

  /**
   * @route   GET /api/v1/teams
   * @desc    Get all teams for current user
   * @access  Private
   */
  getUserTeams = asyncHandler(async (req, res) => {
    const teams = await teamService.getUserTeams(req.user.id);

    sendSuccess(res, 200, { teams }, 'Teams retrieved successfully');
  });

  /**
   * @route   POST /api/v1/teams/:teamId/invite-email
   * @desc    Invite member via email
   * @access  Private (Owner/Admin)
   */
  inviteMemberByEmail = asyncHandler(async (req, res) => {
    const { teamId } = req.params;
    const { email, role } = req.body;

    const invitation = await teamService.inviteMemberByEmail(teamId, req.user.id, email, role);

    sendSuccess(res, 201, { invitation }, 'Invitation sent successfully');
  });

  /**
   * @route   POST /api/v1/teams/accept-invite/:token
   * @desc    Accept team invitation
   * @access  Private
   */
  acceptInvitation = asyncHandler(async (req, res) => {
    const { token } = req.params;

    const member = await teamService.acceptInvitation(req.user.id, token);

    sendSuccess(res, 200, { member }, 'Invitation accepted successfully');
  });

  /**
   * @route   GET /api/v1/teams/:teamId/invitations
   * @desc    Get team invitations
   * @access  Private (Owner/Admin)
   */
  getTeamInvitations = asyncHandler(async (req, res) => {
    const { teamId } = req.params;

    const invitations = await teamService.getTeamInvitations(teamId, req.user.id);

    sendSuccess(res, 200, { invitations }, 'Invitations retrieved successfully');
  });

  /**
   * @route   DELETE /api/v1/teams/:teamId/invitations/:invitationId
   * @desc    Cancel invitation
   * @access  Private (Owner/Admin)
   */
  cancelInvitation = asyncHandler(async (req, res) => {
    const { teamId, invitationId } = req.params;

    await teamService.cancelInvitation(teamId, req.user.id, invitationId);

    sendSuccess(res, 200, null, 'Invitation cancelled successfully');
  });

  /**
   * @route   POST /api/v1/teams/:teamId/transfer-ownership
   * @desc    Transfer team ownership
   * @access  Private (Owner)
   */
  transferOwnership = asyncHandler(async (req, res) => {
    const { teamId } = req.params;
    const { newOwnerId } = req.body;

    const team = await teamService.transferOwnership(teamId, req.user.id, newOwnerId);

    sendSuccess(res, 200, { team }, 'Ownership transferred successfully');
  });

  /**
   * @route   PATCH /api/v1/teams/:teamId/settings
   * @desc    Update team settings
   * @access  Private (Owner)
   */
  updateTeamSettings = asyncHandler(async (req, res) => {
    const { teamId } = req.params;

    const team = await teamService.updateTeamSettings(teamId, req.user.id, req.body);

    sendSuccess(res, 200, { team }, 'Team settings updated successfully');
  });

  /**
   * @route   GET /api/v1/teams/:teamId/stats
   * @desc    Get team statistics
   * @access  Private
   */
  getTeamStats = asyncHandler(async (req, res) => {
    const { teamId } = req.params;

    const stats = await teamService.getTeamStats(teamId, req.user.id);

    sendSuccess(res, 200, { stats }, 'Team statistics retrieved successfully');
  });
}

export default new TeamController();
