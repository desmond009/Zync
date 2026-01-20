import { useState, useEffect, useCallback } from 'react';
import { activityApi, Activity } from '@/lib/api';
import { useSocketEvent } from '@/contexts/SocketContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle, MessageSquare, FileUp, UserPlus, ArrowRight, RefreshCw, Box } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

interface ActivityFeedProps {
  projectId: string;
  limit?: number;
  showTitle?: boolean;
}

const ACTIVITY_ICONS: Record<string, any> = {
  task_created: CheckCircle,
  task_updated: RefreshCw,
  task_moved: ArrowRight,
  message_sent: MessageSquare,
  file_uploaded: FileUp,
  member_joined: UserPlus,
  project_created: Box,
  project_updated: RefreshCw,
  lead_assigned: UserPlus,
};

const ACTIVITY_COLORS: Record<string, string> = {
  task_created: 'text-green-400',
  task_updated: 'text-blue-400',
  task_moved: 'text-purple-400',
  message_sent: 'text-blue-500',
  file_uploaded: 'text-orange-400',
  member_joined: 'text-yellow-400',
  project_created: 'text-gray-400',
  project_updated: 'text-blue-400',
  lead_assigned: 'text-yellow-400',
};

export default function ActivityFeed({ projectId, limit, showTitle = true }: ActivityFeedProps) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  const loadActivities = useCallback(async (pageNum: number = 1) => {
    setIsLoading(true);
    try {
      const response = await activityApi.list(projectId, { page: pageNum, limit: limit || 20 });
      // API currently returns Activity[] directly, ensuring it's an array
      const newActivities = Array.isArray(response) ? response : [];

      if (pageNum === 1) {
        setActivities(newActivities);
      } else {
        setActivities((prev) => [...prev, ...newActivities]);
      }
      // Simple pagination check: if we got less than requested, no more
      setHasMore(newActivities.length === (limit || 20));
      setPage(pageNum);
    } catch (error) {
      console.error('Failed to load activities:', error);
    } finally {
      setIsLoading(false);
    }
  }, [projectId, limit]);

  useEffect(() => {
    loadActivities();
  }, [loadActivities]);

  // Socket event for new activities
  useSocketEvent<Activity>('activity.created', (activity) => {
    setActivities((prev) => [activity, ...prev]);
  }, []);

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
      {showTitle && (
        <div className="p-4 border-b border-border">
          <h3 className="font-medium">Activity</h3>
        </div>
      )}

      <div className={cn("flex-1 overflow-y-auto", showTitle && "p-4")}>
        {isLoading && activities.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : activities.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-sm text-muted-foreground">No activity yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => {
              const Icon = ACTIVITY_ICONS[activity.type] || CheckCircle;
              const colorClass = ACTIVITY_COLORS[activity.type] || 'text-[#a1a1aa]';

              return (
                <div key={activity.id} className="flex items-start gap-2.5 group/item">
                  <div className={cn('mt-0.5 shrink-0')}>
                    <Icon className={cn("h-3.5 w-3.5", colorClass)} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] leading-snug text-[#e4e4e7]">
                      <span className="text-[#a1a1aa] whitespace-normal">
                        {activity.user.name} {activity.description}
                      </span>
                      <span className="text-[#52525b] ml-1.5 whitespace-nowrap">
                        · {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: false }).replace('about ', '')}
                      </span>
                    </p>
                  </div>
                </div>
              );
            })}

            {hasMore && (
              <div className="text-center pt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => loadActivities(page + 1)}
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
          </div>
        )}
      </div>
    </div>
  );
}
