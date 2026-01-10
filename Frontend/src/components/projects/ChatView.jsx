import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Avatar, Button } from '@/components/ui';
import { useProjectWorkspaceStore } from '@/store/projectWorkspaceStore';
import { useAuthStore } from '@/store/authStore';
import { useSocket } from '@/contexts/SocketContext';
import { getInitials, formatDate } from '@/lib/utils';

/**
 * CHAT VIEW
 * 
 * Real-time project chat:
 * - Messages persist via backend before broadcast
 * - Typing indicators
 * - Paginated message history
 * - Auto-scroll to bottom
 * - Reconnection resilience
 */

export const ChatView = () => {
  const socket = useSocket();
  const { user } = useAuthStore();
  const {
    activeProjectId,
    messages,
    members,
    typingUsers,
    hasMoreMessages,
    isLoadingMessages,
    loadMessages,
    sendMessage,
    setTyping,
  } = useProjectWorkspaceStore();
  
  const [messageInput, setMessageInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  
  // ============================================
  // LOAD INITIAL MESSAGES
  // ============================================
  
  useEffect(() => {
    if (activeProjectId) {
      loadMessages(1);
    }
  }, [activeProjectId]);
  
  // ============================================
  // AUTO-SCROLL TO BOTTOM
  // ============================================
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  // ============================================
  // TYPING INDICATORS
  // ============================================
  
  useEffect(() => {
    if (!socket || !activeProjectId) return;
    
    const handleUserTyping = ({ userId, isTyping }) => {
      setTyping(userId, isTyping);
    };
    
    socket.on('user:typing', handleUserTyping);
    
    return () => {
      socket.off('user:typing', handleUserTyping);
    };
  }, [socket, activeProjectId]);
  
  const handleTyping = () => {
    if (!socket || !activeProjectId) return;
    
    // Emit typing start
    if (!isTyping) {
      socket.emit('user:typing', { projectId: activeProjectId, isTyping: true });
      setIsTyping(true);
    }
    
    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Set timeout to emit typing stop
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('user:typing', { projectId: activeProjectId, isTyping: false });
      setIsTyping(false);
    }, 1000);
  };
  
  // ============================================
  // SEND MESSAGE
  // ============================================
  
  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!messageInput.trim()) return;
    
    const content = messageInput.trim();
    setMessageInput('');
    
    // Stop typing indicator
    if (isTyping && socket) {
      socket.emit('user:typing', { projectId: activeProjectId, isTyping: false });
      setIsTyping(false);
    }
    
    try {
      await sendMessage(content);
    } catch (error) {
      console.error('Failed to send message:', error);
      // Restore message on error
      setMessageInput(content);
    }
  };
  
  // ============================================
  // LOAD MORE MESSAGES
  // ============================================
  
  const handleLoadMore = () => {
    const nextPage = Math.floor(messages.length / 50) + 1;
    loadMessages(nextPage);
  };
  
  // ============================================
  // RENDER TYPING INDICATOR
  // ============================================
  
  const renderTypingIndicator = () => {
    const typingUsersList = Array.from(typingUsers)
      .map((userId) => {
        const member = members.find((m) => (m.userId?._id || m.userId?.id) === userId);
        return member?.userId?.firstName || 'Someone';
      })
      .filter(Boolean);
    
    if (typingUsersList.length === 0) return null;
    
    const text =
      typingUsersList.length === 1
        ? `${typingUsersList[0]} is typing...`
        : typingUsersList.length === 2
        ? `${typingUsersList[0]} and ${typingUsersList[1]} are typing...`
        : `${typingUsersList[0]} and ${typingUsersList.length - 1} others are typing...`;
    
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        className="px-4 py-2 text-sm text-slate-500 dark:text-slate-400 italic"
      >
        {text}
      </motion.div>
    );
  };
  
  // ============================================
  // RENDER
  // ============================================
  
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-6 border-b border-slate-200 dark:border-slate-800">
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Chat</h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
          {members.length} {members.length === 1 ? 'member' : 'members'} online
        </p>
      </div>
      
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {/* Load more button */}
        {hasMoreMessages && !isLoadingMessages && messages.length > 0 && (
          <div className="text-center">
            <Button variant="ghost" size="sm" onClick={handleLoadMore}>
              Load older messages
            </Button>
          </div>
        )}
        
        {isLoadingMessages && (
          <div className="text-center py-4">
            <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        )}
        
        {/* Messages */}
        <AnimatePresence>
          {messages.map((message, index) => {
            const isOwn = (message.userId?._id || message.userId?.id) === user?.id || message.userId === user?.id;
            const showAvatar =
              index === 0 ||
              (messages[index - 1]?.userId?._id || messages[index - 1]?.userId?.id) !==
                (message.userId?._id || message.userId?.id);
            
            return (
              <motion.div
                key={message._id || message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className={`flex gap-3 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}
              >
                {/* Avatar */}
                <div className="flex-shrink-0">
                  {showAvatar ? (
                    <Avatar
                      src={message.userId?.avatar}
                      fallback={getInitials(
                        `${message.userId?.firstName || ''} ${message.userId?.lastName || ''}`
                      )}
                      size="sm"
                    />
                  ) : (
                    <div className="w-10 h-10" />
                  )}
                </div>
                
                {/* Message bubble */}
                <div className={`flex-1 max-w-lg ${isOwn ? 'text-right' : 'text-left'}`}>
                  {showAvatar && (
                    <div className="mb-1">
                      <span className="text-sm font-medium text-slate-900 dark:text-white">
                        {message.userId?.firstName} {message.userId?.lastName}
                      </span>
                      <span className="text-xs text-slate-500 dark:text-slate-400 ml-2">
                        {formatDate(message.createdAt)}
                      </span>
                    </div>
                  )}
                  
                  <div
                    className={`inline-block px-4 py-2 rounded-2xl ${
                      isOwn
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
        
        {/* Typing indicator */}
        <AnimatePresence>
          {typingUsers.size > 0 && renderTypingIndicator()}
        </AnimatePresence>
        
        {/* Empty state */}
        {messages.length === 0 && !isLoadingMessages && (
          <div className="text-center py-12">
            <svg
              className="w-16 h-16 mx-auto mb-4 text-slate-300 dark:text-slate-700"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
              No messages yet
            </h3>
            <p className="text-slate-600 dark:text-slate-400">
              Start the conversation by sending a message
            </p>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input area */}
      <div className="p-6 border-t border-slate-200 dark:border-slate-800">
        <form onSubmit={handleSendMessage} className="flex gap-3">
          <input
            ref={inputRef}
            type="text"
            value={messageInput}
            onChange={(e) => {
              setMessageInput(e.target.value);
              handleTyping();
            }}
            placeholder="Type a message..."
            className="flex-1 px-4 py-3 bg-slate-100 dark:bg-slate-800 border-0 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all duration-200"
          />
          <Button
            type="submit"
            disabled={!messageInput.trim()}
            size="lg"
            className="px-6"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
              />
            </svg>
          </Button>
        </form>
      </div>
    </div>
  );
};
