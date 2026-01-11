import { useState, useEffect, useCallback } from 'react';
import { activityApi, Activity } from '@/lib/api';
import { useSocketEvent } from '@/contexts/SocketContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle, MessageSquare, FileUp, UserPlus, ArrowRight, RefreshCw } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

interface ActivityFeedProps {
  projectId: string;
}

const ACTIVITY_ICONS = {
  task_created: CheckCircle,
  task_updated: RefreshCw,
  task_moved: ArrowRight,
  message_sent: MessageSquare,
  file_uploaded: FileUp,
  member_joined: UserPlus,
};

const ACTIVITY_COLORS = {
  task_created: 'text-success bg-success/10',
  task_updated: 'text-blue-500 bg-blue-500/10',
  task_moved: 'text-purple-500 bg-purple-500/10',
  message_sent: 'text-primary bg-primary/10',
  file_uploaded: 'text-orange-500 bg-orange-500/10',
  member_joined: 'text-accent bg-accent/10',
};

export default function ActivityFeed({ projectId }: ActivityFeedProps) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  const loadActivities = useCallback(async (pageNum: number = 1) => {
    setIsLoading(true);
    try {
      const response = await activityApi.list(projectId, { page: pageNum, limit: 20 });
      if (pageNum === 1) {
        setActivities(response.activities);
      } else {
        setActivities((prev) => [...prev, ...response.activities]);
      }
      setHasMore(response.hasMore);
      setPage(pageNum);
    } catch (error) {
      console.error('Failed to load activities:', error);
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

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
      <div className="p-4 border-b border-border">
        <h3 className="font-medium">Activity</h3>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
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
              const colorClass = ACTIVITY_COLORS[activity.type] || 'text-muted-foreground bg-muted';

              return (
                <div key={activity.id} className="flex gap-3 animate-fade-in">
                  <div className="flex flex-col items-center">
                    <div className={cn('h-8 w-8 rounded-full flex items-center justify-center', colorClass)}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="w-px flex-1 bg-border mt-2" />
                  </div>

                  <div className="flex-1 pb-4">
                    <div className="flex items-center gap-2 mb-1">
                      <Avatar className="h-5 w-5">
                        <AvatarImage src={activity.user.avatar} />
                        <AvatarFallback className="text-[10px]">
                          {getInitials(activity.user.name)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium">{activity.user.name}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{activity.description}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
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
