import axios from 'axios';

const api = axios.create({
  // IMPORTANT:
  // Backend mounts routes at `/api/${API_VERSION}` (default: v1).
  // Using a relative baseURL ensures requests go through the Vite dev proxy
  // and prevents accidental calls to stale host/ports (e.g. :5000).
  baseURL: '/api/v1',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// A separate client for token refresh to avoid interceptor recursion.
const refreshClient = axios.create({
  baseURL: '/api/v1',
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
        const { data } = await refreshClient.post('/auth/refresh', {});

        const accessToken = data?.data?.accessToken;
        if (accessToken) {
          localStorage.setItem('accessToken', accessToken);
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        }
        
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
  
  getMessages: (projectId, page = 1, limit = 50) =>
    api.get(`/projects/${projectId}/messages`, { params: { page, limit } }),
  
  sendMessage: (projectId, data) =>
    api.post(`/projects/${projectId}/messages`, data),
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

// Teams API
export const teamsAPI = {
  getUserTeams: () =>
    api.get('/teams'),
  
  getTeamById: (teamId) =>
    api.get(`/teams/${teamId}`),
  
  createTeam: (data) =>
    api.post('/teams', data),
  
  updateTeam: (teamId, data) =>
    api.patch(`/teams/${teamId}`, data),
  
  deleteTeam: (teamId) =>
    api.delete(`/teams/${teamId}`),
  
  getTeamStats: (teamId) =>
    api.get(`/teams/${teamId}/stats`),
  
  updateTeamSettings: (teamId, settings) =>
    api.patch(`/teams/${teamId}/settings`, settings),
  
  transferOwnership: (teamId, newOwnerId) =>
    api.post(`/teams/${teamId}/transfer-ownership`, { newOwnerId }),
  
  regenerateInviteCode: (teamId) =>
    api.post(`/teams/${teamId}/regenerate-invite`),
  
  // Member management
  inviteMember: (teamId, email, role) =>
    api.post(`/teams/${teamId}/invite`, { email, role }),
  
  inviteMemberByEmail: (teamId, email, role) =>
    api.post(`/teams/${teamId}/invite-email`, { email, role }),
  
  updateMemberRole: (teamId, memberId, role) =>
    api.patch(`/teams/${teamId}/members/${memberId}`, { role }),
  
  removeMember: (teamId, memberId) =>
    api.delete(`/teams/${teamId}/members/${memberId}`),
  
  leaveTeam: (teamId) =>
    api.post(`/teams/${teamId}/leave`),
  
  // Invite code
  joinTeam: (inviteCode) =>
    api.post('/teams/join', { inviteCode }),
  
  // Email invitations
  acceptInvitation: (token) =>
    api.post(`/teams/accept-invite/${token}`),
  
  getTeamInvitations: (teamId) =>
    api.get(`/teams/${teamId}/invitations`),
  
  cancelInvitation: (teamId, invitationId) =>
    api.delete(`/teams/${teamId}/invitations/${invitationId}`),
};

// Files API
export const filesAPI = {
  getByProject: (projectId) =>
    api.get('/files', { params: { projectId } }),
  
  upload: (formData, onProgress) =>
    api.post('/files', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: onProgress,
    }),
  
  delete: (fileId) =>
    api.delete(`/files/${fileId}`),
  
  download: (fileId) =>
    api.get(`/files/${fileId}/download`, { responseType: 'blob' }),
};

// Activities API
export const activitiesAPI = {
  getByProject: (projectId, page = 1, limit = 50) =>
    api.get('/activities', { params: { projectId, page, limit } }),
  
  getByTask: (taskId) =>
    api.get('/activities', { params: { taskId } }),
};

export default api;
