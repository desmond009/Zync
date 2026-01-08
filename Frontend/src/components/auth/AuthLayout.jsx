import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import IllustrationPanel from './IllustrationPanel';

export default function AuthLayout({ children, showIllustration = true }) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Check system preference
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const stored = localStorage.getItem('theme-preference');
    const shouldBeDark = stored ? stored === 'dark' : prefersDark;
    setIsDark(shouldBeDark);
    updateTheme(shouldBeDark);
  }, []);

  const updateTheme = (dark) => {
    if (dark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme-preference', dark ? 'dark' : 'light');
  };

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    updateTheme(newTheme);
  };

  return (
    <div className={`min-h-screen flex ${isDark ? 'dark bg-slate-900' : 'bg-white'}`}>
      {/* Theme Toggle */}
      <motion.button
        onClick={toggleTheme}
        className="fixed top-6 right-6 z-50 p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        aria-label="Toggle theme"
      >
        {isDark ? <Sun size={20} /> : <Moon size={20} />}
      </motion.button>

      {/* Left Side - Illustration (Desktop) */}
      {showIllustration && (
        <motion.div
          className="hidden lg:flex lg:w-1/2 relative overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <IllustrationPanel isDark={isDark} />
        </motion.div>
      )}

      {/* Right Side - Form */}
      <div
        className={`w-full ${
          showIllustration ? 'lg:w-1/2' : ''
        } flex flex-col items-center justify-center px-6 sm:px-8 md:px-12 py-12 md:py-0 ${
          isDark ? 'bg-slate-900' : 'bg-white'
        }`}
      >
        {/* Mobile Illustration Header */}
        <div className="lg:hidden w-full mb-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">Z</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Zync
              </span>
            </div>
          </motion.div>
        </div>

        {/* Form Container */}
        <motion.div
          className={`w-full max-w-[420px] ${
            isDark ? 'bg-slate-800' : 'bg-white'
          } rounded-xl p-8 shadow-lg ${
            isDark ? 'border border-slate-700' : 'border border-slate-200'
          }`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          {children}
        </motion.div>
      </div>
    </div>
  );
}
