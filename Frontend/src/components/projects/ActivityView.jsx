import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Avatar, Button } from '@/components/ui';
import { useProjectWorkspaceStore } from '@/store/projectWorkspaceStore';
import { getInitials, formatDate } from '@/lib/utils';

/**
 * ACTIVITY VIEW
 * 
 * Immutable activity feed:
 * - Backend-generated events only
 * - Real-time updates via socket
 * - Human-readable descriptions
 * - Chronological ordering
 */

export const ActivityView = () => {
  const {
    activeProjectId,
    activities,
    activitiesPage,
    hasMoreActivities,
    isLoadingActivities,
    loadActivities,
  } = useProjectWorkspaceStore();
  
  // ============================================
  // LOAD INITIAL ACTIVITIES
  // ============================================
  
  useEffect(() => {
    if (activeProjectId) {
      loadActivities(1);
    }
  }, [activeProjectId]);
  
  // ============================================
  // LOAD MORE
  // ============================================
  
  const handleLoadMore = () => {
    loadActivities(activitiesPage + 1);
  };
  
  // ============================================
  // ACTIVITY RENDERING
  // ============================================
  
  const getActivityIcon = (type) => {
    switch (type) {
      case 'TASK_CREATED':
        return (
          <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center text-blue-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </div>
        );
      case 'TASK_UPDATED':
      case 'TASK_MOVED':
        return (
          <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center text-amber-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </div>
        );
      case 'TASK_COMPLETED':
        return (
          <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center text-green-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        );
      case 'TASK_DELETED':
        return (
          <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center text-red-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </div>
        );
      case 'TASK_ASSIGNED':
        return (
          <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/20 flex items-center justify-center text-purple-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
        );
      case 'MESSAGE_SENT':
        return (
          <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
        );
      case 'FILE_UPLOADED':
        return (
          <div className="w-10 h-10 rounded-full bg-teal-100 dark:bg-teal-900/20 flex items-center justify-center text-teal-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
        );
      case 'MEMBER_JOINED':
        return (
          <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
        );
    }
  };
  
  const getActivityDescription = (activity) => {
    const userName = activity.user
      ? `${activity.user.firstName} ${activity.user.lastName}`
      : 'Someone';
    
    switch (activity.type) {
      case 'TASK_CREATED':
        return (
          <>
            <strong>{userName}</strong> created task{' '}
            <strong>{activity.metadata?.taskTitle}</strong>
          </>
        );
      case 'TASK_UPDATED':
        return (
          <>
            <strong>{userName}</strong> updated task{' '}
            <strong>{activity.metadata?.taskTitle}</strong>
          </>
        );
      case 'TASK_MOVED':
        return (
          <>
            <strong>{userName}</strong> moved task{' '}
            <strong>{activity.metadata?.taskTitle}</strong> to{' '}
            <strong>{activity.metadata?.newStatus}</strong>
          </>
        );
      case 'TASK_COMPLETED':
        return (
          <>
            <strong>{userName}</strong> completed task{' '}
            <strong>{activity.metadata?.taskTitle}</strong>
          </>
        );
      case 'TASK_DELETED':
        return (
          <>
            <strong>{userName}</strong> deleted task{' '}
            <strong>{activity.metadata?.taskTitle}</strong>
          </>
        );
      case 'TASK_ASSIGNED':
        return (
          <>
            <strong>{userName}</strong> assigned{' '}
            <strong>{activity.metadata?.assigneeName}</strong> to task{' '}
            <strong>{activity.metadata?.taskTitle}</strong>
          </>
        );
      case 'MESSAGE_SENT':
        return (
          <>
            <strong>{userName}</strong> sent a message
          </>
        );
      case 'FILE_UPLOADED':
        return (
          <>
            <strong>{userName}</strong> uploaded{' '}
            <strong>{activity.metadata?.fileName}</strong>
          </>
        );
      case 'MEMBER_JOINED':
        return (
          <>
            <strong>{userName}</strong> joined the project
          </>
        );
      default:
        return (
          <>
            <strong>{userName}</strong> performed an action
          </>
        );
    }
  };
  
  // ============================================
  // RENDER
  // ============================================
  
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-6 border-b border-slate-200 dark:border-slate-800">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Activity</h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
          Track all project events and changes
        </p>
      </div>
      
      {/* Activity feed */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-3xl mx-auto">
          {/* Timeline */}
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-slate-200 dark:bg-slate-800" />
            
            {/* Activities */}
            <div className="space-y-6">
              <AnimatePresence>
                {activities.map((activity, index) => (
                  <motion.div
                    key={activity._id || activity.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ delay: index * 0.05 }}
                    className="relative flex gap-4"
                  >
                    {/* Icon */}
                    <div className="relative z-10">
                      {getActivityIcon(activity.type)}
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 glass p-4 rounded-xl">
                      <p className="text-sm text-slate-900 dark:text-white mb-1">
                        {getActivityDescription(activity)}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {formatDate(activity.createdAt)}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
            
            {/* Load more */}
            {hasMoreActivities && !isLoadingActivities && (
              <div className="mt-6 text-center">
                <Button variant="ghost" onClick={handleLoadMore}>
                  Load more activities
                </Button>
              </div>
            )}
            
            {/* Loading */}
            {isLoadingActivities && (
              <div className="mt-6 text-center">
                <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
              </div>
            )}
          </div>
          
          {/* Empty state */}
          {activities.length === 0 && !isLoadingActivities && (
            <div className="text-center py-12">
              <svg
                className="w-20 h-20 mx-auto mb-4 text-slate-300 dark:text-slate-700"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                No activity yet
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                Project activity will appear here as actions are performed
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
