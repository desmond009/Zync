import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, LogIn, Hash } from 'lucide-react';
import { Button, Input } from '@/components/ui';

export const JoinTeamModal = ({ isOpen, onClose, onJoin }) => {
  const [inviteCode, setInviteCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const code = inviteCode.trim().toUpperCase();
    if (!code) {
      setError('Invite code is required');
      return;
    }

    if (code.length !== 8) {
      setError('Invite code must be 8 characters');
      return;
    }

    setIsLoading(true);
    try {
      await onJoin(code);
      setInviteCode('');
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid invite code');
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
              Join Team
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Enter the 8-character invite code
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
          <div>
            <Input
              type="text"
              label="Invite Code"
              placeholder="AB12CD34"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
              leftIcon={<Hash className="w-4 h-4" />}
              maxLength={8}
              autoFocus
              className="font-mono text-lg tracking-wider"
            />
            {error && (
              <p className="mt-2 text-sm text-rose-600 dark:text-rose-400">{error}</p>
            )}
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
              Ask your team admin for an invite code
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-3">
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
              leftIcon={<LogIn className="w-4 h-4" />}
              className="flex-1"
            >
              Join Team
            </Button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default JoinTeamModal;
