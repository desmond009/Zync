import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { io } from 'socket.io-client';
import { toast } from 'react-hot-toast';
import { useAuthStore } from '@/store/authStore';

/**
 * Socket Connection States
 */
export const SocketState = {
  DISCONNECTED: 'disconnected',
  CONNECTING: 'connecting',
  CONNECTED: 'connected',
  RECONNECTING: 'reconnecting',
  ERROR: 'error',
};

/**
 * Socket Context
 */
const SocketContext = createContext(null);

/**
 * Hook to access Socket context
 */
export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within SocketProvider');
  }
  return context;
};

/**
 * Socket Provider - Centralized Socket.io connection management
 * 
 * Responsibilities:
 * - Single socket instance per session
 * - JWT authentication during handshake
 * - Lifecycle management (connect, disconnect, reconnect)
 * - Automatic cleanup on logout
 * - Event subscription/unsubscription
 */
export const SocketProvider = ({ children }) => {
  const socketRef = useRef(null);
  const [connectionState, setConnectionState] = useState(SocketState.DISCONNECTED);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const eventListenersRef = useRef(new Map());
  const reconnectTimeoutRef = useRef(null);
  const reconnectAttemptsRef = useRef(0);

  const { isAuthenticated, user } = useAuthStore();

  /**
   * Initialize socket connection
   */
  const connect = useCallback((token) => {
    // Prevent duplicate connections
    if (socketRef.current?.connected) {
      console.log('[Socket] Already connected');
      return socketRef.current;
    }

    console.log('[Socket] Initializing connection...');
    setConnectionState(SocketState.CONNECTING);

    // Create socket instance with JWT auth
    socketRef.current = io(window.location.origin, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 10000,
    });

    const socket = socketRef.current;

    // Connection event handlers
    socket.on('connect', () => {
      console.log('[Socket] Connected:', socket.id);
      setConnectionState(SocketState.CONNECTED);
      setIsReconnecting(false);
      reconnectAttemptsRef.current = 0;

      // Clear reconnect timeout if exists
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }

      // Notify user of reconnection (skip first connect)
      if (isReconnecting) {
        toast.success('Reconnected to server', { id: 'socket-reconnect' });
      }
    });

    socket.on('disconnect', (reason) => {
      console.log('[Socket] Disconnected:', reason);
      setConnectionState(SocketState.DISCONNECTED);

      // Handle different disconnect reasons
      if (reason === 'io server disconnect') {
        // Server forcibly disconnected - requires manual reconnect
        console.log('[Socket] Server disconnected socket, attempting reconnect...');
        socket.connect();
      } else if (reason === 'transport close' || reason === 'ping timeout') {
        // Network issue - socket.io will auto-reconnect
        setIsReconnecting(true);
      }
    });

    socket.on('connect_error', (error) => {
      console.error('[Socket] Connection error:', error.message);
      setConnectionState(SocketState.ERROR);
      reconnectAttemptsRef.current++;

      // Show error after multiple failed attempts
      if (reconnectAttemptsRef.current >= 3) {
        toast.error('Unable to connect to server. Please check your connection.', {
          id: 'socket-error',
        });
      }
    });

    socket.on('reconnect_attempt', (attemptNumber) => {
      console.log(`[Socket] Reconnect attempt ${attemptNumber}`);
      setConnectionState(SocketState.RECONNECTING);
      setIsReconnecting(true);
    });

    socket.on('reconnect_failed', () => {
      console.error('[Socket] Reconnection failed after max attempts');
      setConnectionState(SocketState.ERROR);
      toast.error('Failed to reconnect. Please refresh the page.', {
        id: 'socket-reconnect-failed',
      });
    });

    socket.on('error', (error) => {
      console.error('[Socket] Socket error:', error);
      setConnectionState(SocketState.ERROR);
    });

    return socket;
  }, [isReconnecting]);

  /**
   * Disconnect socket
   */
  const disconnect = useCallback(() => {
    if (socketRef.current) {
      console.log('[Socket] Disconnecting...');
      
      // Clean up all event listeners
      eventListenersRef.current.forEach((listeners, eventName) => {
        listeners.forEach((callback) => {
          socketRef.current.off(eventName, callback);
        });
      });
      eventListenersRef.current.clear();

      // Disconnect socket
      socketRef.current.disconnect();
      socketRef.current = null;
      setConnectionState(SocketState.DISCONNECTED);
      setIsReconnecting(false);
      reconnectAttemptsRef.current = 0;

      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
    }
  }, []);

  /**
   * Subscribe to socket event
   * Returns unsubscribe function
   */
  const on = useCallback((eventName, callback) => {
    if (!socketRef.current) {
      console.warn(`[Socket] Cannot subscribe to ${eventName}: socket not connected`);
      return () => {};
    }

    console.log(`[Socket] Subscribing to event: ${eventName}`);
    socketRef.current.on(eventName, callback);

    // Track listener for cleanup
    if (!eventListenersRef.current.has(eventName)) {
      eventListenersRef.current.set(eventName, new Set());
    }
    eventListenersRef.current.get(eventName).add(callback);

    // Return unsubscribe function
    return () => {
      if (socketRef.current) {
        socketRef.current.off(eventName, callback);
      }
      const listeners = eventListenersRef.current.get(eventName);
      if (listeners) {
        listeners.delete(callback);
        if (listeners.size === 0) {
          eventListenersRef.current.delete(eventName);
        }
      }
    };
  }, []);

  /**
   * Emit socket event with acknowledgment support
   */
  const emit = useCallback((eventName, data, ackCallback) => {
    if (!socketRef.current?.connected) {
      console.warn(`[Socket] Cannot emit ${eventName}: socket not connected`);
      if (ackCallback) {
        ackCallback({ success: false, error: 'Socket not connected' });
      }
      return;
    }

    console.log(`[Socket] Emitting event: ${eventName}`, data);
    
    if (ackCallback) {
      socketRef.current.emit(eventName, data, ackCallback);
    } else {
      socketRef.current.emit(eventName, data);
    }
  }, []);

  /**
   * Join project room
   */
  const joinProject = useCallback((projectId) => {
    if (!projectId) {
      console.warn('[Socket] Cannot join project: projectId is required');
      return;
    }

    emit('project:join', projectId, (response) => {
      if (response?.success === false) {
        console.error('[Socket] Failed to join project:', response.error);
        toast.error('Failed to join project room');
      } else {
        console.log(`[Socket] Joined project: ${projectId}`);
      }
    });
  }, [emit]);

  /**
   * Leave project room
   */
  const leaveProject = useCallback((projectId) => {
    if (!projectId) return;
    
    emit('project:leave', projectId);
    console.log(`[Socket] Left project: ${projectId}`);
  }, [emit]);

  /**
   * Initialize socket on authentication
   */
  useEffect(() => {
    if (isAuthenticated && user) {
      const token = localStorage.getItem('accessToken');
      if (token) {
        connect(token);
      }
    } else {
      // Disconnect on logout
      disconnect();
    }

    // Cleanup on unmount
    return () => {
      disconnect();
    };
  }, [isAuthenticated, user, connect, disconnect]);

  /**
   * Context value
   */
  const value = {
    socket: socketRef.current,
    connectionState,
    isConnected: connectionState === SocketState.CONNECTED,
    isReconnecting,
    on,
    emit,
    joinProject,
    leaveProject,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};
