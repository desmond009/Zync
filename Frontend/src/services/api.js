import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for handling token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If token expired, try to refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const { data } = await axios.post(
          `${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/auth/refresh-token`,
          {},
          { withCredentials: true }
        );

        localStorage.setItem('accessToken', data.data.accessToken);
        originalRequest.headers.Authorization = `Bearer ${data.data.accessToken}`;
        
        return api(originalRequest);
      } catch (refreshError) {
        localStorage.removeItem('accessToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: (name, email, password) =>
    api.post('/auth/register', { name, email, password }),
  
  login: (email, password) =>
    api.post('/auth/login', { email, password }),
  
  logout: () =>
    api.post('/auth/logout'),
  
  refreshToken: () =>
    api.post('/auth/refresh-token'),
  
  verifyEmail: (token) =>
    api.post('/auth/verify-email', { token }),
  
  forgotPassword: (email) =>
    api.post('/auth/forgot-password', { email }),
  
  resetPassword: (token, password) =>
    api.post('/auth/reset-password', { token, password }),
};

// Users API
export const usersAPI = {
  getProfile: () =>
    api.get('/users/profile'),
  
  updateProfile: (data) =>
    api.patch('/users/profile', data),
  
  updateAvatar: (formData) =>
    api.post('/users/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  
  searchUsers: (query) =>
    api.get('/users/search', { params: { query } }),
};

// Teams API
export const teamsAPI = {
  getAll: () =>
    api.get('/teams'),
  
  getById: (id) =>
    api.get(`/teams/${id}`),
  
  create: (data) =>
    api.post('/teams', data),
  
  update: (id, data) =>
    api.patch(`/teams/${id}`, data),
  
  delete: (id) =>
    api.delete(`/teams/${id}`),
  
  getMembers: (id) =>
    api.get(`/teams/${id}/members`),
  
  inviteMember: (id, data) =>
    api.post(`/teams/${id}/invite`, data),
  
  removeMember: (teamId, memberId) =>
    api.delete(`/teams/${teamId}/members/${memberId}`),
  
  updateMemberRole: (teamId, memberId, role) =>
    api.patch(`/teams/${teamId}/members/${memberId}`, { role }),
};

// Projects API
export const projectsAPI = {
  getAll: (teamId) =>
    api.get('/projects', { params: { teamId } }),
  
  getById: (id) =>
    api.get(`/projects/${id}`),
  
  create: (data) =>
    api.post('/projects', data),
  
  update: (id, data) =>
    api.patch(`/projects/${id}`, data),
  
  delete: (id) =>
    api.delete(`/projects/${id}`),
  
  getMembers: (id) =>
    api.get(`/projects/${id}/members`),
  
  addMember: (id, userId) =>
    api.post(`/projects/${id}/members`, { userId }),
  
  removeMember: (projectId, memberId) =>
    api.delete(`/projects/${projectId}/members/${memberId}`),
};

// Tasks API
export const tasksAPI = {
  getAll: (projectId, filters) =>
    api.get('/tasks', { params: { projectId, ...filters } }),
  
  getById: (id) =>
    api.get(`/tasks/${id}`),
  
  create: (data) =>
    api.post('/tasks', data),
  
  update: (id, data) =>
    api.patch(`/tasks/${id}`, data),
  
  delete: (id) =>
    api.delete(`/tasks/${id}`),
  
  assign: (id, userId) =>
    api.post(`/tasks/${id}/assign`, { userId }),
  
  unassign: (id, userId) =>
    api.post(`/tasks/${id}/unassign`, { userId }),
  
  addComment: (id, content) =>
    api.post(`/tasks/${id}/comments`, { content }),
  
  updateComment: (taskId, commentId, content) =>
    api.patch(`/tasks/${taskId}/comments/${commentId}`, { content }),
  
  deleteComment: (taskId, commentId) =>
    api.delete(`/tasks/${taskId}/comments/${commentId}`),
  
  attachFile: (id, formData) =>
    api.post(`/tasks/${id}/attachments`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
};

// Notifications API
export const notificationsAPI = {
  getAll: (page = 1, limit = 20) =>
    api.get('/notifications', { params: { page, limit } }),
  
  markAsRead: (id) =>
    api.patch(`/notifications/${id}/read`),
  
  markAllAsRead: () =>
    api.patch('/notifications/read-all'),
  
  delete: (id) =>
    api.delete(`/notifications/${id}`),
};

export default api;
