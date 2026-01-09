import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Save,
  Trash2,
  AlertTriangle,
  RefreshCw,
  Settings as SettingsIcon,
  Shield,
  Users,
} from 'lucide-react';
import { Button, Input } from '@/components/ui';
import { useTeamStore } from '@/store/teamStore';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

export const TeamSettings = ({ team }) => {
  const navigate = useNavigate();
  const { updateTeam, updateTeamSettings, deleteTeam, transferOwnership, teamMembers } =
    useTeamStore();

  const [formData, setFormData] = useState({
    name: team.name || '',
    description: team.description || '',
    avatar: team.avatar || '',
  });

  const [settings, setSettings] = useState({
    allowMemberInvite: team.settings?.allowMemberInvite || false,
    requireApproval: team.settings?.requireApproval || true,
    defaultRole: team.settings?.defaultRole || 'MEMBER',
  });

  const [isUpdating, setIsUpdating] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  const handleUpdateTeam = async () => {
    setIsUpdating(true);
    try {
      await updateTeam(team._id, formData);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpdateSettings = async () => {
    setIsUpdating(true);
    try {
      await updateTeamSettings(team._id, settings);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteTeam = async () => {
    if (deleteConfirmText !== team.name) {
      return;
    }
    await deleteTeam(team._id);
    navigate('/teams');
  };

  const eligibleMembers = teamMembers.filter(
    (m) => m.role !== 'OWNER' && m.status === 'ACTIVE'
  );

  return (
    <div className="space-y-6">
      {/* General Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700"
      >
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
            <SettingsIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              General Settings
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Update your team information
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <Input
            label="Team Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            maxLength={50}
          />

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              maxLength={500}
              className="w-full px-4 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 resize-none"
            />
          </div>

          <Input
            label="Avatar URL"
            type="url"
            value={formData.avatar}
            onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
          />

          <Button
            variant="primary"
            onClick={handleUpdateTeam}
            isLoading={isUpdating}
            leftIcon={<Save className="w-4 h-4" />}
          >
            Save Changes
          </Button>
        </div>
      </motion.div>

      {/* Team Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700"
      >
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
            <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              Access & Permissions
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Control who can invite members and default roles
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Allow Member Invite */}
          <div className="flex items-center justify-between p-4 rounded-lg border border-slate-200 dark:border-slate-700">
            <div>
              <h3 className="font-medium text-slate-900 dark:text-white">
                Allow Members to Invite
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Let regular members invite others to the team
              </p>
            </div>
            <button
              onClick={() =>
                setSettings({ ...settings, allowMemberInvite: !settings.allowMemberInvite })
              }
              className={cn(
                'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                settings.allowMemberInvite ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-600'
              )}
            >
              <span
                className={cn(
                  'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                  settings.allowMemberInvite ? 'translate-x-6' : 'translate-x-1'
                )}
              />
            </button>
          </div>

          {/* Require Approval */}
          <div className="flex items-center justify-between p-4 rounded-lg border border-slate-200 dark:border-slate-700">
            <div>
              <h3 className="font-medium text-slate-900 dark:text-white">
                Require Approval
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                New members need approval before joining
              </p>
            </div>
            <button
              onClick={() =>
                setSettings({ ...settings, requireApproval: !settings.requireApproval })
              }
              className={cn(
                'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                settings.requireApproval ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-600'
              )}
            >
              <span
                className={cn(
                  'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                  settings.requireApproval ? 'translate-x-6' : 'translate-x-1'
                )}
              />
            </button>
          </div>

          {/* Default Role */}
          <div className="p-4 rounded-lg border border-slate-200 dark:border-slate-700">
            <h3 className="font-medium text-slate-900 dark:text-white mb-3">
              Default Member Role
            </h3>
            <div className="flex space-x-3">
              {['MEMBER', 'VIEWER'].map((role) => (
                <button
                  key={role}
                  onClick={() => setSettings({ ...settings, defaultRole: role })}
                  className={cn(
                    'flex-1 px-4 py-2 rounded-lg border-2 transition-all',
                    settings.defaultRole === role
                      ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300'
                      : 'border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                  )}
                >
                  <Users className="w-4 h-4 mx-auto mb-1" />
                  <div className="text-sm font-medium">{role}</div>
                </button>
              ))}
            </div>
          </div>

          <Button
            variant="primary"
            onClick={handleUpdateSettings}
            isLoading={isUpdating}
            leftIcon={<Save className="w-4 h-4" />}
          >
            Update Settings
          </Button>
        </div>
      </motion.div>

      {/* Danger Zone */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white dark:bg-slate-800 rounded-xl p-6 border-2 border-rose-200 dark:border-rose-900"
      >
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-rose-600 dark:text-rose-400">
              Danger Zone
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Irreversible and destructive actions
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {/* Delete Team */}
          {!showDeleteConfirm ? (
            <Button
              variant="danger"
              onClick={() => setShowDeleteConfirm(true)}
              leftIcon={<Trash2 className="w-4 h-4" />}
            >
              Delete Team
            </Button>
          ) : (
            <div className="space-y-3 p-4 bg-rose-50 dark:bg-rose-900/20 rounded-lg border border-rose-200 dark:border-rose-800">
              <p className="text-sm text-rose-800 dark:text-rose-200 font-medium">
                This action cannot be undone. Type <strong>{team.name}</strong> to confirm.
              </p>
              <Input
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder={team.name}
              />
              <div className="flex space-x-2">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setDeleteConfirmText('');
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  variant="danger"
                  onClick={handleDeleteTeam}
                  disabled={deleteConfirmText !== team.name}
                  className="flex-1"
                >
                  Permanently Delete
                </Button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default TeamSettings;
