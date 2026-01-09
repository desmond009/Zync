import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useTaskStore } from '@/store/taskStore';
import { useProjectStore } from '@/store/projectStore';
import { useTaskEvents, useProjectRoom, useChatEvents, usePresenceEvents } from '@/hooks/useSocketEvents';
import { ConnectionStatus } from '@/components/ui/ConnectionStatus';

/**
 * Real-time Project Workspace
 * 
 * Demonstrates production-ready real-time integration:
 * 1. REST API fetches initial state on mount
 * 2. Socket events provide incremental updates
 * 3. Automatic room join/leave on navigation
 * 4. Clean subscription cleanup on unmount
 */
export const ProjectWorkspaceRealtime = () => {
  const { projectId } = useParams();
  const { fetchTasks, tasks } = useTaskStore();
  const { fetchProject, currentProject } = useProjectStore();

  // ==================== STEP 1: INITIAL STATE HYDRATION (REST API) ====================
  
  useEffect(() => {
    if (!projectId) return;

    // Fetch initial data from REST API (source of truth)
    const loadInitialData = async () => {
      try {
        await Promise.all([
          fetchProject(projectId),
          fetchTasks({ projectId }),
        ]);
        console.log('[Workspace] Initial state loaded from REST API');
      } catch (error) {
        console.error('[Workspace] Failed to load initial state:', error);
      }
    };

    loadInitialData();
  }, [projectId, fetchProject, fetchTasks]);

  // ==================== STEP 2: REAL-TIME UPDATES (SOCKET EVENTS) ====================

  // Automatically join/leave project room
  useProjectRoom(projectId);

  // Subscribe to real-time task events
  useTaskEvents(projectId);

  // Subscribe to real-time chat events
  useChatEvents(projectId);

  // Subscribe to presence events (who's online)
  usePresenceEvents(projectId);

  // ==================== STEP 3: RECONNECTION HANDLING ====================

  // Rehydrate state on reconnect (handled by stores automatically)
  // useEffect(() => {
  //   const handleReconnect = () => {
  //     console.log('[Workspace] Reconnected, rehydrating state...');
  //     fetchTasks({ projectId });
  //   };
  //   
  //   socket.on('connect', handleReconnect);
  //   return () => socket.off('connect', handleReconnect);
  // }, [projectId]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Connection status indicator */}
      <ConnectionStatus />

      {/* Project content */}
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            {currentProject?.name || 'Loading...'}
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mt-2">
            {currentProject?.description}
          </p>
        </header>

        {/* Task board */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {['TODO', 'IN_PROGRESS', 'DONE'].map((status) => (
            <div key={status} className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                {status.replace('_', ' ')}
              </h2>
              
              <div className="space-y-3">
                {tasks
                  .filter((task) => task.status === status)
                  .map((task) => (
                    <div
                      key={task._id}
                      className={`p-3 bg-slate-50 dark:bg-slate-700 rounded-lg border ${
                        task.isOptimistic
                          ? 'border-blue-300 dark:border-blue-600 opacity-60'
                          : 'border-slate-200 dark:border-slate-600'
                      }`}
                    >
                      <h3 className="font-medium text-slate-900 dark:text-white">
                        {task.title}
                      </h3>
                      {task.isOptimistic && (
                        <span className="text-xs text-blue-600 dark:text-blue-400 mt-1 inline-block">
                          Saving...
                        </span>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
