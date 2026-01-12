import React, { useEffect, useState } from 'react';
import { tasksApi, Task } from '@/lib/api';
import { SectionCard, Skeleton } from './Card';
import {
  CheckCircle2,
  Clock,
  Circle,
  ArrowRight,
  ListTodo,
  Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface MyTasksProps {
  onViewAll?: () => void;
}

const PRIORITY_STYLES = {
  urgent: {
    bg: 'bg-gradient-to-r from-rose-500/10 to-orange-500/10',
    text: 'text-rose-600',
    border: 'border-rose-200',
    dot: 'bg-rose-500',
  },
  high: {
    bg: 'bg-gradient-to-r from-orange-500/10 to-amber-500/10',
    text: 'text-orange-600',
    border: 'border-orange-200',
    dot: 'bg-orange-500',
  },
  medium: {
    bg: 'bg-gradient-to-r from-blue-500/10 to-cyan-500/10',
    text: 'text-blue-600',
    border: 'border-blue-200',
    dot: 'bg-blue-500',
  },
  low: {
    bg: 'bg-gradient-to-r from-slate-500/10 to-slate-400/10',
    text: 'text-slate-600',
    border: 'border-slate-200',
    dot: 'bg-slate-400',
  },
};

const STATUS_STYLES = {
  done: {
    icon: CheckCircle2,
    color: 'text-emerald-500',
    bg: 'bg-emerald-50',
  },
  in_progress: {
    icon: Clock,
    color: 'text-cyan-500',
    bg: 'bg-cyan-50',
  },
  todo: {
    icon: Circle,
    color: 'text-slate-300',
    bg: 'bg-slate-50',
  },
  backlog: {
    icon: Circle,
    color: 'text-slate-300',
    bg: 'bg-slate-50',
  },
  review: {
    icon: Clock,
    color: 'text-violet-500',
    bg: 'bg-violet-50',
  },
};

export const MyTasks: React.FC<MyTasksProps> = ({ onViewAll }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // In a real implementation, fetch tasks assigned to current user
    setIsLoading(false);
  }, []);

  const isUrgent = (dueDate?: string) => {
    if (!dueDate) return false;
    const days = Math.floor(
      (new Date(dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    );
    return days <= 1;
  };

  const formatDueDate = (dueDate: string) => {
    const date = new Date(dueDate);
    const now = new Date();
    const diffDays = Math.floor((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays < 7) return `${diffDays} days`;

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (isLoading) {
    return (
      <SectionCard
        title="My Tasks"
        icon={<ListTodo className="w-4 h-4" />}
      >
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-3">
              <Skeleton className="w-8 h-8 rounded-xl" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4 rounded" />
                <Skeleton className="h-3 w-1/2 rounded" />
              </div>
            </div>
          ))}
        </div>
      </SectionCard>
    );
  }

  return (
    <SectionCard
      title="My Tasks"
      icon={<ListTodo className="w-4 h-4" />}
      isEmpty={tasks.length === 0}
      emptyIcon={<Sparkles className="w-7 h-7" />}
      emptyTitle="All caught up!"
      emptySubtitle="No tasks assigned to you right now"
      action={
        tasks.length > 0 && (
          <button
            onClick={onViewAll}
            className="text-sm font-medium text-indigo-600 hover:text-indigo-700 flex items-center gap-1 transition-colors"
          >
            View all
            <ArrowRight className="w-4 h-4" />
          </button>
        )
      }
    >
      <div className="space-y-2">
        {tasks.slice(0, 6).map((task, index) => {
          const priority = task.priority || 'low';
          const status = task.status || 'todo';
          const priorityStyle = PRIORITY_STYLES[priority as keyof typeof PRIORITY_STYLES] || PRIORITY_STYLES.low;
          const statusStyle = STATUS_STYLES[status as keyof typeof STATUS_STYLES] || STATUS_STYLES.todo;
          const StatusIcon = statusStyle.icon;

          return (
            <div
              key={task.id}
              className={cn(
                'group flex items-center gap-3 p-3 rounded-xl transition-all duration-200 cursor-pointer',
                'hover:bg-slate-50/80 hover:shadow-sm',
                'animate-fade-in-up',
              )}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              {/* Status checkbox */}
              <button className={cn(
                'flex-shrink-0 w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-200',
                statusStyle.bg,
                'hover:scale-110'
              )}>
                <StatusIcon className={cn('w-4 h-4', statusStyle.color)} />
              </button>

              {/* Task content */}
              <div className="flex-1 min-w-0">
                <p className={cn(
                  'text-sm font-medium text-slate-800 truncate',
                  status === 'done' && 'line-through text-slate-400'
                )}>
                  {task.title}
                </p>
                <p className="text-xs text-slate-400 truncate mt-0.5">
                  {task.projectId ? `Project` : 'No project'}
                </p>
              </div>

              {/* Right side - Priority & Due */}
              <div className="flex items-center gap-2 flex-shrink-0">
                {task.priority && (
                  <span className={cn(
                    'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold capitalize',
                    priorityStyle.bg,
                    priorityStyle.text
                  )}>
                    <span className={cn('w-1.5 h-1.5 rounded-full', priorityStyle.dot)} />
                    {task.priority}
                  </span>
                )}

                {task.dueDate && (
                  <span className={cn(
                    'text-xs font-medium px-2 py-1 rounded-lg',
                    isUrgent(task.dueDate)
                      ? 'bg-rose-100 text-rose-700'
                      : 'bg-slate-100 text-slate-600'
                  )}>
                    {formatDueDate(task.dueDate)}
                  </span>
                )}
              </div>
            </div>
          );
        })}

        {tasks.length > 6 && (
          <button
            onClick={onViewAll}
            className="w-full text-center py-3 text-sm font-medium text-slate-500 hover:text-indigo-600 transition-colors rounded-xl hover:bg-slate-50"
          >
            View all {tasks.length} tasks →
          </button>
        )}
      </div>
    </SectionCard>
  );
};
