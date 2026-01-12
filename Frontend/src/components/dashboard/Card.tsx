import React from 'react';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
  gradient?: 'aurora' | 'ocean' | 'sunset' | 'emerald' | 'none';
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  onClick,
  hoverable = false,
  gradient = 'none'
}) => {
  return (
    <div
      onClick={onClick}
      className={cn(
        'relative bg-white/80 backdrop-blur-xl rounded-2xl border border-white/20',
        'p-6 transition-all duration-300 ease-out',
        'shadow-[0_8px_32px_rgba(0,0,0,0.08)]',
        hoverable && onClick && 'cursor-pointer hover:shadow-[0_20px_50px_rgba(0,0,0,0.12)] hover:-translate-y-1',
        gradient !== 'none' && 'overflow-hidden',
        className
      )}
    >
      {/* Gradient border effect */}
      {gradient !== 'none' && (
        <div
          className={cn(
            'absolute inset-0 opacity-0 transition-opacity duration-300 rounded-2xl',
            hoverable && 'group-hover:opacity-100',
            gradient === 'aurora' && 'bg-gradient-to-br from-indigo-500/20 via-violet-500/20 to-fuchsia-500/20',
            gradient === 'ocean' && 'bg-gradient-to-br from-cyan-500/20 to-blue-500/20',
            gradient === 'sunset' && 'bg-gradient-to-br from-orange-500/20 to-rose-500/20',
            gradient === 'emerald' && 'bg-gradient-to-br from-emerald-500/20 to-cyan-500/20',
          )}
        />
      )}
      <div className="relative z-10">{children}</div>
    </div>
  );
};

// Gradient configurations for stat cards
const STAT_CARD_STYLES = {
  projects: {
    gradient: 'from-indigo-500 to-violet-500',
    bgGradient: 'from-indigo-500/10 to-violet-500/10',
    iconBg: 'bg-gradient-to-br from-indigo-500 to-violet-500',
    textColor: 'text-indigo-600',
  },
  tasks: {
    gradient: 'from-cyan-500 to-blue-500',
    bgGradient: 'from-cyan-500/10 to-blue-500/10',
    iconBg: 'bg-gradient-to-br from-cyan-500 to-blue-500',
    textColor: 'text-cyan-600',
  },
  due: {
    gradient: 'from-orange-500 to-rose-500',
    bgGradient: 'from-orange-500/10 to-rose-500/10',
    iconBg: 'bg-gradient-to-br from-orange-500 to-rose-500',
    textColor: 'text-orange-600',
  },
  online: {
    gradient: 'from-emerald-500 to-cyan-500',
    bgGradient: 'from-emerald-500/10 to-cyan-500/10',
    iconBg: 'bg-gradient-to-br from-emerald-500 to-cyan-500',
    textColor: 'text-emerald-600',
  },
};

interface StatCardProps {
  label: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  isLoading?: boolean;
  variant?: 'projects' | 'tasks' | 'due' | 'online';
  trend?: { value: number; isPositive: boolean };
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  subtitle,
  icon,
  onClick,
  isLoading = false,
  variant = 'projects',
  trend,
}) => {
  const styles = STAT_CARD_STYLES[variant];

  return (
    <div
      onClick={onClick}
      className={cn(
        'group relative overflow-hidden rounded-2xl p-5',
        'bg-white/70 backdrop-blur-xl border border-white/30',
        'shadow-[0_8px_32px_rgba(0,0,0,0.06)]',
        'transition-all duration-300 ease-out',
        onClick && 'cursor-pointer hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] hover:-translate-y-1 hover:border-white/50'
      )}
    >
      {/* Animated gradient background on hover */}
      <div className={cn(
        'absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity duration-500',
        styles.bgGradient,
        'group-hover:opacity-100'
      )} />

      {/* Decorative blur circle */}
      <div className={cn(
        'absolute -right-6 -top-6 w-24 h-24 rounded-full blur-2xl opacity-30 transition-all duration-500',
        `bg-gradient-to-br ${styles.gradient}`,
        'group-hover:opacity-50 group-hover:scale-125'
      )} />

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-3">
          <div className={cn(
            'p-2.5 rounded-xl shadow-lg transition-transform duration-300',
            styles.iconBg,
            'group-hover:scale-110 group-hover:shadow-xl'
          )}>
            <div className="text-white w-5 h-5">
              {icon}
            </div>
          </div>

          {trend && (
            <div className={cn(
              'flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full',
              trend.isPositive
                ? 'bg-emerald-100 text-emerald-700'
                : 'bg-rose-100 text-rose-700'
            )}>
              <span>{trend.isPositive ? '↑' : '↓'}</span>
              <span>{Math.abs(trend.value)}%</span>
            </div>
          )}
        </div>

        <div className="space-y-1">
          <p className="text-sm font-medium text-slate-500">{label}</p>
          {isLoading ? (
            <div className="h-9 w-20 rounded-lg animate-shimmer" />
          ) : (
            <p className={cn(
              'text-3xl font-bold font-display tracking-tight',
              styles.textColor
            )}>
              {value}
            </p>
          )}
          {subtitle && (
            <p className="text-xs text-slate-400 font-medium">{subtitle}</p>
          )}
        </div>
      </div>
    </div>
  );
};

// Premium section card with header
interface SectionCardProps {
  title: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  isEmpty?: boolean;
  emptyIcon?: React.ReactNode;
  emptyTitle?: string;
  emptySubtitle?: string;
}

export const SectionCard: React.FC<SectionCardProps> = ({
  title,
  icon,
  action,
  children,
  className,
  isEmpty = false,
  emptyIcon,
  emptyTitle,
  emptySubtitle,
}) => {
  return (
    <div className={cn(
      'bg-white/70 backdrop-blur-xl rounded-2xl border border-white/30',
      'shadow-[0_8px_32px_rgba(0,0,0,0.06)]',
      'overflow-hidden',
      className
    )}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100/50">
        <div className="flex items-center gap-3">
          {icon && (
            <div className="p-2 rounded-lg bg-gradient-to-br from-indigo-500/10 to-violet-500/10">
              <div className="text-indigo-600 w-4 h-4">
                {icon}
              </div>
            </div>
          )}
          <h2 className="text-base font-semibold font-display text-slate-800">{title}</h2>
        </div>
        {action}
      </div>

      {/* Content */}
      <div className="p-5">
        {isEmpty ? (
          <div className="py-10 text-center">
            {emptyIcon && (
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-slate-100/80 text-slate-300 mb-4">
                {emptyIcon}
              </div>
            )}
            <p className="text-sm font-medium text-slate-500">{emptyTitle || 'Nothing here yet'}</p>
            {emptySubtitle && (
              <p className="text-xs text-slate-400 mt-1">{emptySubtitle}</p>
            )}
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
};

// Shimmer loading skeleton
interface SkeletonProps {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className }) => {
  return (
    <div className={cn(
      'rounded-lg animate-shimmer',
      className
    )} />
  );
};
