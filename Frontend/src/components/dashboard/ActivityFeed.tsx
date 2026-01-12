import React, { useEffect, useState } from 'react';
import { activityApi, Activity } from '@/lib/api';
import { SectionCard, Skeleton } from './Card';
import {
  FileText,
  MessageSquare,
  CheckCircle2,
  Users,
  Zap,
  ArrowRight,
  Activity as ActivityIcon,
  GitPullRequest,
  FolderPlus
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ActivityFeedProps {
  projectId?: string;
  limit?: number;
}

const ACTIVITY_CONFIG = {
  task_created: {
    icon: CheckCircle2,
    gradient: 'from-indigo-500 to-violet-500',
    bg: 'bg-indigo-50',
    text: 'text-indigo-600',
  },
  task_updated: {
    icon: GitPullRequest,
    gradient: 'from-violet-500 to-purple-500',
    bg: 'bg-violet-50',
    text: 'text-violet-600',
  },
  task_moved: {
    icon: Zap,
    gradient: 'from-amber-500 to-orange-500',
    bg: 'bg-amber-50',
    text: 'text-amber-600',
  },
  message_sent: {
    icon: MessageSquare,
    gradient: 'from-cyan-500 to-blue-500',
    bg: 'bg-cyan-50',
    text: 'text-cyan-600',
  },
  file_uploaded: {
    icon: FileText,
    gradient: 'from-orange-500 to-rose-500',
    bg: 'bg-orange-50',
    text: 'text-orange-600',
  },
  member_joined: {
    icon: Users,
    gradient: 'from-emerald-500 to-teal-500',
    bg: 'bg-emerald-50',
    text: 'text-emerald-600',
  },
  project_created: {
    icon: FolderPlus,
    gradient: 'from-fuchsia-500 to-pink-500',
    bg: 'bg-fuchsia-50',
    text: 'text-fuchsia-600',
  },
};

export const ActivityFeed: React.FC<ActivityFeedProps> = ({ projectId, limit = 8 }) => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // In a real implementation, fetch activities based on projectId
    setIsLoading(false);
  }, [projectId]);

  const getRelativeTime = (date: string) => {
    const now = new Date();
    const then = new Date(date);
    const seconds = Math.floor((now.getTime() - then.getTime()) / 1000);

    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return then.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (isLoading) {
    return (
      <SectionCard
        title="Recent Activity"
        icon={<ActivityIcon className="w-4 h-4" />}
      >
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-start gap-3">
              <Skeleton className="w-8 h-8 rounded-full" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-full rounded" />
                <Skeleton className="h-3 w-1/3 rounded" />
              </div>
            </div>
          ))}
        </div>
      </SectionCard>
    );
  }

  return (
    <SectionCard
      title="Recent Activity"
      icon={<ActivityIcon className="w-4 h-4" />}
      isEmpty={activities.length === 0}
      emptyIcon={<Zap className="w-7 h-7" />}
      emptyTitle="No activity yet"
      emptySubtitle="Activity will appear here as your team works"
      action={
        activities.length > 0 && (
          <button className="text-sm font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1 transition-colors">
            View all
            <ArrowRight className="w-4 h-4" />
          </button>
        )
      }
    >
      <div className="relative">
        {/* Timeline line */}
        {activities.length > 0 && (
          <div className="absolute left-4 top-6 bottom-6 w-px bg-gradient-to-b from-slate-200 via-slate-200 to-transparent" />
        )}

        <div className="space-y-1">
          {activities.slice(0, limit).map((activity, index) => {
            const config = ACTIVITY_CONFIG[activity.type as keyof typeof ACTIVITY_CONFIG] || ACTIVITY_CONFIG.task_updated;
            const Icon = config.icon;

            return (
              <div
                key={activity.id}
                className={cn(
                  'group relative flex items-start gap-3 p-2 rounded-xl transition-all duration-200',
                  'hover:bg-slate-50/80',
                  'animate-fade-in-up'
                )}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* Icon with gradient ring */}
                <div className="relative z-10 flex-shrink-0">
                  <div className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center transition-transform duration-200',
                    'bg-white shadow-sm border border-slate-100',
                    'group-hover:scale-110'
                  )}>
                    <Icon className={cn('w-4 h-4', config.text)} />
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 py-0.5">
                  <p className="text-sm text-slate-700">
                    <span className="font-semibold text-slate-900">
                      {activity.user?.name || 'Unknown'}
                    </span>
                    {' '}
                    <span className="text-slate-500">{activity.description}</span>
                  </p>
                  <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                    <span className="inline-block w-1 h-1 rounded-full bg-slate-300" />
                    {getRelativeTime(activity.createdAt)}
                  </p>
                </div>

                {/* Avatar */}
                {activity.user && (
                  <div className="flex-shrink-0">
                    <div className={cn(
                      'w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold text-white',
                      `bg-gradient-to-br ${config.gradient}`
                    )}>
                      {getInitials(activity.user.name)}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {activities.length > limit && (
          <button className="w-full text-center pt-3 text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors">
            View all activity →
          </button>
        )}
      </div>
    </SectionCard>
  );
};
