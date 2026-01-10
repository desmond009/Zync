import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  MoreVertical,
  Calendar,
  AlertCircle,
  CheckCircle,
  Clock,
  User,
  Tag,
  MessageSquare,
  Paperclip,
} from 'lucide-react';
import { Avatar, Badge, Button } from '@/components/ui';
import { useTaskStore } from '@/store/taskStore';
import { getInitials, cn } from '@/lib/utils';
import { format } from 'date-fns';

const priorityConfig = {
  URGENT: { color: 'text-rose-600', bg: 'bg-rose-100 dark:bg-rose-900/30', icon: AlertCircle },
  HIGH: { color: 'text-orange-600', bg: 'bg-orange-100 dark:bg-orange-900/30', icon: AlertCircle },
  MEDIUM: { color: 'text-amber-600', bg: 'bg-amber-100 dark:bg-amber-900/30', icon: Clock },
  LOW: { color: 'text-blue-600', bg: 'bg-blue-100 dark:bg-blue-900/30', icon: Clock },
};

const COLUMNS = [
  { id: 'TODO', title: 'To Do', color: 'bg-slate-100 dark:bg-slate-800' },
  { id: 'IN_PROGRESS', title: 'In Progress', color: 'bg-blue-100 dark:bg-blue-900/30' },
  { id: 'REVIEW', title: 'Review', color: 'bg-amber-100 dark:bg-amber-900/30' },
  { id: 'DONE', title: 'Done', color: 'bg-green-100 dark:bg-green-900/30' },
];

const TaskCard = ({ task, onTaskClick }) => {
  const PriorityIcon = priorityConfig[task.priority]?.icon || Clock;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ scale: 1.02 }}
      onClick={() => onTaskClick(task)}
      className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 cursor-pointer hover:shadow-md transition-shadow"
    >
      {/* Task Header */}
      <div className="flex items-start justify-between mb-2">
        <h3 className="text-sm font-medium text-slate-900 dark:text-white flex-1 line-clamp-2">
          {task.title}
        </h3>
        <button className="flex-shrink-0 p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
          <MoreVertical className="w-3 h-3 text-slate-400" />
        </button>
      </div>

      {/* Task Description */}
      {task.description && (
        <p className="text-xs text-slate-600 dark:text-slate-400 mb-3 line-clamp-2">
          {task.description}
        </p>
      )}

      {/* Task Meta */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {/* Priority */}
          <span
            className={cn(
              'inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium',
              priorityConfig[task.priority]?.bg,
              priorityConfig[task.priority]?.color
            )}
          >
            <PriorityIcon className="w-3 h-3" />
          </span>

          {/* Due Date */}
          {task.dueDate && (
            <span className="flex items-center gap-1 text-xs text-slate-600 dark:text-slate-400">
              <Calendar className="w-3 h-3" />
              {format(new Date(task.dueDate), 'MMM d')}
            </span>
          )}

          {/* Comments Count */}
          {task.commentsCount > 0 && (
            <span className="flex items-center gap-1 text-xs text-slate-600 dark:text-slate-400">
              <MessageSquare className="w-3 h-3" />
              {task.commentsCount}
            </span>
          )}

          {/* Attachments Count */}
          {task.attachmentsCount > 0 && (
            <span className="flex items-center gap-1 text-xs text-slate-600 dark:text-slate-400">
              <Paperclip className="w-3 h-3" />
              {task.attachmentsCount}
            </span>
          )}
        </div>

        {/* Assignee */}
        {task.assignee && (
          <Avatar
            src={task.assignee.avatar}
            fallback={getInitials(task.assignee.name)}
            size="sm"
            className="w-6 h-6"
            title={task.assignee.name}
          />
        )}
      </div>

      {/* Tags */}
      {task.tags && task.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {task.tags.slice(0, 2).map((tag, index) => (
            <span
              key={index}
              className="inline-flex items-center gap-1 px-1.5 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 rounded text-xs"
            >
              <Tag className="w-2.5 h-2.5" />
              {tag}
            </span>
          ))}
          {task.tags.length > 2 && (
            <span className="text-xs text-slate-500 dark:text-slate-400">
              +{task.tags.length - 2}
            </span>
          )}
        </div>
      )}
    </motion.div>
  );
};

const KanbanColumn = ({ column, tasks, onAddTask, onTaskClick }) => {
  return (
    <div className="flex flex-col h-full min-w-[280px] max-w-[320px]">
      {/* Column Header */}
      <div className="flex-shrink-0 flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={cn('w-2 h-2 rounded-full', column.color.replace('bg-', 'bg-'))}></div>
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white">
            {column.title}
          </h2>
          <Badge variant="secondary" className="text-xs">
            {tasks.length}
          </Badge>
        </div>
        <button
          onClick={() => onAddTask(column.id)}
          className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
        >
          <Plus className="w-4 h-4 text-slate-600 dark:text-slate-400" />
        </button>
      </div>

      {/* Tasks */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1">
        <AnimatePresence>
          {tasks.map((task) => (
            <TaskCard key={task._id} task={task} onTaskClick={onTaskClick} />
          ))}
        </AnimatePresence>

        {/* Empty State */}
        {tasks.length === 0 && (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <CheckCircle className="w-8 h-8 text-slate-300 dark:text-slate-600 mb-2" />
            <p className="text-sm text-slate-500 dark:text-slate-400">No tasks</p>
          </div>
        )}
      </div>
    </div>
  );
};

export const KanbanBoard = ({ projectId }) => {
  const { tasks, fetchTasks, isLoading } = useTaskStore();
  const [selectedTask, setSelectedTask] = useState(null);

  useEffect(() => {
    if (projectId) {
      fetchTasks({ projectId });
    }
  }, [projectId]);

  const getTasksByStatus = (status) => {
    return Array.isArray(tasks) ? tasks.filter((task) => task.status === status) : [];
  };

  const handleAddTask = (status) => {
    // TODO: Open create task modal with pre-filled status
    console.log('Add task to', status);
  };

  const handleTaskClick = (task) => {
    setSelectedTask(task);
    // TODO: Open task detail modal
    console.log('Task clicked', task);
  };

  return (
    <div className="h-full flex flex-col bg-slate-50 dark:bg-slate-900">
      {/* Kanban Container */}
      <div className="flex-1 overflow-x-auto">
        <div className="h-full p-6">
          <div className="flex gap-4 h-full">
            {COLUMNS.map((column) => (
              <KanbanColumn
                key={column.id}
                column={column}
                tasks={getTasksByStatus(column.id)}
                onAddTask={handleAddTask}
                onTaskClick={handleTaskClick}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="absolute inset-0 bg-white/50 dark:bg-slate-900/50 flex items-center justify-center">
          <div className="text-sm text-slate-600 dark:text-slate-400">Loading tasks...</div>
        </div>
      )}
    </div>
  );
};
