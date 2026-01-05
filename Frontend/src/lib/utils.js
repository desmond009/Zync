import { clsx } from 'clsx';

export function cn(...inputs) {
  return clsx(inputs);
}

export const formatDate = (date) => {
  const d = new Date(date);
  const now = new Date();
  const diffMs = now - d;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export const getInitials = (name) => {
  if (!name) return '??';
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

export const getPriorityColor = (priority) => {
  const colors = {
    LOW: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    MEDIUM: 'text-amber-600 bg-amber-50 border-amber-200',
    HIGH: 'text-orange-600 bg-orange-50 border-orange-200',
    URGENT: 'text-rose-600 bg-rose-50 border-rose-200',
  };
  return colors[priority] || colors.MEDIUM;
};

export const getStatusColor = (status) => {
  const colors = {
    TODO: 'text-slate-600 bg-slate-100 border-slate-200',
    IN_PROGRESS: 'text-blue-600 bg-blue-50 border-blue-200',
    IN_REVIEW: 'text-purple-600 bg-purple-50 border-purple-200',
    DONE: 'text-emerald-600 bg-emerald-50 border-emerald-200',
  };
  return colors[status] || colors.TODO;
};

export const getDueDateColor = (dueDate) => {
  if (!dueDate) return 'text-slate-500';
  
  const now = new Date();
  const due = new Date(dueDate);
  const diffDays = Math.ceil((due - now) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return 'text-rose-600'; // Overdue
  if (diffDays === 0) return 'text-amber-600'; // Today
  if (diffDays <= 3) return 'text-orange-600'; // Soon
  return 'text-emerald-600'; // Future
};
