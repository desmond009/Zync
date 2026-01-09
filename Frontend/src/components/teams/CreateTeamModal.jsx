import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Plus } from 'lucide-react';
import { Button, Input } from '@/components/ui';

export const CreateTeamModal = ({ isOpen, onClose, onCreate }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    avatar: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = 'Team name is required';
    } else if (formData.name.length < 2) {
      newErrors.name = 'Team name must be at least 2 characters';
    } else if (formData.name.length > 50) {
      newErrors.name = 'Team name must be less than 50 characters';
    }

    if (formData.description && formData.description.length > 500) {
      newErrors.description = 'Description must be less than 500 characters';
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    try {
      await onCreate(formData);
      setFormData({ name: '', description: '', avatar: '' });
      onClose();
    } catch (err) {
      setErrors({ submit: err.response?.data?.message || 'Failed to create team' });
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
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-lg bg-white dark:bg-slate-800 rounded-2xl shadow-2xl"
      >
        {/* Header */}
        <div className="relative p-6 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <Plus className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Create New Team
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Start collaborating with your team
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Team Name */}
          <div>
            <Input
              name="name"
              label="Team Name"
              placeholder="e.g., Design Team, Marketing Department"
              value={formData.name}
              onChange={handleChange}
              error={errors.name}
              autoFocus
              maxLength={50}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-rose-600 dark:text-rose-400">{errors.name}</p>
            )}
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {formData.name.length}/50 characters
            </p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Description <span className="text-slate-400">(optional)</span>
            </label>
            <textarea
              name="description"
              placeholder="What does your team work on?"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              maxLength={500}
              className="w-full px-4 py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 resize-none"
            />
            {errors.description && (
              <p className="mt-1 text-sm text-rose-600 dark:text-rose-400">{errors.description}</p>
            )}
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {formData.description.length}/500 characters
            </p>
          </div>

          {/* Avatar URL (optional) */}
          <div>
            <Input
              name="avatar"
              label={<span>Avatar URL <span className="text-slate-400">(optional)</span></span>}
              type="url"
              placeholder="https://example.com/team-logo.png"
              value={formData.avatar}
              onChange={handleChange}
            />
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Provide a URL to your team's logo or avatar
            </p>
          </div>

          {/* Submit Error */}
          {errors.submit && (
            <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800">
              <p className="text-sm text-rose-600 dark:text-rose-400">{errors.submit}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center space-x-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              className="flex-1"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={isLoading}
              className="flex-1"
            >
              Create Team
            </Button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default CreateTeamModal;
