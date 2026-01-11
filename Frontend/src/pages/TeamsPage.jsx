import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Plus, Search, Users, MessageCircle } from 'lucide-react';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { useTeamStore } from '@/store/teamStore';

// Team Card Component
const TeamCard = ({ team }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    whileHover={{ y: -4 }}
    className="rounded-xl border border-slate-800/50 bg-gradient-to-br from-slate-900/50 to-slate-950/50 p-6 hover:border-slate-700/50 transition-all group cursor-pointer"
  >
    <Link to={`/teams/${team._id}`} className="block h-full">
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center text-white font-bold text-lg">
          {team.name.charAt(0)}
        </div>
        <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-600/20 text-blue-400">
          {team.members?.length || 0} members
        </span>
      </div>
      <h3 className="font-semibold text-slate-200 group-hover:text-white transition-colors mb-1">
        {team.name}
      </h3>
      <p className="text-sm text-slate-500 line-clamp-2 mb-4">{team.description}</p>
      <div className="flex items-center justify-between pt-4 border-t border-slate-800/50 text-xs text-slate-400">
        <span className="flex items-center gap-1">
          <Users size={14} />
          {team.members?.length || 0} members
        </span>
        <span className="flex items-center gap-1">
          <MessageCircle size={14} />
          {team.projects?.length || 0} projects
        </span>
      </div>
    </Link>
  </motion.div>
);

export const TeamsPage = () => {
  const { teams, fetchTeams, isLoading } = useTeamStore();
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchTeams();
  }, []);

  const filteredTeams = Array.isArray(teams)
    ? teams.filter(t =>
        t.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.description?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.05, delayChildren: 0.1 },
    },
  };

  return (
    <DashboardLayout>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-slate-50 mb-1">Teams</h1>
            <p className="text-slate-400">Collaborate with your teams</p>
          </div>
          <Link
            to="/teams/new"
            className="inline-flex items-center gap-2 px-4 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors w-fit"
          >
            <Plus size={20} />
            New Team
          </Link>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-600 w-5 h-5" />
          <input
            type="text"
            placeholder="Search teams..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-slate-800/40 border border-slate-700/50 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:bg-slate-800/60 transition-colors"
          />
        </div>
      </motion.div>

      {/* Teams Content */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-64 rounded-xl bg-slate-800/50 animate-pulse" />
            ))}
          </div>
        ) : filteredTeams.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTeams.map((team, idx) => (
              <motion.div
                key={team._id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
              >
                <TeamCard team={team} />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-slate-800/50 bg-slate-900/30 p-16 text-center">
            <Users className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-300 mb-2">No teams found</h3>
            <p className="text-slate-500 mb-6">
              {searchQuery ? 'Try adjusting your search' : 'Create your first team to get started'}
            </p>
            {!searchQuery && (
              <Link
                to="/teams/new"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition-colors"
              >
                <Plus size={18} />
                Create Team
              </Link>
            )}
          </div>
        )}
      </motion.div>
    </DashboardLayout>
  );
};

export default TeamsPage;
