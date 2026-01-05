import { create } from 'zustand';
import { projectsAPI, tasksAPI } from '@/services/api';

export const useProjectStore = create((set, get) => ({
  projects: [],
  currentProject: null,
  isLoading: false,

  // Fetch all projects
  fetchProjects: async (teamId) => {
    set({ isLoading: true });
    try {
      const { data } = await projectsAPI.getAll(teamId);
      set({ projects: data.data, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  // Fetch project by ID
  fetchProject: async (id) => {
    set({ isLoading: true });
    try {
      const { data } = await projectsAPI.getById(id);
      set({ currentProject: data.data, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  // Create project
  createProject: async (projectData) => {
    const { data } = await projectsAPI.create(projectData);
    set((state) => ({ projects: [...state.projects, data.data] }));
    return data.data;
  },

  // Update project
  updateProject: async (id, updates) => {
    const { data } = await projectsAPI.update(id, updates);
    set((state) => ({
      projects: state.projects.map((p) => (p.id === id ? data.data : p)),
      currentProject: state.currentProject?.id === id ? data.data : state.currentProject,
    }));
    return data.data;
  },

  // Delete project
  deleteProject: async (id) => {
    await projectsAPI.delete(id);
    set((state) => ({
      projects: state.projects.filter((p) => p.id !== id),
      currentProject: state.currentProject?.id === id ? null : state.currentProject,
    }));
  },
}));

export const useTaskStore = create((set, get) => ({
  tasks: [],
  currentTask: null,
  isLoading: false,
  filters: {
    status: null,
    priority: null,
    assignee: null,
  },

  // Fetch all tasks
  fetchTasks: async (projectId, filters) => {
    set({ isLoading: true });
    try {
      const { data } = await tasksAPI.getAll(projectId, filters);
      set({ tasks: data.data, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  // Fetch task by ID
  fetchTask: async (id) => {
    set({ isLoading: true });
    try {
      const { data } = await tasksAPI.getById(id);
      set({ currentTask: data.data, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  // Create task
  createTask: async (taskData) => {
    const { data } = await tasksAPI.create(taskData);
    set((state) => ({ tasks: [...state.tasks, data.data] }));
    return data.data;
  },

  // Update task
  updateTask: async (id, updates) => {
    const { data } = await tasksAPI.update(id, updates);
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === id ? data.data : t)),
      currentTask: state.currentTask?.id === id ? data.data : state.currentTask,
    }));
    return data.data;
  },

  // Delete task
  deleteTask: async (id) => {
    await tasksAPI.delete(id);
    set((state) => ({
      tasks: state.tasks.filter((t) => t.id !== id),
      currentTask: state.currentTask?.id === id ? null : state.currentTask,
    }));
  },

  // Add comment
  addComment: async (taskId, content) => {
    const { data } = await tasksAPI.addComment(taskId, content);
    set((state) => ({
      currentTask: state.currentTask?.id === taskId
        ? { ...state.currentTask, comments: [...state.currentTask.comments, data.data] }
        : state.currentTask,
    }));
    return data.data;
  },

  // Update filters
  setFilters: (filters) => {
    set((state) => ({ filters: { ...state.filters, ...filters } }));
  },

  // Real-time task update
  handleTaskUpdate: (task) => {
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === task.id ? task : t)),
      currentTask: state.currentTask?.id === task.id ? task : state.currentTask,
    }));
  },

  // Real-time task creation
  handleTaskCreate: (task) => {
    set((state) => ({ tasks: [...state.tasks, task] }));
  },

  // Real-time task deletion
  handleTaskDelete: (taskId) => {
    set((state) => ({
      tasks: state.tasks.filter((t) => t.id !== taskId),
      currentTask: state.currentTask?.id === taskId ? null : state.currentTask,
    }));
  },
}));
