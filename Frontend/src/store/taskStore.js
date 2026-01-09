import { create } from 'zustand';
import { tasksAPI } from '@/services/api';
import { toast } from 'react-hot-toast';

export const useTaskStore = create((set, get) => ({
  tasks: [],
  currentTask: null,
  isLoading: false,
  error: null,

  // Fetch tasks with optional filters
  fetchTasks: async (filters = {}) => {
    try {
      set({ isLoading: true, error: null });
      const response = await tasksAPI.getTasks(filters);
      set({ tasks: response.data.tasks, isLoading: false });
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
      set({ currentTask: response.data.task, isLoading: false });
      return response.data.task;
    } catch (error) {
      console.error('Error fetching task:', error);
      set({ error: error.response?.data?.message || 'Failed to fetch task', isLoading: false });
      toast.error('Failed to fetch task');
      return null;
    }
  },

  // Create task
  createTask: async (taskData) => {
    try {
      set({ isLoading: true, error: null });
      const response = await tasksAPI.createTask(taskData);
      set((state) => ({
        tasks: [...state.tasks, response.data.task],
        isLoading: false,
      }));
      toast.success('Task created successfully');
      return response.data.task;
    } catch (error) {
      console.error('Error creating task:', error);
      set({ error: error.response?.data?.message || 'Failed to create task', isLoading: false });
      toast.error(error.response?.data?.message || 'Failed to create task');
      return null;
    }
  },

  // Update task
  updateTask: async (taskId, updates) => {
    try {
      set({ isLoading: true, error: null });
      const response = await tasksAPI.updateTask(taskId, updates);
      set((state) => ({
        tasks: state.tasks.map((task) =>
          task._id === taskId ? response.data.task : task
        ),
        currentTask:
          state.currentTask?._id === taskId
            ? response.data.task
            : state.currentTask,
        isLoading: false,
      }));
      toast.success('Task updated successfully');
      return response.data.task;
    } catch (error) {
      console.error('Error updating task:', error);
      set({ error: error.response?.data?.message || 'Failed to update task', isLoading: false });
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
}));
