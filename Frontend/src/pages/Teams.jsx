import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Users, Search, LogIn } from 'lucide-react';
import { Button, Input, Skeleton } from '@/components/ui';
import { useTeamStore } from '@/store/teamStore';
import { useAuthStore } from '@/store/authStore';
import { TeamCard } from '@/components/teams/TeamCard';
import { CreateTeamModal } from '@/components/teams/CreateTeamModal';
import { JoinTeamModal } from '@/components/teams/JoinTeamModal';

export const Teams = () => {
  const { user } = useAuthStore();
  const { teams, isLoading, fetchTeams, createTeam, joinTeam } = useTeamStore();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchTeams();
  }, []);

  const filteredTeams = teams.filter((team) =>
    team.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateTeam = async (teamData) => {
    await createTeam(teamData);
  };

  const handleJoinTeam = async (inviteCode) => {
    await joinTeam(inviteCode);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">
                Your Teams
              </h1>
              <p className="text-slate-600 dark:text-slate-400">
                Manage and collaborate with your teams
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                variant="secondary"
                leftIcon={<LogIn className="w-4 h-4" />}
                onClick={() => setShowJoinModal(true)}
              >
                Join Team
              </Button>
              <Button
                variant="primary"
                leftIcon={<Plus className="w-4 h-4" />}
                onClick={() => setShowCreateModal(true)}
              >
                Create Team
              </Button>
            </div>
          </div>

          {/* Search */}
          <div className="max-w-md">
            <Input
              placeholder="Search teams..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search className="w-4 h-4" />}
            />
          </div>
        </motion.div>

        {/* Teams Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-48 rounded-xl" />
            ))}
          </div>
        ) : filteredTeams.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredTeams.map((team, index) => (
              <motion.div
                key={team._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <TeamCard
                  team={team}
                  userRole={team.userRole}
                />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-16"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 mb-4">
              <Users className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
              {searchQuery ? 'No teams found' : 'No teams yet'}
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-md mx-auto">
              {searchQuery
                ? 'Try adjusting your search query'
                : 'Create your first team or join an existing one to get started'}
            </p>
            {!searchQuery && (
              <div className="flex items-center justify-center space-x-3">
                <Button
                  variant="secondary"
                  leftIcon={<LogIn className="w-4 h-4" />}
                  onClick={() => setShowJoinModal(true)}
                >
                  Join Team
                </Button>
                <Button
                  variant="primary"
                  leftIcon={<Plus className="w-4 h-4" />}
                  onClick={() => setShowCreateModal(true)}
                >
                  Create Team
                </Button>
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* Modals */}
      <CreateTeamModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={handleCreateTeam}
      />
      <JoinTeamModal
        isOpen={showJoinModal}
        onClose={() => setShowJoinModal(false)}
        onJoin={handleJoinTeam}
      />
    </div>
  );
};

export default Teams;
