import { motion } from 'framer-motion';
import { LogIn } from 'lucide-react';

export default function SubmitButton({ 
  text, 
  loading, 
  disabled, 
  icon: Icon = LogIn,
  type = 'submit',
  onClick,
  fullWidth = true,
  variant = 'primary'
}) {
  const isDark = document.documentElement.classList.contains('dark');

  const baseClasses = `
    w-${fullWidth ? 'full' : 'auto'} px-6 py-3 rounded-lg font-semibold 
    transition-all duration-200 outline-none focus:ring-2 focus:ring-indigo-500/50
    disabled:opacity-50 disabled:cursor-not-allowed
    flex items-center justify-center gap-2 relative overflow-hidden
  `;

  const variantClasses = variant === 'primary'
    ? `bg-gradient-to-r from-indigo-600 to-purple-600 text-white 
       hover:shadow-lg hover:shadow-indigo-500/30 active:scale-95
       ${isDark ? '' : ''}`
    : `${isDark ? 'bg-slate-700 text-white' : 'bg-slate-200 text-slate-900'}
       hover:${isDark ? 'bg-slate-600' : 'bg-slate-300'}`;

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={loading || disabled}
      className={`${baseClasses} ${variantClasses}`}
      whileHover={{ scale: disabled || loading ? 1 : 1.02 }}
      whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
    >
      {/* Background Animation */}
      <motion.div
        className="absolute inset-0 bg-white/20 opacity-0"
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
      />

      {/* Content */}
      <div className="relative flex items-center justify-center gap-2">
        {loading ? (
          <>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
            />
            <span>{text.replace(/^(Log in|Sign up|Create account|Continue)/, '$1ing')}...</span>
          </>
        ) : (
          <>
            <Icon size={18} />
            <span>{text}</span>
          </>
        )}
      </div>
    </motion.button>
  );
}
