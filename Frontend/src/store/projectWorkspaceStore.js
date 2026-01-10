import { create } from 'zustand';
import { projectsAPI, tasksAPI, filesAPI, activitiesAPI } from '@/services/api';

/**
 * PROJECT WORKSPACE STORE
 * 
 * This is the single source of truth for the active project workspace.
 * 
 * PRINCIPLES:
 * - Backend is authoritative
 * - REST hydrates initial state
 * - Sockets deliver incremental updates
 * - All updates must be idempotent
 * - No component owns state locally
 */

const initialProjectState = {
  // Core project data
  project: null,
  members: [],
  
  // Tasks (normalized)
  tasks: {}, // { [taskId]: task }
  taskOrder: {
    TODO: [],
    IN_PROGRESS: [],
    DONE: [],
  },
  
  // Chat
  messages: [],
  messagesPage: 1,
  hasMoreMessages: true,
  typingUsers: new Set(),
  
  // Files
  files: [],
  uploadProgress: {}, // { [fileId]: { progress, status } }
  
  // Activity
  activities: [],
  activitiesPage: 1,
  hasMoreActivities: true,
  
  // Notifications (unread counts)
  unreadCounts: {
    tasks: 0,
    messages: 0,
    files: 0,
  },
  
  // Connection state
  isConnected: false,
  isReconnecting: false,
  lastSyncedAt: null,
  
  // Loading states
  isLoadingTasks: false,
  isLoadingMessages: false,
  isLoadingFiles: false,
  isLoadingActivities: false,
};

export const useProjectWorkspaceStore = create((set, get) => ({
  // Active project ID
  activeProjectId: null,
  
  // Project state
  ...initialProjectState,
  
  // ============================================
  // PROJECT LIFECYCLE
  // ============================================
  
  /**
   * Enter a project workspace
   * - Fetches all initial data via REST
   * - Sets active project
   * - Prepares for socket connection
   */
  enterProject: async (projectId) => {
    try {
      set({ activeProjectId: projectId, isLoadingTasks: true });
      
      // Fetch project data in parallel
      const [projectRes, tasksRes, membersRes, activitiesRes, filesRes] = await Promise.all([
        projectsAPI.getById(projectId),
        tasksAPI.getAll(projectId),
        projectsAPI.getMembers(projectId),
        activitiesAPI.getByProject(projectId, 1),
        filesAPI.getByProject(projectId),
      ]);
      
      // Normalize tasks by ID
      const tasks = {};
      const taskOrder = { TODO: [], IN_PROGRESS: [], DONE: [] };
      
      const tasksData = tasksRes.data?.data?.tasks || tasksRes.data?.data || [];
      tasksData.forEach((task) => {
        const id = task._id || task.id;
        tasks[id] = task;
        const status = task.status || 'TODO';
        if (taskOrder[status]) {
          taskOrder[status].push(id);
        }
      });
      
      set({
        project: projectRes.data?.data?.project || projectRes.data?.data,
        members: membersRes.data?.data?.members || membersRes.data?.data || [],
        tasks,
        taskOrder,
        activities: activitiesRes.data?.data?.activities || activitiesRes.data?.data || [],
        files: filesRes.data?.data?.files || filesRes.data?.data || [],
        isLoadingTasks: false,
        lastSyncedAt: Date.now(),
      });
      
      return true;
    } catch (error) {
      console.error('Failed to enter project:', error);
      set({ 
        activeProjectId: null, 
        isLoadingTasks: false,
        ...initialProjectState 
      });
      throw error;
    }
  },
  
  /**
   * Exit the current project workspace
   * - Clears all project state
   * - Signals socket to leave room
   */
  exitProject: () => {
    set({
      activeProjectId: null,
      ...initialProjectState,
    });
  },
  
  /**
   * Rehydrate project state after reconnection
   */
  rehydrateProject: async () => {
    const { activeProjectId } = get();
    if (!activeProjectId) return;
    
    try {
      set({ isReconnecting: true });
      await get().enterProject(activeProjectId);
      set({ isReconnecting: false });
    } catch (error) {
      console.error('Failed to rehydrate project:', error);
      set({ isReconnecting: false });
    }
  },
  
  // ============================================
  // TASKS MANAGEMENT
  // ============================================
  
  /**
   * Create a new task (optimistic)
   */
  createTask: async (taskData) => {
    const { activeProjectId } = get();
    if (!activeProjectId) return;
    
    try {
      const response = await tasksAPI.create({
        ...taskData,
        projectId: activeProjectId,
      });
      
      const newTask = response.data?.data?.task || response.data?.data;
      const taskId = newTask._id || newTask.id;
      const status = newTask.status || 'TODO';
      
      set((state) => ({
        tasks: {
          ...state.tasks,
          [taskId]: newTask,
        },
        taskOrder: {
          ...state.taskOrder,
          [status]: [...state.taskOrder[status], taskId],
        },
      }));
      
      return newTask;
    } catch (error) {
      console.error('Failed to create task:', error);
      throw error;
    }
  },
  
  /**
   * Update a task
   */
  updateTask: async (taskId, updates) => {
    try {
      const response = await tasksAPI.update(taskId, updates);
      const updatedTask = response.data?.data?.task || response.data?.data;
      
      set((state) => ({
        tasks: {
          ...state.tasks,
          [taskId]: { ...state.tasks[taskId], ...updatedTask },
        },
      }));
      
      return updatedTask;
    } catch (error) {
      console.error('Failed to update task:', error);
      throw error;
    }
  },
  
  /**
   * Move a task to a different status column
   */
  moveTask: async (taskId, newStatus, newIndex) => {
    const state = get();
    const task = state.tasks[taskId];
    if (!task) return;
    
    const oldStatus = task.status;
    
    // Optimistic update
    const oldOrder = { ...state.taskOrder };
    const newOrder = { ...state.taskOrder };
    
    // Remove from old column
    newOrder[oldStatus] = newOrder[oldStatus].filter((id) => id !== taskId);
    
    // Add to new column at specified index
    newOrder[newStatus] = [...newOrder[newStatus]];
    newOrder[newStatus].splice(newIndex, 0, taskId);
    
    set({
      tasks: {
        ...state.tasks,
        [taskId]: { ...task, status: newStatus },
      },
      taskOrder: newOrder,
    });
    
    try {
      // Persist to backend
      await tasksAPI.update(taskId, { status: newStatus });
    } catch (error) {
      // Rollback on failure
      console.error('Failed to move task:', error);
      set({
        tasks: {
          ...state.tasks,
          [taskId]: task,
        },
        taskOrder: oldOrder,
      });
      throw error;
    }
  },
  
  /**
   * Delete a task
   */
  deleteTask: async (taskId) => {
    const state = get();
    const task = state.tasks[taskId];
    if (!task) return;
    
    const status = task.status;
    
    try {
      await tasksAPI.delete(taskId);
      
      set((state) => {
        const { [taskId]: removed, ...remainingTasks } = state.tasks;
        return {
          tasks: remainingTasks,
          taskOrder: {
            ...state.taskOrder,
            [status]: state.taskOrder[status].filter((id) => id !== taskId),
          },
        };
      });
    } catch (error) {
      console.error('Failed to delete task:', error);
      throw error;
    }
  },
  
  // ============================================
  // CHAT MANAGEMENT
  // ============================================
  
  /**
   * Load chat messages
   */
  loadMessages: async (page = 1) => {
    const { activeProjectId } = get();
    if (!activeProjectId) return;
    
    try {
      set({ isLoadingMessages: true });
      const response = await projectsAPI.getMessages(activeProjectId, page);
      const messages = response.data?.data?.messages || response.data?.data || [];
      
      set((state) => ({
        messages: page === 1 ? messages : [...messages, ...state.messages],
        messagesPage: page,
        hasMoreMessages: messages.length > 0,
        isLoadingMessages: false,
      }));
    } catch (error) {
      console.error('Failed to load messages:', error);
      set({ isLoadingMessages: false });
    }
  },
  
  /**
   * Send a chat message
   */
  sendMessage: async (content) => {
    const { activeProjectId } = get();
    if (!activeProjectId) return;
    
    try {
      const response = await projectsAPI.sendMessage(activeProjectId, { content });
      const message = response.data?.data?.message || response.data?.data;
      
      // Socket will broadcast, but add locally for immediate feedback
      set((state) => ({
        messages: [...state.messages, message],
      }));
      
      return message;
    } catch (error) {
      console.error('Failed to send message:', error);
      throw error;
    }
  },
  
  /**
   * Update typing indicator
   */
  setTyping: (userId, isTyping) => {
    set((state) => {
      const typingUsers = new Set(state.typingUsers);
      if (isTyping) {
        typingUsers.add(userId);
      } else {
        typingUsers.delete(userId);
      }
      return { typingUsers };
    });
  },
  
  // ============================================
  // FILES MANAGEMENT
  // ============================================
  
  /**
   * Upload a file
   */
  uploadFile: async (file, onProgress) => {
    const { activeProjectId } = get();
    if (!activeProjectId) return;
    
    const tempId = `temp-${Date.now()}`;
    
    try {
      // Track upload progress
      set((state) => ({
        uploadProgress: {
          ...state.uploadProgress,
          [tempId]: { progress: 0, status: 'uploading' },
        },
      }));
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('projectId', activeProjectId);
      
      const response = await filesAPI.upload(formData, (progressEvent) => {
        const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        set((state) => ({
          uploadProgress: {
            ...state.uploadProgress,
            [tempId]: { progress, status: 'uploading' },
          },
        }));
        onProgress?.(progress);
      });
      
      const uploadedFile = response.data?.data?.file || response.data?.data;
      
      // Add to files list
      set((state) => {
        const { [tempId]: removed, ...remainingProgress } = state.uploadProgress;
        return {
          files: [...state.files, uploadedFile],
          uploadProgress: remainingProgress,
        };
      });
      
      return uploadedFile;
    } catch (error) {
      console.error('Failed to upload file:', error);
      set((state) => ({
        uploadProgress: {
          ...state.uploadProgress,
          [tempId]: { progress: 0, status: 'error' },
        },
      }));
      throw error;
    }
  },
  
  /**
   * Delete a file
   */
  deleteFile: async (fileId) => {
    try {
      await filesAPI.delete(fileId);
      
      set((state) => ({
        files: state.files.filter((f) => (f._id || f.id) !== fileId),
      }));
    } catch (error) {
      console.error('Failed to delete file:', error);
      throw error;
    }
  },
  
  // ============================================
  // ACTIVITY FEED
  // ============================================
  
  /**
   * Load activity feed
   */
  loadActivities: async (page = 1) => {
    const { activeProjectId } = get();
    if (!activeProjectId) return;
    
    try {
      set({ isLoadingActivities: true });
      const response = await activitiesAPI.getByProject(activeProjectId, page);
      const activities = response.data?.data?.activities || response.data?.data || [];
      
      set((state) => ({
        activities: page === 1 ? activities : [...state.activities, ...activities],
        activitiesPage: page,
        hasMoreActivities: activities.length > 0,
        isLoadingActivities: false,
      }));
    } catch (error) {
      console.error('Failed to load activities:', error);
      set({ isLoadingActivities: false });
    }
  },
  
  // ============================================
  // SOCKET EVENT HANDLERS (IDEMPOTENT)
  // ============================================
  
  /**
   * Handle task.created event
   */
  handleTaskCreated: (task) => {
    const { activeProjectId, tasks } = get();
    const taskId = task._id || task.id;
    
    // Ignore if not for active project or already exists
    if (task.projectId !== activeProjectId || tasks[taskId]) return;
    
    const status = task.status || 'TODO';
    
    set((state) => ({
      tasks: {
        ...state.tasks,
        [taskId]: task,
      },
      taskOrder: {
        ...state.taskOrder,
        [status]: [...state.taskOrder[status], taskId],
      },
    }));
  },
  
  /**
   * Handle task.updated event
   */
  handleTaskUpdated: (task) => {
    const { activeProjectId, tasks } = get();
    const taskId = task._id || task.id;
    
    if (task.projectId !== activeProjectId || !tasks[taskId]) return;
    
    const oldTask = tasks[taskId];
    const oldStatus = oldTask.status;
    const newStatus = task.status;
    
    // If status changed, update order
    if (oldStatus !== newStatus) {
      set((state) => ({
        tasks: {
          ...state.tasks,
          [taskId]: task,
        },
        taskOrder: {
          ...state.taskOrder,
          [oldStatus]: state.taskOrder[oldStatus].filter((id) => id !== taskId),
          [newStatus]: [...state.taskOrder[newStatus], taskId],
        },
      }));
    } else {
      set((state) => ({
        tasks: {
          ...state.tasks,
          [taskId]: task,
        },
      }));
    }
  },
  
  /**
   * Handle task.deleted event
   */
  handleTaskDeleted: (taskId) => {
    const { tasks } = get();
    const task = tasks[taskId];
    if (!task) return;
    
    const status = task.status;
    
    set((state) => {
      const { [taskId]: removed, ...remainingTasks } = state.tasks;
      return {
        tasks: remainingTasks,
        taskOrder: {
          ...state.taskOrder,
          [status]: state.taskOrder[status].filter((id) => id !== taskId),
        },
      };
    });
  },
  
  /**
   * Handle message.created event
   */
  handleMessageCreated: (message) => {
    const { activeProjectId, messages } = get();
    const messageId = message._id || message.id;
    
    if (message.projectId !== activeProjectId) return;
    
    // Avoid duplicates
    const exists = messages.some((m) => (m._id || m.id) === messageId);
    if (exists) return;
    
    set((state) => ({
      messages: [...state.messages, message],
    }));
  },
  
  /**
   * Handle file.uploaded event
   */
  handleFileUploaded: (file) => {
    const { activeProjectId, files } = get();
    const fileId = file._id || file.id;
    
    if (file.projectId !== activeProjectId) return;
    
    const exists = files.some((f) => (f._id || f.id) === fileId);
    if (exists) return;
    
    set((state) => ({
      files: [...state.files, file],
    }));
  },
  
  /**
   * Handle activity.created event
   */
  handleActivityCreated: (activity) => {
    const { activeProjectId, activities } = get();
    const activityId = activity._id || activity.id;
    
    if (activity.projectId !== activeProjectId) return;
    
    const exists = activities.some((a) => (a._id || a.id) === activityId);
    if (exists) return;
    
    set((state) => ({
      activities: [activity, ...state.activities],
    }));
  },
  
  // ============================================
  // CONNECTION STATUS
  // ============================================
  
  setConnected: (isConnected) => {
    set({ isConnected });
  },
  
  setReconnecting: (isReconnecting) => {
    set({ isReconnecting });
  },
}));
