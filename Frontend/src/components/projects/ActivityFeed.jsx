import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle,
  FileText,
  MessageSquare,
  UserPlus,
  UserMinus,
  Edit3,
  Trash2,
  Upload,
  Download,
  Tag,
  Calendar,
  AlertCircle,
  GitBranch,
} from 'lucide-react';
import { Avatar } from '@/components/ui';
import { getInitials, cn } from '@/lib/utils';
import { formatDistanceToNow, format, isToday, isYesterday } from 'date-fns';

const activityIcons = {
  TASK_CREATED: { icon: FileText, color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30' },
  TASK_COMPLETED: { icon: CheckCircle, color: 'text-green-600 bg-green-100 dark:bg-green-900/30' },
  TASK_UPDATED: { icon: Edit3, color: 'text-amber-600 bg-amber-100 dark:bg-amber-900/30' },
  TASK_DELETED: { icon: Trash2, color: 'text-rose-600 bg-rose-100 dark:bg-rose-900/30' },
  COMMENT_ADDED: { icon: MessageSquare, color: 'text-purple-600 bg-purple-100 dark:bg-purple-900/30' },
  MEMBER_ADDED: { icon: UserPlus, color: 'text-green-600 bg-green-100 dark:bg-green-900/30' },
  MEMBER_REMOVED: { icon: UserMinus, color: 'text-rose-600 bg-rose-100 dark:bg-rose-900/30' },
  FILE_UPLOADED: { icon: Upload, color: 'text-indigo-600 bg-indigo-100 dark:bg-indigo-900/30' },
  FILE_DOWNLOADED: { icon: Download, color: 'text-slate-600 bg-slate-100 dark:bg-slate-900/30' },
  TAG_ADDED: { icon: Tag, color: 'text-cyan-600 bg-cyan-100 dark:bg-cyan-900/30' },
  DUE_DATE_CHANGED: { icon: Calendar, color: 'text-orange-600 bg-orange-100 dark:bg-orange-900/30' },
  PRIORITY_CHANGED: { icon: AlertCircle, color: 'text-red-600 bg-red-100 dark:bg-red-900/30' },
  STATUS_CHANGED: { icon: GitBranch, color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30' },
};

const formatActivityTime = (date) => {
  const activityDate = new Date(date);
  if (isToday(activityDate)) {
    return `Today at ${format(activityDate, 'HH:mm')}`;
  } else if (isYesterday(activityDate)) {
    return `Yesterday at ${format(activityDate, 'HH:mm')}`;
  } else {
    return format(activityDate, 'MMM d, yyyy \'at\' HH:mm');
  }
};

const ActivityItem = ({ activity }) => {
  const config = activityIcons[activity.type] || activityIcons.TASK_UPDATED;
  const Icon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex gap-4 group"
    >
      {/* Timeline Line */}
      <div className="flex flex-col items-center">
        <div className={cn('p-2 rounded-lg', config.color)}>
          <Icon className="w-4 h-4" />
        </div>
        <div className="flex-1 w-px bg-slate-200 dark:bg-slate-700 mt-2"></div>
      </div>

      {/* Activity Content */}
      <div className="flex-1 pb-8">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <Avatar
                src={activity.user.avatar}
                fallback={getInitials(activity.user.name)}
                size="sm"
                className="w-6 h-6"
              />
              <span className="text-sm font-medium text-slate-900 dark:text-white">
                {activity.user.name}
              </span>
              <span className="text-sm text-slate-600 dark:text-slate-400">
                {activity.action}
              </span>
            </div>

            {/* Activity Details */}
            {activity.details && (
              <div className="mt-2 text-sm text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 rounded-lg p-3 border border-slate-200 dark:border-slate-700">
                {activity.details}
              </div>
            )}

            {/* Activity Metadata */}
            {activity.metadata && (
              <div className="mt-2 flex flex-wrap gap-2">
                {activity.metadata.oldValue && (
                  <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300">
                    <span className="line-through">{activity.metadata.oldValue}</span>
                  </span>
                )}
                {activity.metadata.newValue && (
                  <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">
                    {activity.metadata.newValue}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Timestamp */}
          <span className="text-xs text-slate-500 dark:text-slate-400 flex-shrink-0 ml-4">
            {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
          </span>
        </div>
      </div>
    </motion.div>
  );
};

const DateDivider = ({ date }) => {
  const dateObj = new Date(date);
  let label;

  if (isToday(dateObj)) {
    label = 'Today';
  } else if (isYesterday(dateObj)) {
    label = 'Yesterday';
  } else {
    label = format(dateObj, 'MMMM d, yyyy');
  }

  return (
    <div className="flex items-center gap-4 py-4">
      <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700"></div>
      <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
        {label}
      </span>
      <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700"></div>
    </div>
  );
};

export const ActivityFeed = ({ projectId }) => {
  const [activities, setActivities] = useState([
    // Mock data
    {
      _id: '1',
      type: 'TASK_COMPLETED',
      user: {
        _id: 'user1',
        name: 'Sarah Johnson',
        avatar: null,
      },
      action: 'completed',
      details: 'Design system documentation',
      createdAt: new Date(Date.now() - 1800000).toISOString(),
    },
    {
      _id: '2',
      type: 'COMMENT_ADDED',
      user: {
        _id: 'user2',
        name: 'Mike Chen',
        avatar: null,
      },
      action: 'commented on',
      details: 'Looking good! Can we add more spacing between the buttons?',
      createdAt: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      _id: '3',
      type: 'STATUS_CHANGED',
      user: {
        _id: 'user1',
        name: 'Sarah Johnson',
        avatar: null,
      },
      action: 'changed status',
      metadata: {
        oldValue: 'In Progress',
        newValue: 'Review',
      },
      createdAt: new Date(Date.now() - 7200000).toISOString(),
    },
    {
      _id: '4',
      type: 'MEMBER_ADDED',
      user: {
        _id: 'user3',
        name: 'Alex Rivera',
        avatar: null,
      },
      action: 'added',
      details: 'Emma Watson to the project',
      createdAt: new Date(Date.now() - 86400000).toISOString(),
    },
    {
      _id: '5',
      type: 'TASK_CREATED',
      user: {
        _id: 'user2',
        name: 'Mike Chen',
        avatar: null,
      },
      action: 'created',
      details: 'Implement authentication flow',
      createdAt: new Date(Date.now() - 172800000).toISOString(),
    },
    {
      _id: '6',
      type: 'PRIORITY_CHANGED',
      user: {
        _id: 'user1',
        name: 'Sarah Johnson',
        avatar: null,
      },
      action: 'changed priority',
      metadata: {
        oldValue: 'Medium',
        newValue: 'High',
      },
      createdAt: new Date(Date.now() - 172800000).toISOString(),
    },
  ]);

  const [filter, setFilter] = useState('ALL');

  const filters = [
    { id: 'ALL', label: 'All Activity' },
    { id: 'TASKS', label: 'Tasks' },
    { id: 'COMMENTS', label: 'Comments' },
    { id: 'MEMBERS', label: 'Members' },
    { id: 'FILES', label: 'Files' },
  ];

  const groupActivitiesByDate = () => {
    const grouped = {};

    activities.forEach((activity) => {
      const dateKey = format(new Date(activity.createdAt), 'yyyy-MM-dd');
      if (!grouped[dateKey]) {
        grouped[dateKey] = [];
      }
      grouped[dateKey].push(activity);
    });

    return Object.entries(grouped).sort((a, b) => new Date(b[0]) - new Date(a[0]));
  };

  const groupedActivities = groupActivitiesByDate();

  return (
    <div className="h-full flex flex-col bg-slate-50 dark:bg-slate-900">
      {/* Filter Bar */}
      <div className="flex-shrink-0 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
            Activity Feed
          </h2>
          
          <div className="flex items-center gap-2">
            {filters.map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                  filter === f.id
                    ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Activity Timeline */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        <div className="max-w-3xl mx-auto">
          {groupedActivities.map(([date, dateActivities]) => (
            <div key={date}>
              <DateDivider date={date} />
              <div>
                {dateActivities.map((activity, index) => (
                  <ActivityItem key={activity._id} activity={activity} />
                ))}
              </div>
            </div>
          ))}

          {activities.length === 0 && (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
              <p className="text-slate-600 dark:text-slate-400 text-sm">
                No activity yet
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
