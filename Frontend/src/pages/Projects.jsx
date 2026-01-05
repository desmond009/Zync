import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Card, Badge, Avatar, Button, Input, Modal } from '@/components/ui';
import { useProjectStore } from '@/store/projectStore';
import { formatDate, getInitials } from '@/lib/utils';

export const Projects = () => {
  const { projects, fetchProjects, createProject, isLoading } = useProjectStore();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    teamId: '',
  });

  useEffect(() => {
    fetchProjects();
  }, []);

  const filteredProjects = projects
    .filter((p) => {
      if (filter === 'active') return p.status === 'ACTIVE';
      if (filter === 'completed') return p.status === 'COMPLETED';
      if (filter === 'archived') return p.status === 'ARCHIVED';
      return true;
    })
    .filter((p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );

  const handleCreateProject = async () => {
    try {
      await createProject(newProject);
      setIsCreateModalOpen(false);
      setNewProject({ name: '', description: '', teamId: '' });
    } catch (error) {
      console.error('Failed to create project:', error);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      ACTIVE: 'success',
      COMPLETED: 'primary',
      ARCHIVED: 'default',
      ON_HOLD: 'warning',
    };
    return colors[status] || 'default';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold gradient-text mb-2">Projects</h1>
            <p className="text-slate-600 dark:text-slate-400">
              Manage and track all your projects
            </p>
          </div>
          <Button
            size="lg"
            onClick={() => setIsCreateModalOpen(true)}
            leftIcon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            }
          >
            New Project
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <Input
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1"
            leftIcon={
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            }
          />
          <div className="flex gap-2">
            {['all', 'active', 'completed', 'archived'].map((f) => (
              <Button
                key={f}
                variant={filter === f ? 'primary' : 'ghost'}
                size="md"
                onClick={() => setFilter(f)}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Projects grid */}
      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {[...Array(6)].map((_, idx) => (
              <div key={idx} className="skeleton h-64 rounded-2xl" />
            ))}
          </motion.div>
        ) : filteredProjects.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="glass rounded-2xl p-12 text-center"
          >
            <svg className="w-24 h-24 mx-auto mb-4 text-slate-300 dark:text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
              No projects found
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              {searchQuery ? 'Try a different search term' : 'Get started by creating your first project'}
            </p>
            <Button onClick={() => setIsCreateModalOpen(true)}>
              Create Project
            </Button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredProjects.map((project, idx) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                whileHover={{ y: -8 }}
              >
                <Link to={`/app/projects/${project.id}`}>
                  <Card gradient hoverable className="h-full">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2 line-clamp-1">
                          {project.name}
                        </h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                          {project.description || 'No description'}
                        </p>
                      </div>
                      <Badge variant={getStatusColor(project.status)}>
                        {project.status}
                      </Badge>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-slate-900 dark:text-white">
                          {project._count?.tasks || 0}
                        </p>
                        <p className="text-xs text-slate-600 dark:text-slate-400">Tasks</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-slate-900 dark:text-white">
                          {project._count?.members || 0}
                        </p>
                        <p className="text-xs text-slate-600 dark:text-slate-400">Members</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-emerald-600">
                          {project.progress || 0}%
                        </p>
                        <p className="text-xs text-slate-600 dark:text-slate-400">Done</p>
                      </div>
                    </div>

                    {/* Progress bar */}
                    <div className="mb-4">
                      <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${project.progress || 0}%` }}
                          transition={{ duration: 1, ease: 'easeOut' }}
                          className="h-full bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full"
                        />
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between">
                      <div className="flex -space-x-2">
                        {project.members?.slice(0, 3).map((member, idx) => (
                          <Avatar
                            key={idx}
                            src={member.user?.avatar}
                            fallback={getInitials(member.user?.name)}
                            size="sm"
                            className="ring-2 ring-white dark:ring-slate-800"
                          />
                        ))}
                        {project.members?.length > 3 && (
                          <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-semibold text-slate-600 dark:text-slate-300 ring-2 ring-white dark:ring-slate-800">
                            +{project.members.length - 3}
                          </div>
                        )}
                      </div>
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        {formatDate(project.updatedAt)}
                      </span>
                    </div>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Create Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Project"
      >
        <div className="space-y-4">
          <Input
            label="Project Name"
            placeholder="My Awesome Project"
            value={newProject.name}
            onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
          />
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Description
            </label>
            <textarea
              className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
              rows="4"
              placeholder="What's this project about?"
              value={newProject.description}
              onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
            />
          </div>
          <div className="flex gap-3 pt-4">
            <Button
              variant="ghost"
              className="flex-1"
              onClick={() => setIsCreateModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              className="flex-1"
              onClick={handleCreateProject}
              disabled={!newProject.name}
            >
              Create Project
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
