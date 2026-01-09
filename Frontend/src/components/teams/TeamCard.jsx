import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Users, 
  Crown, 
  Shield, 
  Eye, 
  MoreVertical,
  Settings,
  LogOut,
  Trash2
} from 'lucide-react';
import { Badge, Avatar } from '@/components/ui';
import { cn, formatDate, getInitials } from '@/lib/utils';

export const TeamCard = ({ team, userRole, onLeave, onSettings, onDelete }) => {
  const roleIcons = {
    OWNER: Crown,
    ADMIN: Shield,
    MEMBER: Users,
    VIEWER: Eye,
  };

  const roleColors = {
    OWNER: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
    ADMIN: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    MEMBER: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    VIEWER: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
  };

  const RoleIcon = roleIcons[userRole] || Users;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      className="group relative bg-white dark:bg-slate-800 rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-200 dark:border-slate-700 overflow-hidden"
    >
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <Link to={`/teams/${team._id}`} className="block p-6 relative">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            {team.avatar ? (
              <img
                src={team.avatar}
                alt={team.name}
                className="w-12 h-12 rounded-lg object-cover"
              />
            ) : (
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                {getInitials(team.name)}
              </div>
            )}
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                {team.name}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {team.memberCount || 0} members
              </p>
            </div>
          </div>

          <Badge className={cn('flex items-center space-x-1', roleColors[userRole])}>
            <RoleIcon className="w-3 h-3" />
            <span className="text-xs font-medium">{userRole}</span>
          </Badge>
        </div>

        {/* Description */}
        {team.description && (
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 line-clamp-2">
            {team.description}
          </p>
        )}

        {/* Stats */}
        <div className="flex items-center space-x-4 text-sm text-slate-500 dark:text-slate-400">
          <div className="flex items-center space-x-1">
            <Users className="w-4 h-4" />
            <span>{team.memberCount || 0}</span>
          </div>
          <div>•</div>
          <div>Created {formatDate(team.createdAt)}</div>
        </div>
      </Link>

      {/* Actions Menu (Owner/Admin only) */}
      {(userRole === 'OWNER' || userRole === 'ADMIN') && (
        <div className="absolute top-4 right-4">
          <button
            onClick={(e) => {
              e.preventDefault();
              // Show dropdown menu
            }}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors opacity-0 group-hover:opacity-100"
          >
            <MoreVertical className="w-4 h-4 text-slate-500" />
          </button>
        </div>
      )}
    </motion.div>
  );
};

export default TeamCard;
