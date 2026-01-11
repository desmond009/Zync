import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Plus, Search, Filter, Grid, List } from 'lucide-react';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { useProjectStore } from '@/store/projectStore';
import { useTeamStore } from '@/store/teamStore';

// Project Card Component
const ProjectGridCard = ({ project }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    whileHover={{ y: -4 }}
    className="rounded-xl border border-slate-800/50 bg-gradient-to-br from-slate-900/50 to-slate-950/50 p-6 hover:border-slate-700/50 transition-all group cursor-pointer"
  >
    <Link to={`/projects/${project._id}`} className="block h-full">
      <div className="flex items-start justify-between mb-4">
        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center text-white font-bold text-lg">
          {project.name.charAt(0)}
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
          project.status === 'ACTIVE' ? 'bg-emerald-600/20 text-emerald-400' :
          project.status === 'ARCHIVED' ? 'bg-slate-600/20 text-slate-400' :
          'bg-yellow-600/20 text-yellow-400'
        }`}>
          {project.status}
        </span>
      </div>
      <h3 className="font-semibold text-slate-200 group-hover:text-white transition-colors mb-1">
        {project.name}
      </h3>
      <p className="text-sm text-slate-500 line-clamp-2 mb-4">{project.description}</p>
      <div className="flex items-center justify-between pt-4 border-t border-slate-800/50 text-xs text-slate-400">
        <span>{project.tasks?.length || 0} tasks</span>
        <span>{project.members?.length || 1} members</span>
      </div>
    </Link>
  </motion.div>
);

export const ProjectsPage = () => {
  const { projects, fetchProjects, isLoading } = useProjectStore();
  const { fetchTeams } = useTeamStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [viewMode, setViewMode] = useState('grid'); // grid or list

  useEffect(() => {
    fetchProjects();
    fetchTeams();
  }, []);

  const filteredProjects = Array.isArray(projects)
    ? projects
        .filter(p => {
          if (filterStatus === 'all') return true;
          return p.status === filterStatus;
        })
        .filter(p =>
          p.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.description?.toLowerCase().includes(searchQuery.toLowerCase())
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
            <h1 className="text-3xl font-bold text-slate-50 mb-1">Projects</h1>
            <p className="text-slate-400">Manage and organize your projects</p>
          </div>
          <Link
            to="/projects/new"
            className="inline-flex items-center gap-2 px-4 py-3 rounded-lg bg-violet-600 hover:bg-violet-700 text-white font-medium transition-colors w-fit"
          >
            <Plus size={20} />
            New Project
          </Link>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-600 w-5 h-5" />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-slate-800/40 border border-slate-700/50 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-violet-500/50 focus:bg-slate-800/60 transition-colors"
            />
          </div>

          <div className="flex gap-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 rounded-lg bg-slate-800/40 border border-slate-700/50 text-slate-300 text-sm focus:outline-none focus:border-violet-500/50 transition-colors"
            >
              <option value="all">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="COMPLETED">Completed</option>
              <option value="ARCHIVED">Archived</option>
            </select>

            <div className="flex border border-slate-700/50 rounded-lg bg-slate-800/40 p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 transition-colors ${viewMode === 'grid' ? 'text-violet-400' : 'text-slate-600 hover:text-slate-400'}`}
              >
                <Grid size={18} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 transition-colors ${viewMode === 'list' ? 'text-violet-400' : 'text-slate-600 hover:text-slate-400'}`}
              >
                <List size={18} />
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Projects Content */}
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
        ) : filteredProjects.length > 0 ? (
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
            {filteredProjects.map((project, idx) => (
              <motion.div
                key={project._id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: idx * 0.05 }}
              >
                <ProjectGridCard project={project} />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-slate-800/50 bg-slate-900/30 p-16 text-center">
            <Filter className="w-12 h-12 text-slate-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-300 mb-2">No projects found</h3>
            <p className="text-slate-500 mb-6">
              {searchQuery || filterStatus !== 'all' 
                ? 'Try adjusting your search or filters'
                : 'Create your first project to get started'}
            </p>
            {searchQuery === '' && filterStatus === 'all' && (
              <Link
                to="/projects/new"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-700 text-white font-medium transition-colors"
              >
                <Plus size={18} />
                Create Project
              </Link>
            )}
          </div>
        )}
      </motion.div>
    </DashboardLayout>
  );
};

export default ProjectsPage;
