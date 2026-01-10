import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Card, Badge, Avatar, Button, Skeleton } from '@/components/ui';
import { useProjectStore } from '@/store/projectStore';
import { useAuthStore } from '@/store/authStore';
import { formatDate, getInitials, getPriorityColor, getStatusColor } from '@/lib/utils';
import confetti from 'canvas-confetti';

export const Dashboard = () => {
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
    if (Array.isArray(projects) && projects.length > 0) {
      // Calculate stats from projects
      const activeTasks = projects.reduce((sum, p) => sum + (p.tasks?.filter(t => t.status !== 'DONE').length || 0), 0);
      const completedToday = projects.reduce((sum, p) => {
        const today = new Date().toDateString();
        return sum + (p.tasks?.filter(t => {
          return t.status === 'DONE' && new Date(t.updatedAt).toDateString() === today;
        }).length || 0);
      }, 0);
      
      setStats({
        totalProjects: projects.length,
        activeTasks,
        completedToday,
        teamMembers: 12, // This would come from your team data
      });

      // Celebrate if tasks completed today
      if (completedToday > 0) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      }
    }
  }, [projects]);

  const recentProjects = Array.isArray(projects) ? projects.slice(0, 4) : [];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 30,
      },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Welcome header */}
      <motion.div variants={itemVariants} className="glass rounded-2xl p-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold gradient-text mb-2">
              Welcome back, {user?.name?.split(' ')[0]}! 👋
            </h1>
            <p className="text-slate-600 dark:text-slate-400 text-lg">
              Here's what's happening with your projects today
            </p>
          </div>
          <Button size="lg" leftIcon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          }>
            New Project
          </Button>
        </div>
      </motion.div>

      {/* Stats grid */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'Total Projects',
            value: stats.totalProjects,
            icon: '📁',
            color: 'from-indigo-500 to-purple-500',
            change: '+12%',
          },
          {
            label: 'Active Tasks',
            value: stats.activeTasks,
            icon: '✓',
            color: 'from-cyan-500 to-blue-500',
            change: '+8%',
          },
          {
            label: 'Completed Today',
            value: stats.completedToday,
            icon: '🎉',
            color: 'from-emerald-500 to-teal-500',
            change: '+23%',
          },
          {
            label: 'Team Members',
            value: stats.teamMembers,
            icon: '👥',
            color: 'from-amber-500 to-orange-500',
            change: '+3',
          },
        ].map((stat, idx) => (
          <motion.div
            key={idx}
            whileHover={{ y: -4, scale: 1.02 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            <Card className="relative overflow-hidden">
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-5`}></div>
              <div className="relative">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl">{stat.icon}</span>
                  <Badge variant="success" className="text-xs">
                    {stat.change}
                  </Badge>
                </div>
                <p className="text-3xl font-bold text-slate-900 dark:text-white mb-1">
                  {stat.value}
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {stat.label}
                </p>
              </div>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Recent projects */}
      <motion.div variants={itemVariants}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Recent Projects
          </h2>
          <Link to="/app/projects">
            <Button variant="ghost" size="sm" rightIcon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            }>
              View All
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {isLoading ? (
            <>
              {[...Array(4)].map((_, idx) => (
                <Skeleton key={idx} className="h-48" />
              ))}
            </>
          ) : (
            recentProjects.map((project, idx) => (
              <motion.div
                key={project.id}
                variants={itemVariants}
                whileHover={{ y: -4 }}
              >
                <Link to={`/app/projects/${project.id}`}>
                  <Card gradient hoverable>
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-1">
                          {project.name}
                        </h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                          {project.description}
                        </p>
                      </div>
                      <Badge variant={project.status === 'ACTIVE' ? 'success' : 'default'}>
                        {project.status}
                      </Badge>
                    </div>

                    {/* Progress bar */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-slate-600 dark:text-slate-400">Progress</span>
                        <span className="font-semibold text-slate-900 dark:text-white">
                          {project.progress || 0}%
                        </span>
                      </div>
                      <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${project.progress || 0}%` }}
                          transition={{ duration: 1, ease: 'easeOut' }}
                          className="h-full bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full"
                        />
                      </div>
                    </div>

                    {/* Team avatars */}
                    <div className="flex items-center justify-between">
                      <div className="flex -space-x-2">
                        {project.members?.slice(0, 4).map((member, idx) => (
                          <Avatar
                            key={idx}
                            src={member.user?.avatar}
                            fallback={getInitials(member.user?.name)}
                            size="sm"
                            className="ring-2 ring-white dark:ring-slate-800"
                          />
                        ))}
                        {project.members?.length > 4 && (
                          <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-semibold text-slate-600 dark:text-slate-300 ring-2 ring-white dark:ring-slate-800">
                            +{project.members.length - 4}
                          </div>
                        )}
                      </div>
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        Updated {formatDate(project.updatedAt)}
                      </span>
                    </div>
                  </Card>
                </Link>
              </motion.div>
            ))
          )}
        </div>
      </motion.div>

      {/* Quick actions */}
      <motion.div variants={itemVariants}>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              title: 'Create Task',
              description: 'Add a new task to your project',
              icon: '✨',
              color: 'from-indigo-500 to-purple-500',
            },
            {
              title: 'Invite Team',
              description: 'Add members to your workspace',
              icon: '👋',
              color: 'from-cyan-500 to-blue-500',
            },
            {
              title: 'View Reports',
              description: 'Check your team\'s progress',
              icon: '📊',
              color: 'from-emerald-500 to-teal-500',
            },
          ].map((action, idx) => (
            <motion.div
              key={idx}
              whileHover={{ y: -4, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card hoverable className="cursor-pointer">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center text-2xl mb-3`}>
                  {action.icon}
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
                  {action.title}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  {action.description}
                </p>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};
