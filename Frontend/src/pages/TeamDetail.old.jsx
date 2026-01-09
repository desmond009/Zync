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
} from 'lucide-react';
import { Button, Badge, Skeleton } from '@/components/ui';
import { useTeamStore } from '@/store/teamStore';
import { useAuthStore } from '@/store/authStore';
import { MemberCard } from '@/components/teams/MemberCard';
import { InviteMemberModal } from '@/components/teams/InviteMemberModal';
import { TeamSettings } from '@/components/teams/TeamSettings';
import { cn, getInitials } from '@/lib/utils';
import { toast } from 'react-hot-toast';

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
  };

  const handleRemoveMember = async (memberId) => {
    if (window.confirm('Are you sure you want to remove this member?')) {
      await removeMember(teamId, memberId);
    }
  };

  const tabs = [
    { id: 'members', label: 'Members', icon: Users, count: teamMembers.length },
    { id: 'stats', label: 'Overview', icon: BarChart3 },
    ...(canManageSettings ? [{ id: 'settings', label: 'Settings', icon: Settings }] : []),
  ];

  if (isLoading && !currentTeam) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 p-8">
        <Skeleton className="h-32 mb-6" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (!currentTeam) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            Team not found
          </h2>
          <Button onClick={() => navigate('/teams')}>Back to Teams</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<ArrowLeft className="w-4 h-4" />}
            onClick={() => navigate('/teams')}
            className="mb-4"
          >
            Back to Teams
          </Button>

          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-4">
                {currentTeam.avatar ? (
                  <img
                    src={currentTeam.avatar}
                    alt={currentTeam.name}
                    className="w-16 h-16 rounded-xl object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-2xl">
                    {getInitials(currentTeam.name)}
                  </div>
                )}
                <div>
                  <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
                    {currentTeam.name}
                  </h1>
                  {currentTeam.description && (
                    <p className="text-slate-600 dark:text-slate-400">
                      {currentTeam.description}
                    </p>
                  )}
                  <div className="flex items-center space-x-2 mt-2">
                    <Badge className="text-xs">
                      {teamMembers.length} member{teamMembers.length !== 1 && 's'}
                    </Badge>
                    <Badge className={cn(
                      'text-xs',
                      userRole === 'OWNER' && 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
                    )}>
                      Your role: {userRole}
                    </Badge>
                  </div>
                </div>
              </div>

              {canManageMembers && (
                <Button
                  variant="primary"
                  size="sm"
                  leftIcon={<UserPlus className="w-4 h-4" />}
                  onClick={() => setShowInviteModal(true)}
                >
                  Invite Member
                </Button>
              )}
            </div>

            {/* Invite Code Section */}
            {canManageMembers && currentTeam.inviteCode && (
              <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                      Team Invite Code
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Share this code with people you want to invite
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="px-4 py-2 bg-slate-100 dark:bg-slate-700 rounded-lg font-mono text-lg font-bold text-slate-900 dark:text-white">
                      {currentTeam.inviteCode}
                    </div>
                    <Button
                      variant="secondary"
                      size="sm"
                      leftIcon={copiedCode ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                      onClick={handleCopyInviteCode}
                    >
                      {copiedCode ? 'Copied!' : 'Copy'}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      leftIcon={<RefreshCw className="w-4 h-4" />}
                      onClick={handleRegenerateCode}
                    >
                      Regenerate
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="flex items-center space-x-1 bg-white dark:bg-slate-800 rounded-lg p-1 border border-slate-200 dark:border-slate-700">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'flex-1 flex items-center justify-center space-x-2 px-4 py-2.5 rounded-md text-sm font-medium transition-all duration-200',
                    activeTab === tab.id
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                  {tab.count !== undefined && (
                    <Badge className="ml-1 text-xs">{tab.count}</Badge>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'members' && (
            <motion.div
              key="members"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              {teamMembers.map((member) => (
                <MemberCard
                  key={member._id}
                  member={member}
                  currentUserRole={userRole}
                  onUpdateRole={handleUpdateRole}
                  onRemove={handleRemoveMember}
                />
              ))}
            </motion.div>
          )}

          {activeTab === 'stats' && (
            <motion.div
              key="stats"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6"
            >
              {teamStats && (
                <>
                  <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
                    <div className="text-3xl font-bold text-slate-900 dark:text-white mb-1">
                      {teamStats.projectCount}
                    </div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">Projects</div>
                  </div>
                  <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
                    <div className="text-3xl font-bold text-slate-900 dark:text-white mb-1">
                      {teamStats.totalTasks}
                    </div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">Total Tasks</div>
                  </div>
                  <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
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
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <TeamSettings team={currentTeam} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Invite Modal */}
      <InviteMemberModal
        isOpen={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        onInvite={handleInviteMember}
      />
    </div>
  );
};

export default TeamDetail;
