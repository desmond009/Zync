import React, { useEffect, useState } from 'react';
import { tasksApi, Task } from '@/lib/api';
import { Card } from './Card';
import { AlertCircle, CheckCircle2, Clock } from 'lucide-react';

interface MyTasksProps {
  onViewAll?: () => void;
}

export const MyTasks: React.FC<MyTasksProps> = ({ onViewAll }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // In a real implementation, fetch tasks assigned to current user
    // For now, we'll show a loading state
    setIsLoading(false);
  }, []);

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-700';
      case 'high':
        return 'bg-orange-100 text-orange-700';
      case 'medium':
        return 'bg-blue-100 text-blue-700';
      case 'low':
        return 'bg-slate-100 text-slate-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'done':
        return <CheckCircle2 className="w-4 h-4 text-green-600" />;
      case 'in_progress':
        return <Clock className="w-4 h-4 text-blue-600" />;
      default:
        return <AlertCircle className="w-4 h-4 text-slate-400" />;
    }
  };

  const isUrgent = (dueDate?: string) => {
    if (!dueDate) return false;
    const days = Math.floor(
      (new Date(dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
    );
    return days <= 1;
  };

  if (isLoading) {
    return (
      <Card>
        <div className="space-y-4">
          <div className="h-6 w-24 bg-slate-200 rounded animate-pulse" />
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-12 bg-slate-100 rounded animate-pulse" />
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-slate-900">My Tasks</h2>
        {tasks.length > 0 && (
          <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2 py-1 rounded">
            {tasks.length}
          </span>
        )}
      </div>

      {tasks.length === 0 ? (
        <div className="py-8 text-center">
          <CheckCircle2 className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-sm text-slate-500">No tasks assigned to you</p>
          <p className="text-xs text-slate-400 mt-1">Great work! You're all caught up.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tasks.slice(0, 6).map((task) => (
            <div
              key={task.id}
              className="flex items-start justify-between p-3 rounded-md hover:bg-slate-50 transition-colors cursor-pointer group"
            >
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <div className="mt-1">{getStatusIcon(task.status)}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate group-hover:text-slate-700">
                    {task.title}
                  </p>
                  <p className="text-xs text-slate-500 truncate">
                    {task.projectId ? `Project ${task.projectId}` : 'No project'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 ml-2 flex-shrink-0">
                {task.priority && (
                  <span className={`text-xs font-medium px-2 py-1 rounded whitespace-nowrap ${getPriorityColor(task.priority)}`}>
                    {task.priority}
                  </span>
                )}
                {task.dueDate && (
                  <span
                    className={`text-xs whitespace-nowrap ${
                      isUrgent(task.dueDate)
                        ? 'text-red-600 font-semibold'
                        : 'text-slate-500'
                    }`}
                  >
                    {new Date(task.dueDate).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                )}
              </div>
            </div>
          ))}

          {tasks.length > 6 && (
            <button
              onClick={onViewAll}
              className="w-full text-center pt-3 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
            >
              View all {tasks.length} tasks →
            </button>
          )}
        </div>
      )}
    </Card>
  );
};
