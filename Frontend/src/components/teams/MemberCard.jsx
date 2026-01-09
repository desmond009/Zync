import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Crown,
  Shield,
  Eye,
  Mail,
  MoreVertical,
  UserMinus,
  UserCog,
  Clock,
} from 'lucide-react';
import { Avatar, Badge, Button } from '@/components/ui';
import { cn, formatDate, getInitials } from '@/lib/utils';

export const MemberCard = ({ member, currentUserRole, onUpdateRole, onRemove }) => {
  const [showActions, setShowActions] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

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

  const statusColors = {
    ACTIVE: 'bg-green-500',
    INVITED: 'bg-yellow-500',
    PENDING: 'bg-orange-500',
    SUSPENDED: 'bg-red-500',
  };

  const RoleIcon = roleIcons[member.role] || Users;
  const canManage = ['OWNER', 'ADMIN'].includes(currentUserRole) && member.role !== 'OWNER';

  const handleRoleChange = async (newRole) => {
    setIsUpdating(true);
    try {
      await onUpdateRole(member.userId._id, newRole);
      setShowActions(false);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRemove = async () => {
    setIsUpdating(true);
    try {
      await onRemove(member.userId._id);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="group relative bg-white dark:bg-slate-800 rounded-lg p-4 hover:shadow-md transition-all duration-200 border border-slate-200 dark:border-slate-700"
    >
      <div className="flex items-center justify-between">
        {/* Member Info */}
        <div className="flex items-center space-x-3 flex-1">
          <div className="relative">
            <Avatar
              src={member.userId.avatar}
              alt={`${member.userId.firstName} ${member.userId.lastName}`}
              fallback={getInitials(`${member.userId.firstName} ${member.userId.lastName}`)}
              size="md"
            />
            {/* Online Status */}
            {member.status === 'ACTIVE' && (
              <div className={cn(
                'absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white dark:border-slate-800',
                statusColors[member.status]
              )} />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <h4 className="text-sm font-medium text-slate-900 dark:text-white truncate">
                {member.userId.firstName} {member.userId.lastName}
              </h4>
              {member.role === 'OWNER' && (
                <Crown className="w-4 h-4 text-amber-500 flex-shrink-0" />
              )}
            </div>
            <div className="flex items-center space-x-2 text-xs text-slate-500 dark:text-slate-400">
              <Mail className="w-3 h-3" />
              <span className="truncate">{member.userId.email}</span>
            </div>
            {member.lastSeenAt && (
              <div className="flex items-center space-x-1 text-xs text-slate-400 dark:text-slate-500 mt-1">
                <Clock className="w-3 h-3" />
                <span>Last seen {formatDate(member.lastSeenAt)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Role Badge */}
        <div className="flex items-center space-x-2">
          <Badge className={cn('flex items-center space-x-1', roleColors[member.role])}>
            <RoleIcon className="w-3 h-3" />
            <span className="text-xs font-medium">{member.role}</span>
          </Badge>

          {/* Actions Menu */}
          {canManage && (
            <div className="relative">
              <button
                onClick={() => setShowActions(!showActions)}
                className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors opacity-0 group-hover:opacity-100"
              >
                <MoreVertical className="w-4 h-4 text-slate-500" />
              </button>

              <AnimatePresence>
                {showActions && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 py-1 z-10"
                  >
                    {/* Change Role */}
                    {currentUserRole === 'OWNER' && member.role !== 'ADMIN' && (
                      <button
                        onClick={() => handleRoleChange('ADMIN')}
                        disabled={isUpdating}
                        className="w-full px-4 py-2 text-left text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center space-x-2"
                      >
                        <Shield className="w-4 h-4" />
                        <span>Make Admin</span>
                      </button>
                    )}
                    {currentUserRole === 'OWNER' && member.role === 'ADMIN' && (
                      <button
                        onClick={() => handleRoleChange('MEMBER')}
                        disabled={isUpdating}
                        className="w-full px-4 py-2 text-left text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center space-x-2"
                      >
                        <Users className="w-4 h-4" />
                        <span>Make Member</span>
                      </button>
                    )}
                    {member.role !== 'VIEWER' && (
                      <button
                        onClick={() => handleRoleChange('VIEWER')}
                        disabled={isUpdating}
                        className="w-full px-4 py-2 text-left text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center space-x-2"
                      >
                        <Eye className="w-4 h-4" />
                        <span>Make Viewer</span>
                      </button>
                    )}

                    {/* Remove Member */}
                    <hr className="my-1 border-slate-200 dark:border-slate-700" />
                    <button
                      onClick={handleRemove}
                      disabled={isUpdating}
                      className="w-full px-4 py-2 text-left text-sm text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 flex items-center space-x-2"
                    >
                      <UserMinus className="w-4 h-4" />
                      <span>Remove Member</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      {/* Joined Info */}
      {member.joinedAt && (
        <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-700 text-xs text-slate-400 dark:text-slate-500">
          Joined {formatDate(member.joinedAt)}
          {member.invitedBy && (
            <span> • Invited by {member.invitedBy.firstName}</span>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default MemberCard;
