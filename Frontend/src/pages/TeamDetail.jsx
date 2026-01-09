import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Settings,
  Users,
  BarChart3,
  UserPlus,
  Copy,
  Check,
  RefreshCw,
  MoreVertical,
  Mail,
  Shield,
  Eye,
  Crown,
  Trash2,
} from 'lucide-react';
import { Button, Badge, Avatar, Skeleton } from '@/components/ui';
import { useTeamStore } from '@/store/teamStore';
import { useAuthStore } from '@/store/authStore';
import { InviteMemberModal } from '@/components/teams/InviteMemberModal';
import { TeamSettings } from '@/components/teams/TeamSettings';
import { cn, getInitials } from '@/lib/utils';
import { toast } from 'react-hot-toast';

const roleConfig = {
  OWNER: { icon: Crown, color: 'text-amber-600', bg: 'bg-amber-100 dark:bg-amber-900/30', label: 'Owner' },
  ADMIN: { icon: Shield, color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/30', label: 'Admin' },
  MEMBER: { icon: Users, color: 'text-green-600', bg: 'bg-green-100 dark:bg-green-900/30', label: 'Member' },
  VIEWER: { icon: Eye, color: 'text-slate-600', bg: 'bg-slate-100 dark:bg-slate-900/30', label: 'Viewer' },
};

const statusConfig = {
  ACTIVE: { color: 'text-green-600', bg: 'bg-green-100 dark:bg-green-900/30', label: 'Active' },
  INVITED: { color: 'text-amber-600', bg: 'bg-amber-100 dark:bg-amber-900/30', label: 'Invited' },
  INACTIVE: { color: 'text-slate-600', bg: 'bg-slate-100 dark:bg-slate-900/30', label: 'Inactive' },
};

export const TeamDetail = () => {
  const { teamId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const {
    currentTeam,
    teamMembers,
    teamStats,
    isLoading,
    fetchTeam,
    fetchTeamStats,
    inviteMemberByEmail,
    updateMemberRole,
    removeMember,
    regenerateInviteCode,
    setupTeamListeners,
    clearCurrentTeam,
  } = useTeamStore();

  const [activeTab, setActiveTab] = useState('members');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [actionMenuOpen, setActionMenuOpen] = useState(null);

  useEffect(() => {
    if (teamId) {
      fetchTeam(teamId);
      fetchTeamStats(teamId);
      setupTeamListeners(teamId);
    }

    return () => {
      clearCurrentTeam();
    };
  }, [teamId]);

  const userMember = teamMembers.find((m) => m.userId._id === user?.id);
  const userRole = userMember?.role || 'VIEWER';
  const canManageMembers = ['OWNER', 'ADMIN'].includes(userRole);
  const canManageSettings = userRole === 'OWNER';

  const handleCopyInviteCode = () => {
    if (currentTeam?.inviteCode) {
      navigator.clipboard.writeText(currentTeam.inviteCode);
      setCopiedCode(true);
      toast.success('Invite code copied!');
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  const handleRegenerateCode = async () => {
    if (window.confirm('Are you sure? The old invite code will no longer work.')) {
      await regenerateInviteCode(teamId);
    }
  };

  const handleInviteMember = async (email, role) => {
    await inviteMemberByEmail(teamId, email, role);
  };

  const handleUpdateRole = async (memberId, role) => {
    await updateMemberRole(teamId, memberId, role);
    setActionMenuOpen(null);
  };

  const handleRemoveMember = async (memberId) => {
    if (window.confirm('Are you sure you want to remove this member?')) {
      await removeMember(teamId, memberId);
      setActionMenuOpen(null);
    }
  };

  const tabs = [
    { id: 'members', label: 'Members', icon: Users, count: teamMembers.length },
    { id: 'stats', label: 'Overview', icon: BarChart3 },
    ...(canManageSettings ? [{ id: 'settings', label: 'Settings', icon: Settings }] : []),
  ];

  if (isLoading && !currentTeam) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Skeleton className="h-32 mb-6" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (!currentTeam) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            Team not found
          </h2>
          <Button onClick={() => navigate('/app/teams')}>Back to Teams</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/app/teams')}
          className="mb-4 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            <Avatar
              src={currentTeam.avatar}
              fallback={getInitials(currentTeam.name)}
              size="lg"
              className="w-14 h-14 rounded-xl"
            />
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                {currentTeam.name}
              </h1>
              {currentTeam.description && (
                <p className="text-slate-600 dark:text-slate-400 mt-1">
                  {currentTeam.description}
                </p>
              )}
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="secondary" className="text-xs">
                  {teamMembers.length} member{teamMembers.length !== 1 && 's'}
                </Badge>
                <Badge variant="secondary" className={cn(
                  'text-xs',
                  roleConfig[userRole]?.color,
                  roleConfig[userRole]?.bg
                )}>
                  Your role: {userRole}
                </Badge>
              </div>
            </div>
          </div>

          {canManageMembers && (
            <Button
              onClick={() => setShowInviteModal(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Invite Member
            </Button>
          )}
        </div>

        {/* Invite Code */}
        {canManageMembers && currentTeam.inviteCode && (
          <div className="mt-6 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-slate-900 dark:text-white mb-1">
                  Team Invite Code
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Share this code with people you want to invite
                </p>
              </div>
              <div className="flex items-center gap-2">
                <code className="px-3 py-1.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg font-mono text-sm font-semibold text-slate-900 dark:text-white">
                  {currentTeam.inviteCode}
                </code>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleCopyInviteCode}
                  className="min-w-[80px]"
                >
                  {copiedCode ? (
                    <>
                      <Check className="w-3 h-3 mr-1" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3 mr-1" />
                      Copy
                    </>
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRegenerateCode}
                >
                  <RefreshCw className="w-3 h-3 mr-1" />
                  Regenerate
                </Button>
              </div>
            </div>
          </div>
        )}
      </motion.div>

      {/* Tabs */}
      <div className="border-b border-slate-200 dark:border-slate-700 mb-6">
        <nav className="flex gap-6">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'flex items-center gap-2 pb-3 border-b-2 transition-colors',
                  isActive
                    ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                    : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                )}
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm font-medium">{tab.label}</span>
                {tab.count !== undefined && (
                  <span className={cn(
                    'px-2 py-0.5 rounded-full text-xs font-medium',
                    isActive
                      ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  )}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'members' && (
          <motion.div
            key="members"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden"
          >
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              <div className="col-span-4">Member</div>
              <div className="col-span-3">Email</div>
              <div className="col-span-2">Role</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-1 text-right">Actions</div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-slate-200 dark:divide-slate-700">
              {teamMembers.map((member) => {
                const RoleIcon = roleConfig[member.role]?.icon || Users;
                const isCurrentUser = member.userId._id === user?.id;
                const canModify = canManageMembers && !isCurrentUser && member.role !== 'OWNER';

                return (
                  <motion.div
                    key={member._id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                  >
                    {/* Member Info */}
                    <div className="col-span-4 flex items-center gap-3">
                      <div className="relative">
                        <Avatar
                          src={member.userId.avatar}
                          fallback={getInitials(member.userId.name)}
                          size="md"
                        />
                        {member.status === 'ACTIVE' && (
                          <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-slate-800"></span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                          {member.userId.name}
                          {isCurrentUser && (
                            <span className="ml-2 text-xs text-slate-500 dark:text-slate-400">(You)</span>
                          )}
                        </p>
                        {member.joinedAt && (
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            Joined {new Date(member.joinedAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Email */}
                    <div className="col-span-3">
                      <p className="text-sm text-slate-600 dark:text-slate-400 truncate">
                        {member.userId.email}
                      </p>
                    </div>

                    {/* Role */}
                    <div className="col-span-2">
                      <span className={cn(
                        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium',
                        roleConfig[member.role]?.bg,
                        roleConfig[member.role]?.color
                      )}>
                        <RoleIcon className="w-3 h-3" />
                        {roleConfig[member.role]?.label}
                      </span>
                    </div>

                    {/* Status */}
                    <div className="col-span-2">
                      <span className={cn(
                        'inline-flex px-2.5 py-1 rounded-md text-xs font-medium',
                        statusConfig[member.status]?.bg,
                        statusConfig[member.status]?.color
                      )}>
                        {statusConfig[member.status]?.label}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="col-span-1 text-right">
                      {canModify && (
                        <div className="relative">
                          <button
                            onClick={() => setActionMenuOpen(actionMenuOpen === member._id ? null : member._id)}
                            className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                          >
                            <MoreVertical className="w-4 h-4 text-slate-600 dark:text-slate-400" />
                          </button>

                          {/* Action Menu */}
                          <AnimatePresence>
                            {actionMenuOpen === member._id && (
                              <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg shadow-lg z-10 overflow-hidden"
                              >
                                <div className="py-1">
                                  <div className="px-3 py-2 text-xs font-medium text-slate-500 dark:text-slate-400 uppercase">
                                    Change Role
                                  </div>
                                  {['ADMIN', 'MEMBER', 'VIEWER'].map((role) => (
                                    <button
                                      key={role}
                                      onClick={() => handleUpdateRole(member._id, role)}
                                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600 transition-colors"
                                    >
                                      {React.createElement(roleConfig[role]?.icon, { className: 'w-4 h-4' })}
                                      {roleConfig[role]?.label}
                                      {member.role === role && (
                                        <Check className="w-3 h-3 ml-auto text-indigo-600" />
                                      )}
                                    </button>
                                  ))}
                                  <div className="border-t border-slate-200 dark:border-slate-600 my-1"></div>
                                  <button
                                    onClick={() => handleRemoveMember(member._id)}
                                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                    Remove Member
                                  </button>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {teamMembers.length === 0 && (
              <div className="px-6 py-12 text-center">
                <Users className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
                <p className="text-slate-600 dark:text-slate-400 text-sm">
                  No members yet
                </p>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'stats' && (
          <motion.div
            key="stats"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {teamStats && (
              <>
                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-6">
                  <div className="text-3xl font-bold text-slate-900 dark:text-white mb-1">
                    {teamStats.projectCount}
                  </div>
                  <div className="text-sm text-slate-500 dark:text-slate-400">Projects</div>
                </div>
                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-6">
                  <div className="text-3xl font-bold text-slate-900 dark:text-white mb-1">
                    {teamStats.totalTasks}
                  </div>
                  <div className="text-sm text-slate-500 dark:text-slate-400">Total Tasks</div>
                </div>
                <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-6">
                  <div className="text-3xl font-bold text-slate-900 dark:text-white mb-1">
                    {teamStats.completedTasks}
                  </div>
                  <div className="text-sm text-slate-500 dark:text-slate-400">Completed Tasks</div>
                </div>
              </>
            )}
          </motion.div>
        )}

        {activeTab === 'settings' && canManageSettings && (
          <motion.div
            key="settings"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <TeamSettings team={currentTeam} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Invite Modal */}
      <InviteMemberModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        onInvite={handleInviteMember}
      />

      {/* Overlay when action menu is open */}
      <AnimatePresence>
        {actionMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActionMenuOpen(null)}
            className="fixed inset-0 z-[5]"
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default TeamDetail;
