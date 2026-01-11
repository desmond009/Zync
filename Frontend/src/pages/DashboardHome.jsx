import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  CheckCircle2,
  AlertCircle,
  Users,
  FolderOpen,
  Plus,
  ArrowRight,
  Calendar,
  Clock,
} from 'lucide-react';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { useProjectStore } from '@/store/projectStore';
import { useAuthStore } from '@/store/authStore';

// Stat Card Component
const StatCard = ({ icon: Icon, label, value, trend, color = 'violet' }) => {
  const colorGradients = {
    violet: 'from-violet-600/40 via-purple-500/25 to-violet-700/35',
    indigo: 'from-indigo-600/40 via-blue-500/25 to-cyan-600/35',
    emerald: 'from-emerald-600/40 via-teal-500/25 to-green-600/35',
    blue: 'from-cyan-500/40 via-blue-600/25 to-teal-600/35',
  };
  
  const colorBg = colorGradients[color] || colorGradients.violet;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8, boxShadow: '0 25px 50px rgba(100, 50, 255, 0.15)' }}
      className={`rounded-3xl border border-white/15 bg-gradient-to-br ${colorBg} backdrop-blur-xl p-7 hover:border-white/30 transition-all group cursor-pointer relative overflow-hidden`}
    >
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <div className="absolute inset-0 bg-gradient-to-br from-white/8 via-transparent to-white/8"></div>
      </div>
      
      <div className="flex items-start justify-between relative z-10">
        <div>
          <p className="text-white/80 text-xs font-black mb-3 uppercase tracking-widest">{label}</p>
          <p className="text-5xl font-black text-white mb-2">{value}</p>
          {trend && (
            <motion.p 
              whileHover={{ x: 4 }}
              className={`text-xs font-bold flex items-center gap-1.5 ${trend > 0 ? 'text-emerald-300' : 'text-red-300'}`}
            >
              <TrendingUp size={14} />
              {trend > 0 ? '+' : ''}{trend}% from last month
            </motion.p>
          )}
        </div>
        <motion.div
          whileHover={{ scale: 1.18, rotate: 12 }}
          className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-md border border-white/25 shadow-lg"
        >
          <Icon className="text-white" size={32} />
        </motion.div>
      </div>
    </motion.div>
  );
};

// Project Card Component
const ProjectCard = ({ project }) => {
  const gradients = [
    'from-violet-600/45 via-purple-500/20 to-blue-600/40',
    'from-cyan-600/45 via-teal-500/20 to-emerald-600/40',
    'from-orange-600/45 via-pink-500/20 to-rose-600/40',
    'from-indigo-600/45 via-violet-500/20 to-purple-600/40',
  ];
  
  const gradientIndex = project.name.charCodeAt(0) % gradients.length;
  const bgGradient = gradients[gradientIndex];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8, boxShadow: '0 25px 50px rgba(100, 50, 255, 0.15)' }}
      className={`rounded-3xl border border-white/15 bg-gradient-to-br ${bgGradient} backdrop-blur-xl p-6 hover:border-white/30 transition-all group cursor-pointer relative overflow-hidden`}
    >
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <div className="absolute inset-0 bg-gradient-to-br from-white/8 via-transparent to-white/8"></div>
      </div>

      <div className="flex items-start justify-between mb-5 relative z-10">
        <div className="flex-1">
          <h3 className="font-black text-white group-hover:text-white transition-colors text-lg leading-tight">
            {project.name}
          </h3>
          <p className="text-sm text-white/70 mt-2 leading-relaxed">{project.description}</p>
        </div>
        <motion.div 
          whileHover={{ scale: 1.12, rotate: 8 }}
          className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center text-white text-sm font-black flex-shrink-0 backdrop-blur-md border border-white/30 shadow-lg"
        >
          {project.name.charAt(0).toUpperCase()}
        </motion.div>
      </div>
      <div className="flex items-center justify-between pt-4 border-t border-white/20 relative z-10">
        <div className="flex items-center gap-5 text-xs text-white/80">
          <motion.span 
            whileHover={{ x: 4 }}
            className="flex items-center gap-2 font-bold"
          >
            <CheckCircle2 size={16} className="text-teal-300" />
            {project.tasks?.filter(t => t.status === 'DONE').length || 0}
          </motion.span>
          <motion.span 
            whileHover={{ x: -4 }}
            className="flex items-center gap-2 font-bold"
          >
            <Users size={16} className="text-cyan-300" />
            {project.members?.length || 1}
          </motion.span>
        </div>
        <motion.div whileHover={{ x: 4 }}>
          <ArrowRight size={18} className="text-white/70 group-hover:text-white/95 transition-colors" />
        </motion.div>
      </div>
    </motion.div>
  );
};

// Task Item Component
const TaskItem = ({ task, project }) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    whileHover={{ x: 4 }}
    className="flex items-center gap-4 p-4 rounded-2xl border border-white/15 bg-white/6 hover:bg-white/12 transition-colors group backdrop-blur-sm"
  >
    <input
      type="checkbox"
      checked={task.status === 'DONE'}
      className="w-5 h-5 rounded border-white/40 text-teal-400 cursor-pointer accent-teal-400"
      readOnly
    />
    <div className="flex-1 min-w-0">
      <p className={`text-sm font-bold transition-colors ${task.status === 'DONE' ? 'text-white/35 line-through' : 'text-white/95 group-hover:text-white'}`}>
        {task.title}
      </p>
      <p className="text-xs text-white/50 font-medium mt-0.5">{project}</p>
    </div>
    <div className={`px-3 py-1.5 rounded-lg text-xs font-black flex-shrink-0 backdrop-blur-md border ${
      task.priority === 'HIGH' ? 'bg-red-600/35 text-red-200 border-red-400/40' :
      task.priority === 'MEDIUM' ? 'bg-amber-600/35 text-amber-200 border-amber-400/40' :
      'bg-emerald-600/35 text-emerald-200 border-emerald-400/40'
    }`}>
      {task.priority}
    </div>
  </motion.div>
);

export const DashboardHome = () => {
  const { user } = useAuthStore();
  const { projects, fetchProjects, isLoading } = useProjectStore();
  const [stats, setStats] = useState({
    totalProjects: 0,
    activeTasks: 0,
    completedToday: 0,
    teamMembers: 0,
  });

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    if (Array.isArray(projects)) {
      const activeTasks = projects.reduce(
        (sum, p) => sum + (p.tasks?.filter(t => t.status !== 'DONE').length || 0),
        0
      );
      const completedToday = projects.reduce((sum, p) => {
        const today = new Date().toDateString();
        return sum + (p.tasks?.filter(t => {
          const completedAt = t.completedAt ? new Date(t.completedAt).toDateString() : null;
          return completedAt === today && t.status === 'DONE';
        }).length || 0);
      }, 0);
      const teamMembers = new Set();
      projects.forEach(p => {
        p.members?.forEach(m => teamMembers.add(m._id));
      });

      setStats({
        totalProjects: projects.length,
        activeTasks,
        completedToday,
        teamMembers: teamMembers.size,
      });
    }
  }, [projects]);

  const recentTasks = projects
    .flatMap(p => (p.tasks || []).map(t => ({ ...t, projectName: p.name })))
    .filter(t => t.status !== 'DONE')
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 5);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 },
    },
  };

  return (
    <DashboardLayout>
      {/* Animated gradient background */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <motion.div 
          className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 opacity-95"
        />
        <motion.div 
          animate={{
            backgroundPosition: ['0% 0%', '100% 100%'],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            repeatType: 'reverse',
          }}
          className="absolute inset-0 bg-gradient-to-br from-violet-900/25 via-cyan-900/15 to-teal-900/20 opacity-70"
          style={{
            backgroundSize: '200% 200%',
          }}
        />
        <motion.div 
          animate={{
            backgroundPosition: ['100% 100%', '0% 0%'],
          }}
          transition={{
            duration: 22,
            repeat: Infinity,
            repeatType: 'reverse',
          }}
          className="absolute inset-0 bg-gradient-to-bl from-orange-900/15 via-transparent to-indigo-900/20 opacity-60"
          style={{
            backgroundSize: '200% 200%',
          }}
        />
        <motion.div 
          animate={{
            backgroundPosition: ['0% 100%', '100% 0%'],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            repeatType: 'reverse',
          }}
          className="absolute inset-0 bg-gradient-to-tr from-transparent via-purple-900/10 to-cyan-900/15 opacity-50"
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
        <motion.h1 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-5xl md:text-6xl font-black text-white mb-3 tracking-tight"
        >
          Welcome back, {user?.name?.split(' ')[0] || 'there'}! 👋
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="text-white/60 text-lg font-medium"
        >
          Here's what's happening with your projects today.
        </motion.p>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 relative z-10"
      >
        <StatCard
          icon={FolderOpen}
          label="Total Projects"
          value={stats.totalProjects}
          color="violet"
        />
        <StatCard
          icon={AlertCircle}
          label="Active Tasks"
          value={stats.activeTasks}
          trend={12}
          color="indigo"
        />
        <StatCard
          icon={CheckCircle2}
          label="Completed Today"
          value={stats.completedToday}
          color="emerald"
        />
        <StatCard
          icon={Users}
          label="Team Members"
          value={stats.teamMembers}
          color="blue"
        />
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
        {/* Projects Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2"
        >
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center justify-between mb-6"
          >
            <div>
              <h2 className="text-3xl font-black text-white">Your Projects</h2>
              <p className="text-white/60 text-sm mt-2 font-medium">
                {projects.length} active {projects.length === 1 ? 'project' : 'projects'}
              </p>
            </div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                to="/projects"
                className="inline-flex items-center gap-3 px-6 py-3 rounded-xl bg-gradient-to-r from-white to-gray-200 hover:from-gray-100 hover:to-white text-black font-black transition-all shadow-lg hover:shadow-xl"
              >
                <Plus size={20} />
                New Project
              </Link>
            </motion.div>
          </motion.div>

          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <motion.div 
                  key={i} 
                  className="h-28 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 animate-pulse"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                />
              ))}
            </div>
          ) : projects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {projects.slice(0, 6).map((project, idx) => (
                <motion.div
                  key={project._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <Link to={`/projects/${project._id}`}>
                    <ProjectCard project={project} />
                  </Link>
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-12 text-center"
            >
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <FolderOpen className="w-16 h-16 text-white/30 mx-auto mb-6" />
              </motion.div>
              <h3 className="text-2xl font-black text-white mb-2">No projects yet</h3>
              <p className="text-white/60 mb-8 font-medium">Create your first project to get started</p>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  to="/projects"
                  className="inline-flex items-center gap-3 px-6 py-3 rounded-xl bg-gradient-to-r from-white to-gray-200 hover:from-gray-100 hover:to-white text-black font-black transition-all shadow-lg hover:shadow-xl"
                >
                  <Plus size={20} />
                  Create Project
                </Link>
              </motion.div>
            </motion.div>
          )}
        </motion.div>

        {/* Sidebar - Recent Tasks & Calendar */}
        <div className="space-y-6">
          {/* Recent Tasks */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="rounded-3xl border border-white/15 bg-gradient-to-br from-violet-900/30 via-cyan-900/15 to-teal-900/20 backdrop-blur-xl p-7"
          >
            <h3 className="text-lg font-black text-white mb-5 flex items-center gap-3">
              <Clock size={24} className="text-cyan-300" />
              Recent Tasks
            </h3>

            {recentTasks.length > 0 ? (
              <div className="space-y-3">
                {recentTasks.map((task, idx) => (
                  <motion.div key={task._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: idx * 0.05 }}>
                    <TaskItem task={task} project={task.projectName} />
                  </motion.div>
                ))}
              </div>
            ) : (
              <motion.p 
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-sm text-white/60 text-center py-8 font-medium"
              >
                No active tasks. All caught up! 🎉
              </motion.p>
            )}
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="rounded-3xl border border-white/15 bg-gradient-to-br from-indigo-900/30 via-purple-900/15 to-orange-900/15 backdrop-blur-xl p-7"
          >
            <h3 className="text-lg font-black text-white mb-5">Quick Actions</h3>
            <div className="space-y-2">
              <motion.div whileHover={{ x: 4 }}>
                <Link
                  to="/projects/new"
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/10 transition-colors text-white font-bold"
                >
                  <Plus size={20} className="text-teal-300" />
                  <span className="text-sm">New Project</span>
                </Link>
              </motion.div>
              <motion.div whileHover={{ x: 4 }}>
                <Link
                  to="/teams"
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/10 transition-colors text-white font-bold"
                >
                  <Users size={20} className="text-cyan-300" />
                  <span className="text-sm">Browse Teams</span>
                </Link>
              </motion.div>
              <motion.div whileHover={{ x: 4 }}>
                <Link
                  to="/chat"
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/10 transition-colors text-white font-bold"
                >
                  <AlertCircle size={20} className="text-orange-300" />
                  <span className="text-sm">View Messages</span>
                </Link>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DashboardHome;
