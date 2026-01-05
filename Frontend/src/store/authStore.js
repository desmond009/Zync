import { create } from 'zustand';
import { authAPI, usersAPI } from '@/services/api';

export const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  // Initialize auth state
  initialize: async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (token) {
        const { data } = await usersAPI.getProfile();
        set({ user: data.data, isAuthenticated: true, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      localStorage.removeItem('accessToken');
      set({ isLoading: false });
    }
  },

  // Register
  register: async (name, email, password) => {
    const { data } = await authAPI.register(name, email, password);
    return data;
  },

  // Login
  login: async (email, password) => {
    const { data } = await authAPI.login(email, password);
    localStorage.setItem('accessToken', data.data.accessToken);
    set({ user: data.data.user, isAuthenticated: true });
    return data;
  },

  // Logout
  logout: async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('accessToken');
      set({ user: null, isAuthenticated: false });
    }
  },

  // Update user profile
  updateProfile: async (updates) => {
    const { data } = await usersAPI.updateProfile(updates);
    set({ user: data.data });
    return data;
  },

  // Update avatar
  updateAvatar: async (file) => {
    const formData = new FormData();
    formData.append('avatar', file);
    const { data } = await usersAPI.updateAvatar(formData);
    set((state) => ({ user: { ...state.user, avatar: data.data.avatar } }));
    return data;
  },
}));
