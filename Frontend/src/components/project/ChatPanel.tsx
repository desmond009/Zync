import { useState, useEffect, useRef, useCallback } from 'react';
import { messagesApi, Message } from '@/lib/api';
import { useSocketEvent } from '@/contexts/SocketContext';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

interface ChatPanelProps {
  projectId: string;
}

export default function ChatPanel({ projectId }: ChatPanelProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const loadMessages = useCallback(async (pageNum: number = 1) => {
    setIsLoading(true);
    try {
      const response = await messagesApi.list(projectId, { page: pageNum, limit: 50 });
      if (pageNum === 1) {
        setMessages(response.messages);
      } else {
        setMessages((prev) => [...response.messages, ...prev]);
      }
      setHasMore(response.hasMore);
      setPage(pageNum);
    } catch (error) {
      console.error('Failed to load messages:', error);
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  // Socket event for new messages
  useSocketEvent<Message>('message.created', (message) => {
    setMessages((prev) => [...prev, message]);
  }, []);

  const handleSend = async () => {
    if (!newMessage.trim() || isSending) return;

    const messageText = newMessage.trim();
    setNewMessage('');
    setIsSending(true);

    try {
      await messagesApi.send(projectId, messageText);
      // Message will be added via socket event
    } catch (error) {
      console.error('Failed to send message:', error);
      setNewMessage(messageText); // Restore message on error
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const loadMore = () => {
    if (!isLoading && hasMore) {
      loadMessages(page + 1);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
      >
        {hasMore && (
          <div className="text-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={loadMore}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Load more'
              )}
            </Button>
          </div>
        )}

        {messages.length === 0 && !isLoading && (
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground">No messages yet</p>
            <p className="text-xs text-muted-foreground mt-1">
              Start the conversation!
            </p>
          </div>
        )}

        {messages.map((message, index) => {
          const isOwn = message.userId === user?.id;
          const showAvatar =
            index === 0 || messages[index - 1].userId !== message.userId;

          return (
            <div
              key={message.id}
              className={cn(
                'flex gap-2 animate-fade-in',
                isOwn && 'flex-row-reverse'
              )}
            >
              {showAvatar ? (
                <Avatar className="h-8 w-8 flex-shrink-0">
                  <AvatarImage src={message.user.avatar} />
                  <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                    {getInitials(message.user.name)}
                  </AvatarFallback>
                </Avatar>
              ) : (
                <div className="w-8 flex-shrink-0" />
              )}

              <div
                className={cn(
                  'max-w-[80%]',
                  isOwn && 'items-end'
                )}
              >
                {showAvatar && (
                  <div
                    className={cn(
                      'flex items-baseline gap-2 mb-1',
                      isOwn && 'flex-row-reverse'
                    )}
                  >
                    <span className="text-xs font-medium">
                      {isOwn ? 'You' : message.user.name}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {formatDistanceToNow(new Date(message.createdAt), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>
                )}
                <div
                  className={cn(
                    'px-3 py-2 rounded-xl text-sm',
                    isOwn
                      ? 'bg-primary text-primary-foreground rounded-tr-sm'
                      : 'bg-muted rounded-tl-sm'
                  )}
                >
                  {message.content}
                </div>
              </div>
            </div>
          );
        })}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-border">
        <div className="flex gap-2">
          <Input
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isSending}
            className="flex-1"
          />
          <Button
            size="icon"
            onClick={handleSend}
            disabled={!newMessage.trim() || isSending}
            className="gradient-primary"
          >
            {isSending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
