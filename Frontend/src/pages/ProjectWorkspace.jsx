import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  Users,
  Calendar,
  MoreVertical,
  Plus,
  Search,
  Filter,
  Settings,
  MessageSquare,
  Activity,
  FolderOpen,
  CheckSquare,
} from 'lucide-react';
import { Avatar, Button, Badge } from '@/components/ui';
import { useProjectStore } from '@/store/projectStore';
import { useAuthStore } from '@/store/authStore';
import { getInitials, cn } from '@/lib/utils';
import { KanbanBoard } from '@/components/projects/KanbanBoard';
import { ProjectChat } from '@/components/projects/ProjectChat';
import { ActivityFeed } from '@/components/projects/ActivityFeed';

export const ProjectWorkspace = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { currentProject, fetchProject, setupProjectListeners } = useProjectStore();

  const [activeView, setActiveView] = useState('tasks');
  const [showProjectSettings, setShowProjectSettings] = useState(false);

  useEffect(() => {
    if (projectId) {
      fetchProject(projectId);
      setupProjectListeners(projectId);
    }
  }, [projectId]);

  const views = [
    { id: 'tasks', label: 'Tasks', icon: CheckSquare },
    { id: 'chat', label: 'Chat', icon: MessageSquare, badge: 3 },
    { id: 'activity', label: 'Activity', icon: Activity },
    { id: 'files', label: 'Files', icon: FolderOpen },
  ];

  if (!currentProject) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
            Loading project...
          </h2>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      {/* Project Header */}
      <div className="flex-shrink-0 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/app/projects')}
                className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back
              </Button>
              <div className="w-px h-6 bg-slate-200 dark:bg-slate-700"></div>
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                {currentProject.name}
              </h1>
              <Badge
                variant="secondary"
                className={cn(
                  'text-xs',
                  currentProject.status === 'IN_PROGRESS' && 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
                  currentProject.status === 'COMPLETED' && 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
                  currentProject.status === 'ON_HOLD' && 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
                )}
              >
                {currentProject.status?.replace('_', ' ')}
              </Badge>
            </div>

            <div className="flex items-center gap-3">
              {/* Project Members */}
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  {currentProject.members?.slice(0, 5).map((member, index) => (
                    <div
                      key={member._id || index}
                      className="relative"
                      title={member.name}
                    >
                      <Avatar
                        src={member.avatar}
                        fallback={getInitials(member.name)}
                        size="sm"
                        className="border-2 border-white dark:border-slate-800"
                      />
                      {member.isOnline && (
                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-white dark:border-slate-800"></span>
                      )}
                    </div>
                  ))}
                  {currentProject.members?.length > 5 && (
                    <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 border-2 border-white dark:border-slate-800 flex items-center justify-center">
                      <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
                        +{currentProject.members.length - 5}
                      </span>
                    </div>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                >
                  <Users className="w-4 h-4" />
                </Button>
              </div>

              <div className="w-px h-6 bg-slate-200 dark:bg-slate-700"></div>

              {/* Project Actions */}
              <Button variant="ghost" size="sm">
                <Search className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Filter className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowProjectSettings(true)}
              >
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* View Tabs */}
          <nav className="flex gap-1">
            {views.map((view) => {
              const Icon = view.icon;
              const isActive = activeView === view.id;

              return (
                <button
                  key={view.id}
                  onClick={() => setActiveView(view.id)}
                  className={cn(
                    'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors relative',
                    isActive
                      ? 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  <span>{view.label}</span>
                  {view.badge && (
                    <Badge
                      variant="secondary"
                      className="ml-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-xs h-5 px-1.5"
                    >
                      {view.badge}
                    </Badge>
                  )}
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600"
                    />
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          {activeView === 'tasks' && (
            <motion.div
              key="tasks"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="h-full"
            >
              <KanbanBoard projectId={projectId} />
            </motion.div>
          )}

          {activeView === 'chat' && (
            <motion.div
              key="chat"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="h-full"
            >
              <ProjectChat projectId={projectId} />
            </motion.div>
          )}

          {activeView === 'activity' && (
            <motion.div
              key="activity"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="h-full"
            >
              <ActivityFeed projectId={projectId} />
            </motion.div>
          )}

          {activeView === 'files' && (
            <motion.div
              key="files"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="h-full p-6"
            >
              <div className="text-center py-12">
                <FolderOpen className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                <p className="text-slate-600 dark:text-slate-400 text-sm">
                  Files coming soon...
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ProjectWorkspace;
