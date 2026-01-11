import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3000';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  joinProjectRoom: (projectId: string) => void;
  leaveProjectRoom: (projectId: string) => void;
  currentRoom: string | null;
}

const SocketContext = createContext<SocketContextType | null>(null);

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const [isConnected, setIsConnected] = useState(false);
  const [currentRoom, setCurrentRoom] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    
    if (!token) {
      return;
    }

    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socket.on('connect', () => {
      setIsConnected(true);
      console.log('Socket connected');
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
      console.log('Socket disconnected');
    });

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      setIsConnected(false);
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);

  const joinProjectRoom = useCallback((projectId: string) => {
    const socket = socketRef.current;
    if (!socket || !isConnected) return;

    // Leave current room if different
    if (currentRoom && currentRoom !== projectId) {
      socket.emit('leave', `project:${currentRoom}`);
    }

    socket.emit('join', `project:${projectId}`);
    setCurrentRoom(projectId);
  }, [isConnected, currentRoom]);

  const leaveProjectRoom = useCallback((projectId: string) => {
    const socket = socketRef.current;
    if (!socket || !isConnected) return;

    socket.emit('leave', `project:${projectId}`);
    if (currentRoom === projectId) {
      setCurrentRoom(null);
    }
  }, [isConnected, currentRoom]);

  return (
    <SocketContext.Provider
      value={{
        socket: socketRef.current,
        isConnected,
        joinProjectRoom,
        leaveProjectRoom,
        currentRoom,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
}

// Hook for subscribing to socket events
export function useSocketEvent<T = unknown>(
  event: string,
  callback: (data: T) => void,
  deps: React.DependencyList = []
) {
  const { socket, currentRoom } = useSocket();

  useEffect(() => {
    if (!socket) return;

    const handler = (data: T & { projectId?: string }) => {
      // Only process events for the current active project
      if (data.projectId && data.projectId !== currentRoom) {
        return;
      }
      callback(data);
    };

    socket.on(event, handler);

    return () => {
      socket.off(event, handler);
    };
  }, [socket, event, currentRoom, ...deps]);
}
