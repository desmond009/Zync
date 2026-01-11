import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Plus, Search, Users, MessageCircle } from 'lucide-react';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { useTeamStore } from '@/store/teamStore';

// Team Card Component
const TeamCard = ({ team }) => {
  const gradients = [
    'from-purple-500/30 via-pink-500/20 to-blue-500/30',
    'from-blue-500/30 via-cyan-500/20 to-purple-500/30',
    'from-pink-500/30 via-purple-500/20 to-cyan-500/30',
    'from-cyan-500/30 via-blue-500/20 to-pink-500/30',
  ];
  
  const gradientIndex = team.name.charCodeAt(0) % gradients.length;
  const bgGradient = gradients[gradientIndex];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -6, boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)' }}
      className={`rounded-2xl border border-white/10 bg-gradient-to-br ${bgGradient} backdrop-blur-xl p-6 hover:border-white/20 transition-all group cursor-pointer overflow-hidden relative`}
    >
      {/* Animated background gradient */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-white/5 animate-pulse"></div>
      </div>

      <Link to={`/teams/${team._id}`} className="block h-full relative z-10">
        <div className="flex items-start justify-between mb-4">
          <motion.div 
            whileHover={{ scale: 1.1, rotate: 5 }}
            className="w-12 h-12 rounded-xl bg-gradient-to-br from-white via-gray-100 to-gray-200 flex items-center justify-center text-black font-black text-lg shadow-lg"
          >
            {team.name.charAt(0).toUpperCase()}
          </motion.div>
          <motion.span 
            whileHover={{ scale: 1.05 }}
            className="px-3 py-1.5 rounded-full text-xs font-bold bg-white/20 text-white backdrop-blur-sm border border-white/20 hover:bg-white/30 transition-colors"
          >
            {team.members?.length || 0} members
          </motion.span>
        </div>
        <h3 className="font-black text-white group-hover:text-white transition-colors mb-2 text-lg tracking-tight">
          {team.name}
        </h3>
        <p className="text-sm text-white/70 line-clamp-2 mb-4 leading-relaxed">{team.description}</p>
        <div className="flex items-center justify-between pt-4 border-t border-white/10 text-xs text-white/60">
          <motion.span 
            whileHover={{ x: 4 }}
            className="flex items-center gap-2 font-semibold"
          >
            <Users size={14} className="text-white/80" />
            {team.members?.length || 0}
          </motion.span>
          <motion.span 
            whileHover={{ x: -4 }}
            className="flex items-center gap-2 font-semibold"
          >
            <MessageCircle size={14} className="text-white/80" />
            {team.projects?.length || 0}
          </motion.span>
        </div>
      </Link>
    </motion.div>
  );
};

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
      {/* Animated gradient background */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <motion.div 
          className="absolute inset-0 bg-gradient-to-br from-black via-black to-black opacity-90"
        />
        <motion.div 
          animate={{
            backgroundPosition: ['0% 0%', '100% 100%'],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            repeatType: 'reverse',
          }}
          className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-cyan-900/10 to-pink-900/20 opacity-60"
          style={{
            backgroundSize: '200% 200%',
          }}
        />
        <motion.div 
          animate={{
            backgroundPosition: ['100% 100%', '0% 0%'],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            repeatType: 'reverse',
          }}
          className="absolute inset-0 bg-gradient-to-bl from-blue-900/15 via-transparent to-purple-900/15"
          style={{
            backgroundSize: '200% 200%',
          }}
        />
      </div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8 relative z-10"
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <h1 className="text-5xl md:text-6xl font-black text-white mb-2 tracking-tight">
              Teams
            </h1>
            <p className="text-white/60 text-lg font-medium">Collaborate with your teams</p>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link
              to="/teams/new"
              className="inline-flex items-center gap-3 px-6 py-3 rounded-xl bg-gradient-to-r from-white to-gray-200 hover:from-gray-100 hover:to-white text-black font-black transition-all shadow-lg hover:shadow-xl"
            >
              <Plus size={22} />
              New Team
            </Link>
          </motion.div>
        </div>

        {/* Search */}
        <motion.div 
          className="relative max-w-md"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/40 w-5 h-5" />
          <motion.input
            type="text"
            placeholder="Search teams..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            whileFocus={{ scale: 1.02 }}
            className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:border-white/40 focus:bg-white/10 transition-all backdrop-blur-sm font-medium text-lg"
          />
        </motion.div>
      </motion.div>

      {/* Teams Content */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10"
      >
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <motion.div 
                key={i} 
                className="h-72 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 animate-pulse"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              />
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
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-16 text-center"
          >
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Users className="w-16 h-16 text-white/30 mx-auto mb-6" />
            </motion.div>
            <h3 className="text-2xl font-black text-white mb-3">No teams found</h3>
            <p className="text-white/60 mb-8 text-lg">
              {searchQuery ? 'Try adjusting your search' : 'Create your first team to get started'}
            </p>
            {!searchQuery && (
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  to="/teams/new"
                  className="inline-flex items-center gap-3 px-6 py-3 rounded-xl bg-gradient-to-r from-white to-gray-200 hover:from-gray-100 hover:to-white text-black font-black transition-all shadow-lg hover:shadow-xl"
                >
                  <Plus size={20} />
                  Create Team
                </Link>
              </motion.div>
            )}
          </motion.div>
        )}
      </motion.div>
    </DashboardLayout>
  );
};

export default TeamsPage;
