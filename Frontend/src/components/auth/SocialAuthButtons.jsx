import { motion } from 'framer-motion';
import { Chrome, Github } from 'lucide-react';

export default function SocialAuthButtons({ isLoading, onGoogle, onGithub }) {
  const isDark = document.documentElement.classList.contains('dark');

  const buttonClass = `
    w-full py-3 px-4 rounded-lg border-2 font-medium transition-all duration-200
    flex items-center justify-center gap-2
    hover:shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed
  `;

  return (
    <div className="space-y-3">
      {/* Google Button */}
      <motion.button
        onClick={onGoogle}
        disabled={isLoading}
        className={`${buttonClass} ${
          isDark
            ? 'border-slate-600 bg-slate-700 text-white hover:bg-slate-600'
            : 'border-slate-300 bg-white text-slate-900 hover:bg-slate-50'
        }`}
        whileHover={{ scale: isLoading ? 1 : 1.02 }}
        whileTap={{ scale: isLoading ? 1 : 0.98 }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Chrome size={18} />
        <span>Continue with Google</span>
      </motion.button>

      {/* GitHub Button */}
      <motion.button
        onClick={onGithub}
        disabled={isLoading}
        className={`${buttonClass} ${
          isDark
            ? 'border-slate-600 bg-[#1f2937] text-white hover:bg-[#111827]'
            : 'border-slate-300 bg-slate-900 text-white hover:bg-slate-800'
        }`}
        whileHover={{ scale: isLoading ? 1 : 1.02 }}
        whileTap={{ scale: isLoading ? 1 : 0.98 }}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <Github size={18} />
        <span>Continue with GitHub</span>
      </motion.button>
    </div>
  );
}
