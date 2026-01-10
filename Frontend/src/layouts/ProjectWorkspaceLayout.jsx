import { useEffect, useState } from 'react';
import { useParams, useNavigate, Outlet, NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Avatar, Badge } from '@/components/ui';
import { useProjectWorkspaceStore } from '@/store/projectWorkspaceStore';
import { useSocket } from '@/contexts/SocketContext';
import { getInitials } from '@/lib/utils';

/**
 * PROJECT WORKSPACE LAYOUT
 * 
 * This is the persistent shell around all project views.
 * It handles:
 * - Project lifecycle (enter/exit)
 * - Socket room management
 * - Persistent UI (top bar, sidebar)
 * - Connection status
 */

export const ProjectWorkspaceLayout = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { socket, on, emit, isConnected: socketConnected } = useSocket();
  
  const {
    project,
    members,
    isConnected,
    isReconnecting,
    activeProjectId,
    enterProject,
    exitProject,
    setConnected,
  } = useProjectWorkspaceStore();
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // ============================================
  // PROJECT ENTRY/EXIT FLOW
  // ============================================
  
  useEffect(() => {
    if (!projectId) return;
    
    let isActive = true;
    
    const initializeProject = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Enter project (REST hydration)
        await enterProject(projectId);
        
        if (!isActive) return;
        
        // Join socket room
        if (socket) {
          emit('project:join', { projectId });
          setConnected(true);
        }
        
        setIsLoading(false);
      } catch (err) {
        console.error('Failed to initialize project:', err);
        if (isActive) {
          setError(err.message || 'Failed to load project');
          setIsLoading(false);
        }
      }
    };
    
    initializeProject();
    
    // Cleanup: leave project
    return () => {
      isActive = false;
      if (socket && projectId) {
        emit('project:leave', { projectId });
      }
      exitProject();
    };
  }, [projectId, socket, emit, enterProject, exitProject]);
  
  // ============================================
  // SOCKET EVENT HANDLERS
  // ============================================
  
  useEffect(() => {
    if (!socket || !projectId || projectId !== activeProjectId) return;
    
    const handlers = {
      'task:created': useProjectWorkspaceStore.getState().handleTaskCreated,
      'task:updated': useProjectWorkspaceStore.getState().handleTaskUpdated,
      'task:deleted': useProjectWorkspaceStore.getState().handleTaskDeleted,
      'message:created': useProjectWorkspaceStore.getState().handleMessageCreated,
      'file:uploaded': useProjectWorkspaceStore.getState().handleFileUploaded,
      'activity:created': useProjectWorkspaceStore.getState().handleActivityCreated,
    };
    
    // Store unsubscribe functions
    const unsubscribeFns = [];
    
    // Attach listeners
    Object.entries(handlers).forEach(([event, handler]) => {
      const unsubscribe = on(event, handler);
      unsubscribeFns.push(unsubscribe);
    });
    
    // Socket connection status
    const unsubscribeConnect = on('connect', () => {
      setConnected(true);
      // Rejoin project room on reconnect
      emit('project:join', { projectId });
    });
    unsubscribeFns.push(unsubscribeConnect);
    
    const unsubscribeDisconnect = on('disconnect', () => {
      setConnected(false);
    });
    unsubscribeFns.push(unsubscribeDisconnect);
    
    // Cleanup
    return () => {
      unsubscribeFns.forEach((unsubscribe) => {
        if (typeof unsubscribe === 'function') {
          unsubscribe();
        }
      });
    };
  }, [socket, projectId, activeProjectId, on, emit]);
  
  // ============================================
  // NAVIGATION
  // ============================================
  
  const navItems = [
    {
      to: `/app/projects/${projectId}/tasks`,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      ),
      label: 'Tasks',
    },
    {
      to: `/app/projects/${projectId}/chat`,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      ),
      label: 'Chat',
    },
    {
      to: `/app/projects/${projectId}/files`,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
        </svg>
      ),
      label: 'Files',
    },
    {
      to: `/app/projects/${projectId}/activity`,
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
      label: 'Activity',
    },
  ];
  
  // ============================================
  // LOADING & ERROR STATES
  // ============================================
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-400">Loading project...</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center max-w-md">
          <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
            Failed to load project
          </h3>
          <p className="text-slate-600 dark:text-slate-400 mb-6">{error}</p>
          <button
            onClick={() => navigate('/app/projects')}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Back to Projects
          </button>
        </div>
      </div>
    );
  }
  
  if (!project) {
    return null;
  }
  
  // ============================================
  // MAIN LAYOUT
  // ============================================
  
  return (
    <div className="flex flex-col h-screen bg-slate-50 dark:bg-slate-900">
      {/* ========== TOP BAR (PERSISTENT) ========== */}
      <header className="glass border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex items-center justify-between">
        {/* Left: Back button + Project name */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/app/projects')}
            className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            title="Back to projects"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              {project.name}
            </h1>
            {project.description && (
              <p className="text-sm text-slate-600 dark:text-slate-400 truncate max-w-md">
                {project.description}
              </p>
            )}
          </div>
        </div>
        
        {/* Right: Members + Connection status */}
        <div className="flex items-center gap-4">
          {/* Member avatars */}
          <div className="flex -space-x-2">
            {members.slice(0, 5).map((member) => (
              <Avatar
                key={member._id || member.id}
                src={member.userId?.avatar}
                fallback={getInitials(`${member.userId?.firstName} ${member.userId?.lastName}`)}
                size="sm"
                className="ring-2 ring-white dark:ring-slate-900"
                title={`${member.userId?.firstName} ${member.userId?.lastName}`}
              />
            ))}
            {members.length > 5 && (
              <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-semibold text-slate-600 dark:text-slate-300 ring-2 ring-white dark:ring-slate-900">
                +{members.length - 5}
              </div>
            )}
          </div>
          
          {/* Connection indicator */}
          <AnimatePresence mode="wait">
            {isReconnecting ? (
              <motion.div
                key="reconnecting"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
              >
                <Badge variant="warning" className="flex items-center gap-1.5">
                  <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
                  Reconnecting
                </Badge>
              </motion.div>
            ) : isConnected ? (
              <motion.div
                key="connected"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
              >
                <Badge variant="success" className="flex items-center gap-1.5">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                  Live
                </Badge>
              </motion.div>
            ) : (
              <motion.div
                key="disconnected"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
              >
                <Badge variant="error" className="flex items-center gap-1.5">
                  <div className="w-2 h-2 bg-red-500 rounded-full" />
                  Offline
                </Badge>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>
      
      <div className="flex flex-1 overflow-hidden">
        {/* ========== SIDEBAR NAVIGATION ========== */}
        <nav className="w-64 glass border-r border-slate-200 dark:border-slate-800 p-4">
          <div className="space-y-2">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/50'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`
                }
              >
                {item.icon}
                <span className="font-medium">{item.label}</span>
              </NavLink>
            ))}
          </div>
        </nav>
        
        {/* ========== MAIN CONTENT AREA ========== */}
        <main className="flex-1 overflow-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
