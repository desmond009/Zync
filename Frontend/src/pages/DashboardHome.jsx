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
const StatCard = ({ icon: Icon, label, value, trend, color = 'violet' }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className={`rounded-xl border border-slate-800/50 bg-gradient-to-br from-slate-900/50 to-slate-950/50 p-6 backdrop-blur-sm hover:border-slate-700/50 transition-all group`}
  >
    <div className="flex items-start justify-between">
      <div>
        <p className="text-slate-400 text-sm font-medium mb-2">{label}</p>
        <p className="text-3xl font-bold text-slate-50 mb-1">{value}</p>
        {trend && (
          <p className={`text-xs font-medium flex items-center gap-1 ${trend > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            <TrendingUp size={14} />
            {trend > 0 ? '+' : ''}{trend}% from last month
          </p>
        )}
      </div>
      <div
        className={`w-12 h-12 rounded-lg bg-${color}-600/20 flex items-center justify-center group-hover:scale-110 transition-transform`}
      >
        <Icon className={`text-${color}-400`} size={24} />
      </div>
    </div>
  </motion.div>
);

// Project Card Component
const ProjectCard = ({ project }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    whileHover={{ y: -4 }}
    className="rounded-lg border border-slate-800/50 bg-slate-900/30 p-4 hover:border-slate-700/50 transition-all group cursor-pointer"
  >
    <div className="flex items-start justify-between mb-3">
      <div className="flex-1">
        <h3 className="font-semibold text-slate-200 group-hover:text-white transition-colors">
          {project.name}
        </h3>
        <p className="text-xs text-slate-500 mt-1">{project.description}</p>
      </div>
      <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
        {project.name.charAt(0)}
      </div>
    </div>
    <div className="flex items-center justify-between pt-3 border-t border-slate-800/50">
      <div className="flex items-center gap-4 text-xs text-slate-400">
        <span className="flex items-center gap-1">
          <CheckCircle2 size={14} className="text-emerald-500" />
          {project.tasks?.filter(t => t.status === 'DONE').length || 0} done
        </span>
        <span className="flex items-center gap-1">
          <Users size={14} className="text-blue-500" />
          {project.members?.length || 1} member
        </span>
      </div>
      <ArrowRight size={16} className="text-slate-600 group-hover:text-violet-400 transition-colors" />
    </div>
  </motion.div>
);

// Task Item Component
const TaskItem = ({ task, project }) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    animate={{ opacity: 1, x: 0 }}
    className="flex items-center gap-4 p-3 rounded-lg border border-slate-800/30 bg-slate-900/20 hover:bg-slate-900/40 transition-colors group"
  >
    <input
      type="checkbox"
      checked={task.status === 'DONE'}
      className="w-5 h-5 rounded border-slate-600 text-violet-600 cursor-pointer"
      readOnly
    />
    <div className="flex-1 min-w-0">
      <p className={`text-sm font-medium transition-colors ${task.status === 'DONE' ? 'text-slate-500 line-through' : 'text-slate-200 group-hover:text-white'}`}>
        {task.title}
      </p>
      <p className="text-xs text-slate-500">{project}</p>
    </div>
    <div className={`px-2 py-1 rounded text-xs font-medium flex-shrink-0 ${
      task.priority === 'HIGH' ? 'bg-red-600/20 text-red-400' :
      task.priority === 'MEDIUM' ? 'bg-yellow-600/20 text-yellow-400' :
      'bg-green-600/20 text-green-400'
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
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-slate-50 mb-2">
          Welcome back, {user?.name?.split(' ')[0] || 'there'}! 👋
        </h1>
        <p className="text-slate-400">Here's what's happening with your projects today.</p>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Projects Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-slate-50">Your Projects</h2>
              <p className="text-sm text-slate-400 mt-1">
                {projects.length} active {projects.length === 1 ? 'project' : 'projects'}
              </p>
            </div>
            <Link
              to="/projects"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-700 text-white font-medium transition-colors"
            >
              <Plus size={18} />
              New Project
            </Link>
          </div>

          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-24 rounded-lg bg-slate-800/50 animate-pulse" />
              ))}
            </div>
          ) : projects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            <div className="rounded-lg border border-slate-800/50 bg-slate-900/30 p-12 text-center">
              <FolderOpen className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-300 mb-2">No projects yet</h3>
              <p className="text-slate-500 mb-6">Create your first project to get started</p>
              <Link
                to="/projects"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-700 text-white font-medium transition-colors"
              >
                <Plus size={18} />
                Create Project
              </Link>
            </div>
          )}
        </motion.div>

        {/* Sidebar - Recent Tasks & Calendar */}
        <div className="space-y-6">
          {/* Recent Tasks */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="rounded-xl border border-slate-800/50 bg-gradient-to-br from-slate-900/50 to-slate-950/50 p-6 backdrop-blur-sm"
          >
            <h3 className="text-lg font-bold text-slate-50 mb-4 flex items-center gap-2">
              <Clock size={20} className="text-violet-400" />
              Recent Tasks
            </h3>

            {recentTasks.length > 0 ? (
              <div className="space-y-3">
                {recentTasks.map((task, idx) => (
                  <TaskItem key={task._id} task={task} project={task.projectName} />
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500 text-center py-8">
                No active tasks. All caught up! 🎉
              </p>
            )}
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="rounded-xl border border-slate-800/50 bg-gradient-to-br from-slate-900/50 to-slate-950/50 p-6 backdrop-blur-sm"
          >
            <h3 className="text-lg font-bold text-slate-50 mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <Link
                to="/projects/new"
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800/50 transition-colors text-slate-300 hover:text-white"
              >
                <Plus size={18} className="text-violet-400" />
                <span className="text-sm font-medium">New Project</span>
              </Link>
              <Link
                to="/teams"
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800/50 transition-colors text-slate-300 hover:text-white"
              >
                <Users size={18} className="text-blue-400" />
                <span className="text-sm font-medium">Browse Teams</span>
              </Link>
              <Link
                to="/chat"
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-800/50 transition-colors text-slate-300 hover:text-white"
              >
                <AlertCircle size={18} className="text-emerald-400" />
                <span className="text-sm font-medium">View Messages</span>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DashboardHome;
