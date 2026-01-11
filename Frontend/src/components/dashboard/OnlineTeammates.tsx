import React, { useEffect, useState } from 'react';
import { Card } from './Card';
import { Users, Circle } from 'lucide-react';

interface TeamMember {
  id: string;
  name: string;
  avatar?: string;
  isOnline: boolean;
  currentTeam?: string;
}

interface OnlineTeammatesProps {
  limit?: number;
}

export const OnlineTeammates: React.FC<OnlineTeammatesProps> = ({ limit = 8 }) => {
  const [teammates, setTeammates] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // In a real implementation, fetch online teammates from Socket.IO
    // For now, we'll show a loading state
    setIsLoading(false);
  }, []);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  const getAvatarColor = (id: string) => {
    const colors = [
      'bg-blue-500',
      'bg-purple-500',
      'bg-pink-500',
      'bg-green-500',
      'bg-yellow-500',
      'bg-red-500',
      'bg-indigo-500',
      'bg-cyan-500',
    ];
    return colors[id.charCodeAt(0) % colors.length];
  };

  if (isLoading) {
    return (
      <Card>
        <div className="space-y-3">
          <div className="h-6 w-32 bg-slate-200 rounded animate-pulse" />
          <div className="flex gap-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="w-10 h-10 bg-slate-200 rounded-full animate-pulse" />
            ))}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <h2 className="text-lg font-semibold text-slate-900 mb-4">
        Who's Online
      </h2>

      {teammates.length === 0 ? (
        <div className="py-8 text-center">
          <Users className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-sm text-slate-500">No teammates online</p>
          <p className="text-xs text-slate-400 mt-1">Check back soon</p>
        </div>
      ) : (
        <div className="space-y-3">
          {teammates.slice(0, limit).map((teammate) => (
            <div
              key={teammate.id}
              className="flex items-center gap-3 p-2 rounded-md hover:bg-slate-50 transition-colors group cursor-pointer"
              title={`${teammate.name}${teammate.currentTeam ? ` in ${teammate.currentTeam}` : ''}`}
            >
              <div className="relative">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-xs font-semibold ${getAvatarColor(teammate.id)}`}
                >
                  {teammate.avatar || getInitials(teammate.name)}
                </div>
                {teammate.isOnline && (
                  <Circle className="w-3 h-3 bg-green-500 text-green-500 absolute -bottom-0.5 -right-0.5 rounded-full border-2 border-white" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 group-hover:text-slate-700 truncate">
                  {teammate.name}
                </p>
                {teammate.currentTeam && (
                  <p className="text-xs text-slate-500 truncate">{teammate.currentTeam}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};
