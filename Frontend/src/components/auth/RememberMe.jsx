import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

export default function RememberMe({ checked, onChange }) {
  const isDark = document.documentElement.classList.contains('dark');

  return (
    <motion.label
      className="flex items-center gap-3 mb-6 cursor-pointer"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.3 }}
    >
      <motion.div
        className={`relative w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
          isDark
            ? `border-slate-500 ${checked ? 'bg-indigo-600 border-indigo-600' : 'bg-slate-700'}`
            : `border-slate-300 ${checked ? 'bg-indigo-600 border-indigo-600' : 'bg-white'}`
        }`}
        whileTap={{ scale: 0.95 }}
      >
        {checked && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          >
            <Check size={14} className="text-white" />
          </motion.div>
        )}
      </motion.div>
      <span className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
        Remember me for 30 days
      </span>
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="hidden"
      />
    </motion.label>
  );
}
