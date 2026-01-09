import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send,
  Smile,
  Paperclip,
  MoreVertical,
  Check,
  CheckCheck,
} from 'lucide-react';
import { Avatar, Button } from '@/components/ui';
import { useAuthStore } from '@/store/authStore';
import { getInitials, cn } from '@/lib/utils';
import { format, isToday, isYesterday } from 'date-fns';

const formatMessageTime = (date) => {
  const messageDate = new Date(date);
  if (isToday(messageDate)) {
    return format(messageDate, 'HH:mm');
  } else if (isYesterday(messageDate)) {
    return `Yesterday ${format(messageDate, 'HH:mm')}`;
  } else {
    return format(messageDate, 'MMM d, HH:mm');
  }
};

const Message = ({ message, isOwn, showAvatar }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'flex gap-3 group',
        isOwn ? 'flex-row-reverse' : 'flex-row'
      )}
    >
      {/* Avatar */}
      <div className={cn('flex-shrink-0', !showAvatar && 'invisible')}>
        <Avatar
          src={message.sender.avatar}
          fallback={getInitials(message.sender.name)}
          size="sm"
          className="w-8 h-8"
        />
      </div>

      {/* Message Content */}
      <div className={cn('flex flex-col max-w-[70%]', isOwn && 'items-end')}>
        {showAvatar && (
          <div className={cn('flex items-center gap-2 mb-1', isOwn && 'flex-row-reverse')}>
            <span className="text-xs font-medium text-slate-900 dark:text-white">
              {message.sender.name}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {formatMessageTime(message.createdAt)}
            </span>
          </div>
        )}

        <div
          className={cn(
            'rounded-lg px-4 py-2',
            isOwn
              ? 'bg-indigo-600 text-white'
              : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700'
          )}
        >
          <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
        </div>

        {/* Read Status */}
        {isOwn && (
          <div className="flex items-center gap-1 mt-1">
            {message.readBy && message.readBy.length > 0 ? (
              <CheckCheck className="w-3 h-3 text-indigo-600" />
            ) : (
              <Check className="w-3 h-3 text-slate-400" />
            )}
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {!showAvatar && formatMessageTime(message.createdAt)}
            </span>
          </div>
        )}

        {!isOwn && !showAvatar && (
          <span className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {formatMessageTime(message.createdAt)}
          </span>
        )}
      </div>

      {/* Message Actions */}
      <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700">
        <MoreVertical className="w-4 h-4 text-slate-400" />
      </button>
    </motion.div>
  );
};

const TypingIndicator = ({ users }) => {
  if (users.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className="flex items-center gap-2 px-4"
    >
      <div className="flex -space-x-2">
        {users.slice(0, 3).map((user) => (
          <Avatar
            key={user.id}
            src={user.avatar}
            fallback={getInitials(user.name)}
            size="sm"
            className="w-6 h-6 border-2 border-white dark:border-slate-900"
          />
        ))}
      </div>
      <div className="flex items-center gap-1">
        <div className="flex gap-1">
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
            className="w-2 h-2 bg-slate-400 rounded-full"
          />
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
            className="w-2 h-2 bg-slate-400 rounded-full"
          />
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
            className="w-2 h-2 bg-slate-400 rounded-full"
          />
        </div>
        <span className="text-xs text-slate-500 dark:text-slate-400 ml-1">
          {users.length === 1
            ? `${users[0].name} is typing...`
            : `${users.length} people are typing...`}
        </span>
      </div>
    </motion.div>
  );
};

export const ProjectChat = ({ projectId }) => {
  const { user } = useAuthStore();
  const [messages, setMessages] = useState([
    // Mock data
    {
      _id: '1',
      content: 'Hey team! I just pushed the latest updates to the design system.',
      sender: {
        _id: 'user1',
        name: 'Sarah Johnson',
        avatar: null,
      },
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      readBy: [user?.id],
    },
    {
      _id: '2',
      content: 'Great work! I\'ll review it today.',
      sender: {
        _id: user?.id,
        name: user?.name,
        avatar: user?.avatar,
      },
      createdAt: new Date(Date.now() - 3500000).toISOString(),
      readBy: ['user1', 'user2'],
    },
    {
      _id: '3',
      content: 'Can someone help me with the authentication flow? I\'m getting some errors.',
      sender: {
        _id: 'user2',
        name: 'Mike Chen',
        avatar: null,
      },
      createdAt: new Date(Date.now() - 3400000).toISOString(),
      readBy: [],
    },
  ]);
  const [messageInput, setMessageInput] = useState('');
  const [typingUsers, setTypingUsers] = useState([]);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Focus input on mount
    inputRef.current?.focus();
  }, []);

  const handleSendMessage = (e) => {
    e.preventDefault();
    
    if (!messageInput.trim()) return;

    const newMessage = {
      _id: Date.now().toString(),
      content: messageInput,
      sender: {
        _id: user?.id,
        name: user?.name,
        avatar: user?.avatar,
      },
      createdAt: new Date().toISOString(),
      readBy: [],
    };

    setMessages([...messages, newMessage]);
    setMessageInput('');
    
    // TODO: Send message via socket
  };

  const handleInputChange = (e) => {
    setMessageInput(e.target.value);
    // TODO: Emit typing event via socket
  };

  const groupMessages = () => {
    const grouped = [];
    let currentGroup = [];
    let lastSenderId = null;
    let lastMessageTime = null;

    messages.forEach((message) => {
      const timeDiff = lastMessageTime
        ? new Date(message.createdAt) - new Date(lastMessageTime)
        : 0;
      const isSameSender = message.sender._id === lastSenderId;
      const isWithinTimeWindow = timeDiff < 60000; // 1 minute

      if (isSameSender && isWithinTimeWindow) {
        currentGroup.push({ ...message, showAvatar: false });
      } else {
        if (currentGroup.length > 0) {
          grouped.push(currentGroup);
        }
        currentGroup = [{ ...message, showAvatar: true }];
      }

      lastSenderId = message.sender._id;
      lastMessageTime = message.createdAt;
    });

    if (currentGroup.length > 0) {
      grouped.push(currentGroup);
    }

    return grouped;
  };

  const groupedMessages = groupMessages();

  return (
    <div className="h-full flex flex-col bg-white dark:bg-slate-900">
      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        <div className="space-y-4">
          {groupedMessages.map((group, groupIndex) => (
            <div key={groupIndex} className="space-y-1">
              {group.map((message) => (
                <Message
                  key={message._id}
                  message={message}
                  isOwn={message.sender._id === user?.id}
                  showAvatar={message.showAvatar}
                />
              ))}
            </div>
          ))}

          {/* Typing Indicator */}
          <AnimatePresence>
            <TypingIndicator users={typingUsers} />
          </AnimatePresence>

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Message Input */}
      <div className="flex-shrink-0 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-6 py-4">
        <form onSubmit={handleSendMessage} className="flex items-end gap-3">
          <div className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-transparent transition-all">
            <textarea
              ref={inputRef}
              value={messageInput}
              onChange={handleInputChange}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage(e);
                }
              }}
              placeholder="Type a message... (Shift+Enter for new line)"
              rows={1}
              className="w-full px-4 py-3 bg-transparent text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 resize-none focus:outline-none text-sm"
              style={{
                minHeight: '44px',
                maxHeight: '120px',
              }}
            />

            {/* Toolbar */}
            <div className="flex items-center justify-between px-4 pb-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition-colors"
                  title="Add emoji"
                >
                  <Smile className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition-colors"
                  title="Attach file"
                >
                  <Paperclip className="w-4 h-4" />
                </button>
              </div>

              <span className="text-xs text-slate-400 dark:text-slate-500">
                {messageInput.length}/2000
              </span>
            </div>
          </div>

          <Button
            type="submit"
            disabled={!messageInput.trim()}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed h-[44px] px-4"
          >
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </div>
    </div>
  );
};
