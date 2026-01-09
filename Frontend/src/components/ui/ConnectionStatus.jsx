import React from 'react';
import { useSocket, SocketState } from '@/contexts/SocketContext';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';

/**
 * Connection Status Indicator
 * 
 * Displays socket connection state subtly in the UI
 * - Connected: Hidden (expected state)
 * - Reconnecting: Yellow indicator
 * - Disconnected: Red indicator with retry option
 * - Error: Red indicator with error message
 */
export const ConnectionStatus = () => {
  const { connectionState, isReconnecting } = useSocket();

  // Don't show anything when connected (happy path)
  if (connectionState === SocketState.CONNECTED && !isReconnecting) {
    return null;
  }

  const getStatusConfig = () => {
    switch (connectionState) {
      case SocketState.CONNECTING:
        return {
          icon: RefreshCw,
          text: 'Connecting...',
          className: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-700 dark:text-yellow-400',
          iconClassName: 'text-yellow-600 dark:text-yellow-400 animate-spin',
        };
      case SocketState.RECONNECTING:
        return {
          icon: RefreshCw,
          text: 'Reconnecting...',
          className: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800 text-yellow-700 dark:text-yellow-400',
          iconClassName: 'text-yellow-600 dark:text-yellow-400 animate-spin',
        };
      case SocketState.DISCONNECTED:
        return {
          icon: WifiOff,
          text: 'Disconnected',
          className: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-400',
          iconClassName: 'text-red-600 dark:text-red-400',
        };
      case SocketState.ERROR:
        return {
          icon: WifiOff,
          text: 'Connection error',
          className: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-400',
          iconClassName: 'text-red-600 dark:text-red-400',
        };
      default:
        return null;
    }
  };

  const config = getStatusConfig();
  if (!config) return null;

  const Icon = config.icon;

  return (
    <div
      className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium shadow-lg transition-all duration-300 ${config.className}`}
      role="status"
      aria-live="polite"
    >
      <Icon className={`w-4 h-4 ${config.iconClassName}`} />
      <span>{config.text}</span>
    </div>
  );
};
