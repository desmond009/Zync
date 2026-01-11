const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

interface RequestConfig extends RequestInit {
  params?: Record<string, string>;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private getToken(): string | null {
    return localStorage.getItem('auth_token');
  }

  private async request<T>(endpoint: string, config: RequestConfig = {}): Promise<T> {
    const { params, ...fetchConfig } = config;
    
    let url = `${this.baseUrl}${endpoint}`;
    if (params) {
      const searchParams = new URLSearchParams(params);
      url += `?${searchParams.toString()}`;
    }

    const token = this.getToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...config.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      ...fetchConfig,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    const jsonResponse = await response.json();
    
    // Extract data from the wrapper if it exists
    // The backend wraps responses as { statusCode, data, message, success }
    if (jsonResponse && typeof jsonResponse === 'object' && 'data' in jsonResponse && 'statusCode' in jsonResponse) {
      // The data field contains the actual response
      const extractedData = jsonResponse.data;
      console.log('Extracted data from response:', extractedData);
      return extractedData as T;
    }
    
    return jsonResponse as T;
  }

  async get<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET', params });
  }

  async post<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  async upload<T>(endpoint: string, file: File, additionalData?: Record<string, string>): Promise<T> {
    const formData = new FormData();
    formData.append('file', file);
    
    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, value);
      });
    }

    const token = this.getToken();
    const headers: HeadersInit = {};
    
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Upload failed' }));
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    return response.json();
  }
}

export const api = new ApiClient(API_BASE_URL);

// Auth API
export const authApi = {
  login: (email: string, password: string) => 
    api.post<{ user: User; accessToken: string; refreshToken: string }>('/auth/login', { email, password }),
  
  signup: (data: { email: string; password: string; name: string }) => 
    api.post<{ user: User; accessToken: string; refreshToken: string }>('/auth/register', data),
  
  logout: () => api.post('/auth/logout'),
  
  me: () => api.get<User>('/auth/me'),
};

// Teams API
export const teamsApi = {
  list: async () => {
    const response = await api.get<{ teams: Team[] }>('/teams');
    // Handle both direct array and wrapped response
    if (Array.isArray(response)) {
      return response;
    }
    if (response && typeof response === 'object' && 'teams' in response) {
      return (response as any).teams;
    }
    return response as unknown as Team[];
  },
  
  create: (data: { name: string; description?: string }) => 
    api.post<{ team: Team }>('/teams', data).then((res: any) => res.team || res),
  
  get: (teamId: string) => 
    api.get<{ team: Team }>(`/teams/${teamId}`).then((res: any) => res.team || res),
  
  update: (teamId: string, data: Partial<Team>) => 
    api.patch<{ team: Team }>(`/teams/${teamId}`, data).then((res: any) => res.team || res),
  
  delete: (teamId: string) => 
    api.delete(`/teams/${teamId}`),
  
  join: (inviteCode: string) => 
    api.post('/teams/join', { inviteCode }),
  
  invite: (teamId: string, email: string, role: string) => 
    api.post(`/teams/${teamId}/invite`, { email, role }),
  
  inviteByEmail: (teamId: string, email: string, role: string) => 
    api.post(`/teams/${teamId}/invite-email`, { email, role }),
};

// Projects API
export const projectsApi = {
  list: () => 
    api.get<Project[]>('/projects'),
  
  create: (data: { name: string; description?: string; teamId: string }) => 
    api.post<Project>('/projects', data),
  
  get: (projectId: string) => 
    api.get<ProjectDetails>(`/projects/${projectId}`),
  
  update: (projectId: string, data: Partial<Project>) => 
    api.patch<Project>(`/projects/${projectId}`, data),
  
  delete: (projectId: string) => 
    api.delete(`/projects/${projectId}`),
  
  getMembers: (projectId: string) => 
    api.get<TeamMember[]>(`/projects/${projectId}/members`),
  
  addMember: (projectId: string, userId: string, role: string) => 
    api.post(`/projects/${projectId}/members`, { userId, role }),
  
  updateMemberRole: (projectId: string, memberId: string, role: string) => 
    api.patch(`/projects/${projectId}/members/${memberId}`, { role }),
  
  removeMember: (projectId: string, memberId: string) => 
    api.delete(`/projects/${projectId}/members/${memberId}`),
};

// Tasks API
export const tasksApi = {
  list: (projectId: string) => 
    api.get<Task[]>('/tasks', { projectId }),
  
  create: (data: { projectId: string; title: string; description?: string; priority?: string; dueDate?: string }) => 
    api.post<Task>('/tasks', data),
  
  get: (taskId: string) => 
    api.get<Task>(`/tasks/${taskId}`),
  
  update: (taskId: string, data: Partial<Task>) => 
    api.patch<Task>(`/tasks/${taskId}`, data),
  
  delete: (taskId: string) => 
    api.delete(`/tasks/${taskId}`),
  
  move: (taskId: string, status: string, position: number) => 
    api.patch<Task>(`/tasks/${taskId}/move`, { status, position }),
  
  assign: (taskId: string, assigneeId: string) => 
    api.patch<Task>(`/tasks/${taskId}/assign`, { assigneeId }),
  
  complete: (taskId: string) => 
    api.patch<Task>(`/tasks/${taskId}/complete`),
};

// Messages API
export const messagesApi = {
  list: (projectId: string, params?: { page?: number; limit?: number }) => 
    api.get<{ messages: Message[]; hasMore: boolean }>(
      `/projects/${projectId}/messages`,
      params ? { page: String(params.page || 1), limit: String(params.limit || 50) } : undefined
    ),
  
  send: (projectId: string, content: string) => 
    api.post<Message>(`/projects/${projectId}/messages`, { content }),
};

// Files API
export const filesApi = {
  list: (projectId: string) => 
    api.get<ProjectFile[]>('/files', { projectId }),
  
  upload: (projectId: string, file: File) => 
    api.upload<ProjectFile>('/files', file, { projectId }),
  
  delete: (fileId: string) => 
    api.delete(`/files/${fileId}`),
  
  getDownloadUrl: (fileId: string) => 
    api.get<{ url: string }>(`/files/${fileId}/download`),
};

// Activity API
export const activityApi = {
  list: (projectId: string, params?: { page?: number; limit?: number }) => 
    api.get<Activity[]>('/activities', params ? { projectId, page: String(params.page || 1), limit: String(params.limit || 20) } : { projectId }),
  
  getTeamActivity: (teamId: string) => 
    api.get<Activity[]>('/activities', { teamId }),
};

// Notifications API
export const notificationsApi = {
  list: (params?: { unreadOnly?: boolean }) => 
    api.get<Notification[]>('/notifications', params ? { unreadOnly: String(params.unreadOnly) } : undefined),
  
  markRead: (notificationId: string) => 
    api.patch(`/notifications/${notificationId}/read`),
  
  markAllRead: () => 
    api.post('/notifications/mark-all-read'),
};

// Types
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  createdAt: string;
}

export interface Team {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  memberCount: number;
  role: 'owner' | 'admin' | 'member';
}

export interface TeamMember {
  id: string;
  userId: string;
  user: User;
  role: 'owner' | 'admin' | 'member';
  joinedAt: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  teamId: string;
  createdAt: string;
  taskCount: number;
  memberCount: number;
}

export interface ProjectDetails extends Project {
  team: Team;
  members: TeamMember[];
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'backlog' | 'todo' | 'in_progress' | 'review' | 'done';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assigneeId?: string;
  assignee?: User;
  projectId: string;
  position: number;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  content: string;
  userId: string;
  user: User;
  projectId: string;
  createdAt: string;
}

export interface ProjectFile {
  id: string;
  name: string;
  url: string;
  size: number;
  mimeType: string;
  uploadedBy: User;
  projectId: string;
  createdAt: string;
}

export interface Activity {
  id: string;
  type: 'task_created' | 'task_updated' | 'task_moved' | 'message_sent' | 'file_uploaded' | 'member_joined';
  description: string;
  userId: string;
  user: User;
  projectId: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  projectId?: string;
  createdAt: string;
}
