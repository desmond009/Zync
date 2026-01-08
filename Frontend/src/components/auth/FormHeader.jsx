import { motion } from 'framer-motion';

export default function FormHeader({ title, subtitle, badge }) {
  const isDark = document.documentElement.classList.contains('dark');

  return (
    <motion.div
      className="mb-8 text-center"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <h1 className={`text-3xl font-bold mb-2 bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent`}>
        {title}
      </h1>
      <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>
        {subtitle}
      </p>
      {badge && (
        <motion.div
          className={`mt-3 inline-flex items-center gap-1 text-xs font-medium ${
            isDark ? 'text-slate-400' : 'text-slate-600'
          }`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {badge}
        </motion.div>
      )}
    </motion.div>
  );
}
