import { useState, useEffect } from 'react';
import { useSocket } from '@/contexts/SocketContext';
import { notificationsApi, Notification } from '@/lib/api';
import { formatDistanceToNow } from 'date-fns';
import {
    Inbox as InboxIcon,
    Filter,
    CheckCircle2,
    Bell,
    SlidersHorizontal,
    Mail
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function InboxPage() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'unread'>('all');
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const { socket } = useSocket();

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const response = await notificationsApi.list({ unreadOnly: filter === 'unread' });
            // Helper to handle both direct array and paginated response
            const items = (response as any).notifications || (Array.isArray(response) ? response : []);
            setNotifications(items);
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, [filter]);

    useEffect(() => {
        if (!socket) return;

        socket.on('notification:new', (newNotification: Notification) => {
            setNotifications(prev => [newNotification, ...prev]);
        });

        return () => {
            socket.off('notification:new');
        };
    }, [socket]);

    const markAsRead = async (id: string) => {
        try {
            await notificationsApi.markRead(id);
            setNotifications(prev =>
                prev.map(n => ((n._id === id || n.id === id) ? { ...n, isRead: true } : n))
            );
        } catch (error) {
            console.error('Failed to mark as read:', error);
        }
    };

    const markAllAsRead = async () => {
        try {
            await notificationsApi.markAllRead();
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        } catch (error) {
            console.error('Failed to mark all as read:', error);
        }
    };

    const getIconForType = (type: string) => {
        switch (type) {
            case 'TASK_ASSIGNED':
            case 'TASK_UPDATED':
                return <CheckCircle2 className="h-4 w-4 text-blue-500" />;
            case 'MENTION':
                return <span className="h-4 w-4 flex items-center justify-center font-bold text-orange-500 text-[10px]">@</span>;
            default:
                return <Bell className="h-4 w-4 text-indigo-500" />;
        }
    };

    return (
        <div className="h-full flex flex-col lg:flex-row bg-[#09090b] text-[#e4e4e7]">
            {/* Left Pane - Notification List */}
            <div className={cn(
                "w-full lg:w-[400px] flex flex-col border-r border-[#27272a]",
                selectedId && "hidden lg:flex"
            )}>
                {/* Header */}
                <div className="h-12 sm:h-14 border-b border-[#27272a] px-3 sm:px-4 flex items-center justify-between shrink-0">
                    <span className="font-medium text-xs sm:text-sm">Inbox</span>
                    <div className="flex items-center gap-1">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-[#a1a1aa] hover:text-[#e4e4e7] hover:bg-[#27272a]">
                                    <Filter className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-[#18181b] border-[#27272a] text-[#e4e4e7]">
                                <DropdownMenuItem onClick={() => setFilter('all')} className="focus:bg-[#27272a] focus:text-[#e4e4e7] cursor-pointer">
                                    All
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setFilter('unread')} className="focus:bg-[#27272a] focus:text-[#e4e4e7] cursor-pointer">
                                    Unread
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={markAllAsRead} className="focus:bg-[#27272a] focus:text-[#e4e4e7] cursor-pointer">
                                    Mark all read
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-[#a1a1aa] hover:text-[#e4e4e7] hover:bg-[#27272a]">
                            <SlidersHorizontal className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {/* List Content */}
                <div className="flex-1 overflow-y-auto">
                    {loading ? (
                        <div className="flex items-center justify-center h-full">
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-[#a1a1aa]"></div>
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-[#a1a1aa] p-6 text-center">
                            <p className="text-sm">No notifications</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-[#27272a]">
                            {notifications.map((notification) => {
                                const id = notification._id || notification.id!;
                                const isRead = notification.isRead;
                                const isSelected = selectedId === id;

                                return (
                                    <div
                                        key={id}
                                        onClick={() => {
                                            setSelectedId(id);
                                            if (!isRead) markAsRead(id);
                                        }}
                                        className={cn(
                                            "p-3 sm:p-4 cursor-pointer transition-colors group relative flex gap-2 sm:gap-3 hover:bg-[#27272a]/50",
                                            isSelected && "bg-[#27272a]",
                                            !isRead && "bg-[#27272a]/20"
                                        )}
                                    >
                                        <div className="mt-0.5 shrink-0">
                                            {getIconForType(notification.type)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2 mb-1">
                                                <span className={cn("text-xs font-medium text-[#a1a1aa]", !isRead && "text-[#e4e4e7]")}>
                                                    zync-team
                                                </span>
                                                <span className="text-[10px] text-[#71717a] whitespace-nowrap">
                                                    {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                                                </span>
                                            </div>
                                            <p className={cn("text-sm line-clamp-2", isRead ? "text-[#a1a1aa]" : "text-[#e4e4e7]")}>
                                                {typeof notification.content === 'string' ? notification.content : JSON.stringify(notification.content)}
                                            </p>
                                        </div>
                                        {!isRead && (
                                            <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-blue-500" />
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Right Pane - Detail View */}
            <div className={cn(
                "flex-1 flex flex-col items-center justify-center bg-[#09090b]",
                !selectedId && "hidden lg:flex"
            )}>
                {selectedId ? (
                    <div className="w-full h-full flex flex-col">
                        {/* Mobile back button */}
                        <div className="lg:hidden h-12 sm:h-14 border-b border-[#27272a] px-3 sm:px-4 flex items-center gap-3">
                            <button
                                onClick={() => setSelectedId(null)}
                                className="text-[#a1a1aa] hover:text-[#e4e4e7]"
                            >
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                            </button>
                            <span className="font-medium text-xs sm:text-sm">Back to Inbox</span>
                        </div>
                        {/* Notification content */}
                        <div className="flex-1 flex flex-col items-center justify-center text-[#a1a1aa] p-4">
                            <p className="text-sm">Notification Details View</p>
                        </div>
                    </div>
                ) : (
                    // Empty State
                    <div className="flex flex-col items-center justify-center text-[#a1a1aa] gap-3">
                        <div className="relative">
                            <InboxIcon className="h-12 w-12 sm:h-16 sm:w-16 stroke-[1px] opacity-20" />
                            {/* Optional: Add a subtle badge or graphic if needed to match exact image */}
                        </div>
                        <p className="text-sm font-medium opacity-40">No notifications</p>
                    </div>
                )}
            </div>
        </div>
    );
}
