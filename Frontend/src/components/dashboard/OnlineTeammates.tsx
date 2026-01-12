import React, { useEffect, useState } from 'react';
import { SectionCard, Skeleton } from './Card';
import { Users, Wifi, WifiOff } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TeamMember {
  id: string;
  name: string;
  avatar?: string;
  isOnline: boolean;
  currentTeam?: string;
  status?: 'active' | 'idle' | 'dnd';
}

interface OnlineTeammatesProps {
  limit?: number;
}

const AVATAR_GRADIENTS = [
  'from-indigo-500 to-violet-500',
  'from-cyan-500 to-blue-500',
  'from-rose-500 to-pink-500',
  'from-emerald-500 to-teal-500',
  'from-amber-500 to-orange-500',
  'from-fuchsia-500 to-purple-500',
  'from-violet-500 to-indigo-500',
  'from-blue-500 to-cyan-500',
];

const STATUS_CONFIG = {
  active: {
    color: 'bg-emerald-500',
    ring: 'ring-emerald-500/30',
    label: 'Active',
  },
  idle: {
    color: 'bg-amber-500',
    ring: 'ring-amber-500/30',
    label: 'Idle',
  },
  dnd: {
    color: 'bg-rose-500',
    ring: 'ring-rose-500/30',
    label: 'Do not disturb',
  },
};

export const OnlineTeammates: React.FC<OnlineTeammatesProps> = ({ limit = 8 }) => {
  const [teammates, setTeammates] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // In a real implementation, fetch online teammates from Socket.IO
    setIsLoading(false);
  }, []);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getAvatarGradient = (id: string) => {
    const index = id.charCodeAt(0) % AVATAR_GRADIENTS.length;
    return AVATAR_GRADIENTS[index];
  };

  if (isLoading) {
    return (
      <SectionCard
        title="Who's Online"
        icon={<Users className="w-4 h-4" />}
      >
        <div className="space-y-3">
          <div className="flex -space-x-2">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="w-10 h-10 rounded-full ring-2 ring-white" />
            ))}
          </div>
        </div>
      </SectionCard>
    );
  }

  const onlineTeammates = teammates.filter(t => t.isOnline);

  return (
    <SectionCard
      title="Who's Online"
      icon={<Wifi className="w-4 h-4" />}
      isEmpty={onlineTeammates.length === 0}
      emptyIcon={<WifiOff className="w-7 h-7" />}
      emptyTitle="No one online"
      emptySubtitle="Your teammates are currently offline"
    >
      <div className="space-y-4">
        {/* Stacked avatars preview */}
        {onlineTeammates.length > 0 && (
          <div className="flex items-center">
            <div className="flex -space-x-3">
              {onlineTeammates.slice(0, 5).map((teammate, index) => (
                <div
                  key={teammate.id}
                  className="relative group"
                  style={{ zIndex: 10 - index }}
                >
                  <div className={cn(
                    'w-10 h-10 rounded-full ring-2 ring-white flex items-center justify-center',
                    'text-white text-xs font-semibold',
                    'transition-all duration-200',
                    'group-hover:ring-4 group-hover:scale-110 group-hover:z-20',
                    `bg-gradient-to-br ${getAvatarGradient(teammate.id)}`
                  )}>
                    {teammate.avatar || getInitials(teammate.name)}
                  </div>

                  {/* Online indicator */}
                  <span className={cn(
                    'absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white',
                    STATUS_CONFIG[teammate.status || 'active'].color,
                    'animate-glow-pulse'
                  )} />

                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2.5 py-1.5 bg-slate-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-lg">
                    {teammate.name}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-slate-900" />
                  </div>
                </div>
              ))}

              {onlineTeammates.length > 5 && (
                <div className="w-10 h-10 rounded-full ring-2 ring-white bg-slate-100 flex items-center justify-center text-xs font-semibold text-slate-600">
                  +{onlineTeammates.length - 5}
                </div>
              )}
            </div>

            <span className="ml-4 text-sm text-slate-500">
              {onlineTeammates.length} online
            </span>
          </div>
        )}

        {/* Full list */}
        {onlineTeammates.length > 0 && (
          <div className="space-y-1 pt-2 border-t border-slate-100">
            {onlineTeammates.slice(0, limit).map((teammate, index) => {
              const status = teammate.status || 'active';
              const statusConfig = STATUS_CONFIG[status];

              return (
                <div
                  key={teammate.id}
                  className={cn(
                    'flex items-center gap-3 p-2 rounded-xl',
                    'transition-all duration-200',
                    'hover:bg-slate-50 cursor-pointer group',
                    'animate-fade-in-up'
                  )}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {/* Avatar */}
                  <div className="relative">
                    <div className={cn(
                      'w-9 h-9 rounded-full flex items-center justify-center',
                      'text-white text-xs font-semibold',
                      'transition-transform duration-200 group-hover:scale-105',
                      `bg-gradient-to-br ${getAvatarGradient(teammate.id)}`
                    )}>
                      {teammate.avatar || getInitials(teammate.name)}
                    </div>
                    <span className={cn(
                      'absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white',
                      statusConfig.color
                    )} />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">
                      {teammate.name}
                    </p>
                    <p className="text-xs text-slate-400 truncate">
                      {statusConfig.label}
                      {teammate.currentTeam && ` • ${teammate.currentTeam}`}
                    </p>
                  </div>

                  {/* Status dot */}
                  <div className={cn(
                    'w-2 h-2 rounded-full',
                    statusConfig.color,
                    status === 'active' && 'animate-glow-pulse'
                  )} />
                </div>
              );
            })}
          </div>
        )}
      </div>
    </SectionCard>
  );
};
