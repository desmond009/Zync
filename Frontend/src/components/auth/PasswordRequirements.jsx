import { motion } from 'framer-motion';
import { Check } from 'lucide-react';

export default function PasswordRequirements({ password }) {
  const requirements = [
    { label: 'At least 8 characters', met: password.length >= 8 },
    { label: 'One uppercase letter', met: /[A-Z]/.test(password) },
    { label: 'One lowercase letter', met: /[a-z]/.test(password) },
    { label: 'One number', met: /\d/.test(password) },
    { label: 'One special character (@$!%*?&)', met: /[@$!%*?&]/.test(password) },
  ];

  const isDark = document.documentElement.classList.contains('dark');

  return (
    <motion.div
      className={`mt-4 p-3 rounded-lg ${isDark ? 'bg-slate-700/50' : 'bg-slate-100'}`}
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
    >
      <p className={`text-xs font-semibold mb-2 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
        Password requirements:
      </p>
      <div className="space-y-2">
        {requirements.map((req, idx) => (
          <motion.div
            key={idx}
            className="flex items-center gap-2"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
          >
            <div
              className={`w-4 h-4 rounded-full flex items-center justify-center transition-colors ${
                req.met
                  ? isDark
                    ? 'bg-green-500/30 text-green-400'
                    : 'bg-green-100 text-green-600'
                  : isDark
                  ? 'bg-slate-600 text-slate-500'
                  : 'bg-slate-300 text-slate-500'
              }`}
            >
              {req.met && <Check size={12} />}
            </div>
            <span className={`text-xs ${
              req.met
                ? isDark ? 'text-green-400' : 'text-green-600'
                : isDark ? 'text-slate-400' : 'text-slate-600'
            }`}>
              {req.label}
            </span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
