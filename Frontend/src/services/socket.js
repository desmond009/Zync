import { io } from 'socket.io-client';
import { toast } from 'react-hot-toast';

class SocketService {
  constructor() {
    this.socket = null;
    this.listeners = new Map();
  }

  connect(token) {
    if (this.socket?.connected) return;

    this.socket = io(import.meta.env.VITE_API_URL || 'http://localhost:3000', {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    this.socket.on('connect', () => {
      console.log('Socket connected:', this.socket.id);
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      if (reason === 'io server disconnect') {
        this.socket.connect();
      }
    });

    this.socket.on('error', (error) => {
      console.error('Socket error:', error);
      toast.error('Connection error. Please refresh the page.');
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.listeners.clear();
    }
  }

  // Join project room
  joinProject(projectId) {
    if (this.socket) {
      this.socket.emit('project:join', { projectId });
    }
  }

  // Leave project room
  leaveProject(projectId) {
    if (this.socket) {
      this.socket.emit('project:leave', { projectId });
    }
  }

  // Task events
  onTaskCreate(callback) {
    this.on('task:created', callback);
  }

  onTaskUpdate(callback) {
    this.on('task:updated', callback);
  }

  onTaskDelete(callback) {
    this.on('task:deleted', callback);
  }

  onTaskAssign(callback) {
    this.on('task:assigned', callback);
  }

  // Comment events
  onCommentCreate(callback) {
    this.on('comment:created', callback);
  }

  onCommentUpdate(callback) {
    this.on('comment:updated', callback);
  }

  onCommentDelete(callback) {
    this.on('comment:deleted', callback);
  }

  // Chat events
  sendMessage(projectId, message) {
    if (this.socket) {
      this.socket.emit('chat:message', { projectId, message });
    }
  }

  onMessage(callback) {
    this.on('chat:message', callback);
  }

  // Typing indicator
  startTyping(projectId) {
    if (this.socket) {
      this.socket.emit('chat:typing', { projectId, typing: true });
    }
  }

  stopTyping(projectId) {
    if (this.socket) {
      this.socket.emit('chat:typing', { projectId, typing: false });
    }
  }

  onTyping(callback) {
    this.on('chat:typing', callback);
  }

  // Presence events
  onUserOnline(callback) {
    this.on('presence:online', callback);
  }

  onUserOffline(callback) {
    this.on('presence:offline', callback);
  }

  onUserActivity(callback) {
    this.on('presence:activity', callback);
  }

  // Cursor tracking
  updateCursor(projectId, position) {
    if (this.socket) {
      this.socket.emit('presence:cursor', { projectId, position });
    }
  }

  onCursorMove(callback) {
    this.on('presence:cursor', callback);
  }

  // Notification events
  onNotification(callback) {
    this.on('notification:new', callback);
  }

  // Generic event listeners
  on(event, callback) {
    if (this.socket) {
      this.socket.on(event, callback);
      
      // Store callback for cleanup
      if (!this.listeners.has(event)) {
        this.listeners.set(event, []);
      }
      this.listeners.get(event).push(callback);
    }
  }

  off(event, callback) {
    if (this.socket) {
      this.socket.off(event, callback);
      
      // Remove from stored callbacks
      const callbacks = this.listeners.get(event);
      if (callbacks) {
        const index = callbacks.indexOf(callback);
        if (index > -1) {
          callbacks.splice(index, 1);
        }
      }
    }
  }

  // Remove all listeners for an event
  removeAllListeners(event) {
    if (this.socket) {
      this.socket.removeAllListeners(event);
      this.listeners.delete(event);
    }
  }
}

export const socketService = new SocketService();
export default socketService;
