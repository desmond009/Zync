import { motion } from 'framer-motion';

export default function Divider({ text = 'or continue with email' }) {
  const isDark = document.documentElement.classList.contains('dark');

  return (
    <motion.div
      className="flex items-center gap-4 my-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2 }}
    >
      <div className={`flex-1 h-px ${isDark ? 'bg-slate-600' : 'bg-slate-300'}`} />
      <span className={`text-xs font-medium ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
        {text}
      </span>
      <div className={`flex-1 h-px ${isDark ? 'bg-slate-600' : 'bg-slate-300'}`} />
    </motion.div>
  );
}
