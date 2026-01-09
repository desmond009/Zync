import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Mail, Shield, Users, Eye } from 'lucide-react';
import { Button, Input } from '@/components/ui';

export const InviteMemberModal = ({ isOpen, onClose, onInvite }) => {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('MEMBER');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const roles = [
    {
      value: 'ADMIN',
      label: 'Admin',
      icon: Shield,
      description: 'Can manage members, projects, and settings',
      color: 'text-blue-600 dark:text-blue-400',
    },
    {
      value: 'MEMBER',
      label: 'Member',
      icon: Users,
      description: 'Can create and manage projects',
      color: 'text-green-600 dark:text-green-400',
    },
    {
      value: 'VIEWER',
      label: 'Viewer',
      icon: Eye,
      description: 'Can only view projects and tasks',
      color: 'text-gray-600 dark:text-gray-400',
    },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email) {
      setError('Email is required');
      return;
    }

    setIsLoading(true);
    try {
      await onInvite(email, role);
      setEmail('');
      setRole('MEMBER');
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send invitation');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Invite Team Member
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Send an invitation to join your team
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Email Input */}
          <div>
            <Input
              type="email"
              label="Email Address"
              placeholder="colleague@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftIcon={<Mail className="w-4 h-4" />}
              error={error}
              autoFocus
            />
            {error && (
              <p className="mt-1 text-sm text-rose-600 dark:text-rose-400">{error}</p>
            )}
          </div>

          {/* Role Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
              Select Role
            </label>
            <div className="space-y-2">
              {roles.map((roleOption) => {
                const RoleIcon = roleOption.icon;
                return (
                  <motion.button
                    key={roleOption.value}
                    type="button"
                    onClick={() => setRole(roleOption.value)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`w-full p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                      role === roleOption.value
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <RoleIcon className={`w-5 h-5 mt-0.5 ${roleOption.color}`} />
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-slate-900 dark:text-white">
                            {roleOption.label}
                          </span>
                          {role === roleOption.value && (
                            <div className="w-5 h-5 rounded-full bg-indigo-600 flex items-center justify-center">
                              <div className="w-2 h-2 rounded-full bg-white" />
                            </div>
                          )}
                        </div>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                          {roleOption.description}
                        </p>
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={isLoading}
              className="flex-1"
            >
              Send Invitation
            </Button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default InviteMemberModal;
