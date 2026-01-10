import { create } from 'zustand';
import { tasksAPI } from '@/services/api';
import { toast } from 'react-hot-toast';

/**
 * Task Store - State Ownership Model
 * 
 * REST API → Initial state hydration & mutations
 * Socket events → Incremental updates (backend is source of truth)
 * Local UI state → Ephemeral only (loading, optimistic hints)
 * 
 * Rules:
 * - Socket events NEVER mutate state blindly
 * - All updates are validated and idempotent
 * - Backend response always finalizes state
 */
export const useTaskStore = create((set, get) => ({
  tasks: [],
  currentTask: null,
  isLoading: false,
  error: null,
  optimisticUpdates: new Map(), // Track optimistic updates for rollback

  // ==================== REST API ACTIONS (Initial State) ====================

  // Fetch tasks with optional filters
  fetchTasks: async (filters = {}) => {
    try {
      set({ isLoading: true, error: null });
      const response = await tasksAPI.getTasks(filters);
      set({ tasks: response.data.tasks || response.data.data || [], isLoading: false });
    } catch (error) {
      console.error('Error fetching tasks:', error);
      set({ error: error.response?.data?.message || 'Failed to fetch tasks', isLoading: false });
      toast.error('Failed to fetch tasks');
    }
  },

  // Fetch single task
  fetchTask: async (taskId) => {
    try {
      set({ isLoading: true, error: null });
      const response = await tasksAPI.getTask(taskId);
      set({ currentTask: response.data.task || response.data.data, isLoading: false });
      return response.data.task || response.data.data;
    } catch (error) {
      console.error('Error fetching task:', error);
      set({ error: error.response?.data?.message || 'Failed to fetch task', isLoading: false });
      toast.error('Failed to fetch task');
      return null;
    }
  },

  // Create task (with optimistic update)
  createTask: async (taskData) => {
    const optimisticId = `optimistic-${Date.now()}`;
    const optimisticTask = {
      _id: optimisticId,
      ...taskData,
      createdAt: new Date().toISOString(),
      isOptimistic: true,
    };

    try {
      // Optimistic update
      set((state) => ({
        tasks: [...state.tasks, optimisticTask],
        optimisticUpdates: new Map(state.optimisticUpdates).set(optimisticId, taskData),
      }));

      // Backend request
      const response = await tasksAPI.createTask(taskData);
      const realTask = response.data.task;

      // Replace optimistic with real data
      set((state) => ({
        tasks: state.tasks.map((task) =>
          task._id === optimisticId ? realTask : task
        ),
        optimisticUpdates: (() => {
          const updates = new Map(state.optimisticUpdates);
          updates.delete(optimisticId);
          return updates;
        })(),
      }));

      toast.success('Task created successfully');
      return realTask;
    } catch (error) {
      console.error('Error creating task:', error);
      
      // Rollback optimistic update
      set((state) => ({
        tasks: state.tasks.filter((task) => task._id !== optimisticId),
        optimisticUpdates: (() => {
          const updates = new Map(state.optimisticUpdates);
          updates.delete(optimisticId);
          return updates;
        })(),
        error: error.response?.data?.message || 'Failed to create task',
      }));

      toast.error(error.response?.data?.message || 'Failed to create task');
      return null;
    }
  },

  // Update task (with optimistic update)
  updateTask: async (taskId, updates) => {
    const previousTasks = get().tasks;
    const previousCurrentTask = get().currentTask;

    try {
      // Optimistic update
      set((state) => ({
        tasks: state.tasks.map((task) =>
          task._id === taskId ? { ...task, ...updates, isOptimistic: true } : task
        ),
        currentTask:
          state.currentTask?._id === taskId
            ? { ...state.currentTask, ...updates, isOptimistic: true }
            : state.currentTask,
        optimisticUpdates: new Map(state.optimisticUpdates).set(taskId, { previousTasks, previousCurrentTask }),
      }));

      // Backend request
      const response = await tasksAPI.updateTask(taskId, updates);
      const realTask = response.data.task;

      // Replace optimistic with real data
      set((state) => ({
        tasks: state.tasks.map((task) =>
          task._id === taskId ? realTask : task
        ),
        currentTask:
          state.currentTask?._id === taskId ? realTask : state.currentTask,
        optimisticUpdates: (() => {
          const updates = new Map(state.optimisticUpdates);
          updates.delete(taskId);
          return updates;
        })(),
      }));

      toast.success('Task updated successfully');
      return realTask;
    } catch (error) {
      console.error('Error updating task:', error);

      // Rollback optimistic update
      const rollbackData = get().optimisticUpdates.get(taskId);
      if (rollbackData) {
        set({
          tasks: rollbackData.previousTasks,
          currentTask: rollbackData.previousCurrentTask,
          optimisticUpdates: (() => {
            const updates = new Map(get().optimisticUpdates);
            updates.delete(taskId);
            return updates;
          })(),
          error: error.response?.data?.message || 'Failed to update task',
        });
      }

      toast.error(error.response?.data?.message || 'Failed to update task');
      return null;
    }
  },

  // Delete task
  deleteTask: async (taskId) => {
    try {
      set({ isLoading: true, error: null });
      await tasksAPI.deleteTask(taskId);
      set((state) => ({
        tasks: state.tasks.filter((task) => task._id !== taskId),
        currentTask: state.currentTask?._id === taskId ? null : state.currentTask,
        isLoading: false,
      }));
      toast.success('Task deleted successfully');
      return true;
    } catch (error) {
      console.error('Error deleting task:', error);
      set({ error: error.response?.data?.message || 'Failed to delete task', isLoading: false });
      toast.error(error.response?.data?.message || 'Failed to delete task');
      return false;
    }
  },

  // Assign task
  assignTask: async (taskId, userId) => {
    try {
      set({ isLoading: true, error: null });
      const response = await tasksAPI.assignTask(taskId, userId);
      set((state) => ({
        tasks: state.tasks.map((task) =>
          task._id === taskId ? response.data.task : task
        ),
        isLoading: false,
      }));
      toast.success('Task assigned successfully');
      return response.data.task;
    } catch (error) {
      console.error('Error assigning task:', error);
      set({ error: error.response?.data?.message || 'Failed to assign task', isLoading: false });
      toast.error(error.response?.data?.message || 'Failed to assign task');
      return null;
    }
  },

  // Clear current task
  clearCurrentTask: () => set({ currentTask: null }),

  // Clear errors
  clearError: () => set({ error: null }),

  // ==================== SOCKET EVENT HANDLERS (Real-time Updates) ====================

  /**
   * Add task from socket event (backend is source of truth)
   * - Validates task payload
   * - Checks for duplicates (idempotent)
   * - Never blindly mutates state
   */
  addTaskFromSocket: (task) => {
    if (!task || !task._id) {
      console.warn('[TaskStore] Invalid task payload from socket:', task);
      return;
    }

    set((state) => {
      // Check if task already exists (idempotency)
      const existingTask = state.tasks.find((t) => t._id === task._id);
      if (existingTask) {
        console.log('[TaskStore] Task already exists, skipping:', task._id);
        return state;
      }

      // Check if this was our optimistic update
      const optimisticTask = state.tasks.find((t) => t.isOptimistic);
      if (optimisticTask) {
        // Replace optimistic with real data
        return {
          tasks: state.tasks.map((t) => (t.isOptimistic ? task : t)),
        };
      }

      // Add new task
      return {
        tasks: [...state.tasks, task],
      };
    });
  },

  /**
   * Update task from socket event
   * - Validates task payload
   * - Idempotent (uses updatedAt timestamp)
   * - Reconciles with optimistic updates
   */
  updateTaskFromSocket: (task) => {
    if (!task || !task._id) {
      console.warn('[TaskStore] Invalid task payload from socket:', task);
      return;
    }

    set((state) => {
      const existingTask = state.tasks.find((t) => t._id === task._id);

      // If task doesn't exist, add it (could be from missed event)
      if (!existingTask) {
        console.log('[TaskStore] Task not found, adding from socket:', task._id);
        return {
          tasks: [...state.tasks, task],
        };
      }

      // If existing task is optimistic, let REST response handle it
      if (existingTask.isOptimistic) {
        console.log('[TaskStore] Skipping optimistic task, waiting for REST response:', task._id);
        return state;
      }

      // Check if socket event is newer (prevent out-of-order updates)
      if (existingTask.updatedAt && task.updatedAt) {
        const existingTimestamp = new Date(existingTask.updatedAt).getTime();
        const newTimestamp = new Date(task.updatedAt).getTime();
        
        if (newTimestamp < existingTimestamp) {
          console.log('[TaskStore] Ignoring older socket event:', task._id);
          return state;
        }
      }

      // Update task
      return {
        tasks: state.tasks.map((t) => (t._id === task._id ? task : t)),
        currentTask: state.currentTask?._id === task._id ? task : state.currentTask,
      };
    });
  },

  /**
   * Remove task from socket event
   */
  removeTaskFromSocket: (taskId) => {
    if (!taskId) {
      console.warn('[TaskStore] Invalid taskId from socket:', taskId);
      return;
    }

    set((state) => ({
      tasks: state.tasks.filter((t) => t._id !== taskId),
      currentTask: state.currentTask?._id === taskId ? null : state.currentTask,
    }));
  },
}));
