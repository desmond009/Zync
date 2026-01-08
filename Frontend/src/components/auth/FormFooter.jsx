import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export default function FormFooter({ text, linkText, linkHref }) {
  const isDark = document.documentElement.classList.contains('dark');

  return (
    <motion.div
      className={`mt-8 text-center text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.4 }}
    >
      {text}{' '}
      <Link
        to={linkHref}
        className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline transition-colors"
      >
        {linkText}
      </Link>
    </motion.div>
  );
}
