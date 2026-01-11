import React, { useEffect, useState } from 'react';
import { activityApi, Activity } from '@/lib/api';
import { Card } from './Card';
import { FileText, MessageSquare, CheckCircle2, Users } from 'lucide-react';

interface ActivityFeedProps {
  projectId?: string;
  limit?: number;
}

export const ActivityFeed: React.FC<ActivityFeedProps> = ({ projectId, limit = 8 }) => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // In a real implementation, fetch activities based on projectId
    // For now, we'll show a loading state
    setIsLoading(false);
  }, [projectId]);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'task_created':
        return <CheckCircle2 className="w-4 h-4 text-blue-600" />;
      case 'task_updated':
        return <CheckCircle2 className="w-4 h-4 text-slate-400" />;
      case 'task_moved':
        return <CheckCircle2 className="w-4 h-4 text-purple-600" />;
      case 'message_sent':
        return <MessageSquare className="w-4 h-4 text-green-600" />;
      case 'file_uploaded':
        return <FileText className="w-4 h-4 text-orange-600" />;
      case 'member_joined':
        return <Users className="w-4 h-4 text-slate-600" />;
      default:
        return <CheckCircle2 className="w-4 h-4 text-slate-400" />;
    }
  };

  const getRelativeTime = (date: string) => {
    const now = new Date();
    const then = new Date(date);
    const seconds = Math.floor((now.getTime() - then.getTime()) / 1000);

    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  if (isLoading) {
    return (
      <Card>
        <div className="space-y-4">
          <div className="h-6 w-32 bg-slate-200 rounded animate-pulse" />
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-12 bg-slate-100 rounded animate-pulse" />
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <h2 className="text-lg font-semibold text-slate-900 mb-4">Recent Activity</h2>

      {activities.length === 0 ? (
        <div className="py-8 text-center">
          <MessageSquare className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-sm text-slate-500">No activity yet</p>
          <p className="text-xs text-slate-400 mt-1">Activity will appear here</p>
        </div>
      ) : (
        <div className="space-y-3">
          {activities.slice(0, limit).map((activity) => (
            <div
              key={activity.id}
              className="flex items-start gap-3 p-3 rounded-md hover:bg-slate-50 transition-colors cursor-pointer group"
            >
              <div className="flex-shrink-0 mt-0.5">
                {getActivityIcon(activity.type)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-900 group-hover:text-slate-700">
                  <span className="font-medium">{activity.user?.name || 'Unknown'}</span>
                  {' '}
                  <span className="text-slate-600">{activity.description}</span>
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  {getRelativeTime(activity.createdAt)}
                </p>
              </div>
            </div>
          ))}

          {activities.length > limit && (
            <button className="w-full text-center pt-3 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
              View all activity →
            </button>
          )}
        </div>
      )}
    </Card>
  );
};
