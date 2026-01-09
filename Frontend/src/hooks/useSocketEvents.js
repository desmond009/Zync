import { useEffect, useCallback, useRef } from 'react';
import { useSocket } from '@/contexts/SocketContext';
import { useTaskStore } from '@/store/taskStore';
import { useProjectStore } from '@/store/projectStore';

/**
 * Hook for real-time task updates
 * 
 * Implements:
 * - Event validation before state mutation
 * - Idempotent updates (no duplicates)
 * - Project-scoped event filtering
 * - Automatic subscription cleanup
 */
export const useTaskEvents = (projectId) => {
  const { on, isConnected } = useSocket();
  const lastEventIdRef = useRef(new Set());
  const projectIdRef = useRef(projectId);

  // Update project ref when it changes
  useEffect(() => {
    projectIdRef.current = projectId;
  }, [projectId]);

  /**
   * Validate event payload
   */
  const validateTaskEvent = useCallback((task) => {
    if (!task || typeof task !== 'object') {
      console.warn('[TaskEvents] Invalid task payload:', task);
      return false;
    }

    if (!task._id) {
      console.warn('[TaskEvents] Task missing _id:', task);
      return false;
    }

    // Ensure event is for current project
    if (projectIdRef.current && task.projectId !== projectIdRef.current) {
      console.log('[TaskEvents] Ignoring task from different project:', task.projectId);
      return false;
    }

    return true;
  }, []);

  /**
   * Check if event was already processed (idempotency)
   */
  const isDuplicateEvent = useCallback((eventId) => {
    if (lastEventIdRef.current.has(eventId)) {
      console.log('[TaskEvents] Duplicate event ignored:', eventId);
      return true;
    }

    // Track event (with size limit to prevent memory leak)
    lastEventIdRef.current.add(eventId);
    if (lastEventIdRef.current.size > 100) {
      const firstItem = lastEventIdRef.current.values().next().value;
      lastEventIdRef.current.delete(firstItem);
    }

    return false;
  }, []);

  /**
   * Handle task:created event
   */
  useEffect(() => {
    if (!isConnected || !projectId) return;

    const handleTaskCreated = (task) => {
      console.log('[TaskEvents] task:created', task);

      if (!validateTaskEvent(task)) return;
      
      const eventId = `created-${task._id}`;
      if (isDuplicateEvent(eventId)) return;

      // Add task to store (backend is source of truth)
      useTaskStore.getState().addTaskFromSocket(task);
    };

    const unsubscribe = on('task:created', handleTaskCreated);
    return unsubscribe;
  }, [isConnected, projectId, on, validateTaskEvent, isDuplicateEvent]);

  /**
   * Handle task:updated event
   */
  useEffect(() => {
    if (!isConnected || !projectId) return;

    const handleTaskUpdated = (task) => {
      console.log('[TaskEvents] task:updated', task);

      if (!validateTaskEvent(task)) return;

      const eventId = `updated-${task._id}-${task.updatedAt}`;
      if (isDuplicateEvent(eventId)) return;

      // Update task in store
      useTaskStore.getState().updateTaskFromSocket(task);
    };

    const unsubscribe = on('task:updated', handleTaskUpdated);
    return unsubscribe;
  }, [isConnected, projectId, on, validateTaskEvent, isDuplicateEvent]);

  /**
   * Handle task:deleted event
   */
  useEffect(() => {
    if (!isConnected || !projectId) return;

    const handleTaskDeleted = (data) => {
      console.log('[TaskEvents] task:deleted', data);

      if (!data?.taskId) {
        console.warn('[TaskEvents] Invalid delete payload:', data);
        return;
      }

      const eventId = `deleted-${data.taskId}`;
      if (isDuplicateEvent(eventId)) return;

      // Remove task from store
      useTaskStore.getState().removeTaskFromSocket(data.taskId);
    };

    const unsubscribe = on('task:deleted', handleTaskDeleted);
    return unsubscribe;
  }, [isConnected, projectId, on, isDuplicateEvent]);

  /**
   * Handle task:assigned event
   */
  useEffect(() => {
    if (!isConnected || !projectId) return;

    const handleTaskAssigned = (task) => {
      console.log('[TaskEvents] task:assigned', task);

      if (!validateTaskEvent(task)) return;

      const eventId = `assigned-${task._id}-${task.assignedToId}`;
      if (isDuplicateEvent(eventId)) return;

      // Update task in store
      useTaskStore.getState().updateTaskFromSocket(task);
    };

    const unsubscribe = on('task:assigned', handleTaskAssigned);
    return unsubscribe;
  }, [isConnected, projectId, on, validateTaskEvent, isDuplicateEvent]);
};

/**
 * Hook for real-time chat updates
 */
export const useChatEvents = (projectId) => {
  const { on, isConnected } = useSocket();
  const projectIdRef = useRef(projectId);
  const lastMessageIdRef = useRef(new Set());

  useEffect(() => {
    projectIdRef.current = projectId;
  }, [projectId]);

  const isDuplicateMessage = useCallback((messageId) => {
    if (lastMessageIdRef.current.has(messageId)) {
      return true;
    }
    lastMessageIdRef.current.add(messageId);
    if (lastMessageIdRef.current.size > 100) {
      const firstItem = lastMessageIdRef.current.values().next().value;
      lastMessageIdRef.current.delete(firstItem);
    }
    return false;
  }, []);

  /**
   * Handle chat:message event
   */
  useEffect(() => {
    if (!isConnected || !projectId) return;

    const handleMessage = (message) => {
      console.log('[ChatEvents] chat:message', message);

      // Validate message
      if (!message || !message._id || !message.projectId) {
        console.warn('[ChatEvents] Invalid message payload:', message);
        return;
      }

      // Filter by project
      if (message.projectId !== projectIdRef.current) {
        return;
      }

      // Check for duplicates
      if (isDuplicateMessage(message._id)) {
        return;
      }

      // Add message to store (if you have a message store)
      // useMessageStore.getState().addMessage(message);
      console.log('[ChatEvents] Message received:', message);
    };

    const unsubscribe = on('chat:message', handleMessage);
    return unsubscribe;
  }, [isConnected, projectId, on, isDuplicateMessage]);

  /**
   * Handle chat:typing event
   */
  useEffect(() => {
    if (!isConnected || !projectId) return;

    const handleTyping = (data) => {
      console.log('[ChatEvents] chat:typing', data);
      // Update typing indicators in UI
      // This is ephemeral state - no persistence needed
    };

    const unsubscribe = on('chat:typing', handleTyping);
    return unsubscribe;
  }, [isConnected, projectId, on]);
};

/**
 * Hook for real-time presence updates
 */
export const usePresenceEvents = (projectId) => {
  const { on, isConnected } = useSocket();

  useEffect(() => {
    if (!isConnected || !projectId) return;

    const handleUserJoined = (data) => {
      console.log('[PresenceEvents] user:joined', data);
      // Update online users list
    };

    const handleUserLeft = (data) => {
      console.log('[PresenceEvents] user:left', data);
      // Update online users list
    };

    const unsubscribeJoined = on('user:joined', handleUserJoined);
    const unsubscribeLeft = on('user:left', handleUserLeft);

    return () => {
      unsubscribeJoined();
      unsubscribeLeft();
    };
  }, [isConnected, projectId, on]);
};

/**
 * Hook for real-time notifications
 */
export const useNotificationEvents = () => {
  const { on, isConnected } = useSocket();

  useEffect(() => {
    if (!isConnected) return;

    const handleNotification = (notification) => {
      console.log('[NotificationEvents] notification:new', notification);

      // Validate notification
      if (!notification || !notification._id) {
        console.warn('[NotificationEvents] Invalid notification:', notification);
        return;
      }

      // Add notification to store or show toast
      // useNotificationStore.getState().addNotification(notification);
    };

    const unsubscribe = on('notification:new', handleNotification);
    return unsubscribe;
  }, [isConnected, on]);
};

/**
 * Hook to join/leave project rooms automatically
 */
export const useProjectRoom = (projectId) => {
  const { joinProject, leaveProject, isConnected } = useSocket();

  useEffect(() => {
    if (!isConnected || !projectId) return;

    console.log('[ProjectRoom] Joining project:', projectId);
    joinProject(projectId);

    return () => {
      console.log('[ProjectRoom] Leaving project:', projectId);
      leaveProject(projectId);
    };
  }, [projectId, isConnected, joinProject, leaveProject]);
};
