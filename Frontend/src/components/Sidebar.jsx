import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  FolderOpen,
  CheckSquare,
  Users,
  MessageCircle,
  LogOut,
  Settings,
  ChevronDown,
  Moon,
  Sun,
  Menu,
  X,
  Zap,
  Bell,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useTheme } from '@/contexts/ThemeContext';

const Sidebar = () => {
  const location = useLocation();
  const { user, logout } = useAuthStore();
  const { theme, toggleTheme } = useTheme();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isWorkspaceSwitcherOpen, setIsWorkspaceSwitcherOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const navigationItems = [
    { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { label: 'Projects', icon: FolderOpen, path: '/projects' },
    { label: 'Tasks', icon: CheckSquare, path: '/tasks', badge: '12' },
    { label: 'Teams', icon: Users, path: '/teams' },
    { label: 'Chat', icon: MessageCircle, path: '/chat', badge: '3' },
  ];

  const itemVariants = {
    hidden: { y: -20, opacity: 0 },
    visible: (i) => ({
      y: 0,
      opacity: 1,
      transition: { delay: i * 0.05, duration: 0.3 },
    }),
  };

  return (
    <nav className="sticky top-0 z-50 w-full bg-slate-900/80 backdrop-blur-2xl border-b border-slate-800/50 shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        {/* Main Navigation Container */}
        <div className="flex items-center justify-between h-20">
          {/* Left Section: Logo + Workspace Switcher */}
          <div className="flex items-center gap-4 flex-1 min-w-0">
            {/* Logo */}
            <Link to="/dashboard" className="flex items-center gap-2 flex-shrink-0">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow">
                <Zap size={24} className="text-white" />
              </div>
              <span className="hidden sm:inline text-xl font-bold bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
                Zync
              </span>
            </Link>

            {/* Divider */}
            <div className="hidden lg:block w-px h-8 bg-slate-700/50" />

            {/* Workspace Switcher - Desktop */}
            <div className="hidden lg:block relative flex-shrink-0">
              <motion.button
                onClick={() => setIsWorkspaceSwitcherOpen(!isWorkspaceSwitcherOpen)}
                className="px-3 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white bg-slate-800/30 hover:bg-slate-800/50 transition-all flex items-center gap-2 border border-slate-700/30 hover:border-slate-600/50"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="truncate max-w-[140px]">My Workspace</span>
                <ChevronDown
                  size={14}
                  className={`transition-transform flex-shrink-0 ${isWorkspaceSwitcherOpen ? 'rotate-180' : ''}`}
                />
              </motion.button>

              <AnimatePresence>
                {isWorkspaceSwitcherOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="absolute top-full mt-2 w-48 bg-slate-800 rounded-lg border border-slate-700 shadow-xl overflow-hidden"
                  >
                    <button className="w-full px-4 py-2 text-left text-sm text-slate-300 hover:bg-slate-700/50 hover:text-white transition-colors">
                      Default Workspace
                    </button>
                    <button className="w-full px-4 py-2 text-left text-sm text-slate-400 hover:bg-slate-700/50 hover:text-white transition-colors border-t border-slate-700">
                      + New Workspace
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Center Section: Navigation Items - Desktop */}
          <div className="hidden lg:flex items-center gap-1">
            {navigationItems.map((item, idx) => {
              const Icon = item.icon;
              const active = isActive(item.path);

              return (
                <motion.div key={item.label} custom={idx} variants={itemVariants} initial="hidden" animate="visible">
                  <Link to={item.path} className="relative group">
                    <div className={`px-3 py-2 rounded-lg flex items-center gap-2 transition-all text-sm font-medium ${
                      active
                        ? 'bg-violet-600/20 text-violet-300'
                        : 'text-slate-400 hover:text-slate-300 hover:bg-slate-800/50'
                    }`}>
                      <Icon size={16} className="flex-shrink-0" />
                      <span>{item.label}</span>
                      {item.badge && (
                        <motion.span
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className={`ml-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                            active
                              ? 'bg-violet-600/40 text-violet-200'
                              : 'bg-slate-700/50 text-slate-400 group-hover:bg-slate-700 group-hover:text-slate-300'
                          }`}
                        >
                          {item.badge}
                        </motion.span>
                      )}
                    </div>
                    {active && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-violet-500 to-indigo-500"
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                      />
                    )}
                  </Link>
                </motion.div>
              );
            })}
          </div>

          {/* Right Section: Actions & Profile */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Notification Bell */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 text-slate-400 hover:text-slate-300 hover:bg-slate-800/50 rounded-lg transition-all relative hidden sm:inline-flex"
            >
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </motion.button>

            {/* Theme Toggle - Hidden on Mobile */}
            <motion.button
              onClick={toggleTheme}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 text-slate-400 hover:text-slate-300 hover:bg-slate-800/50 rounded-lg transition-all hidden sm:inline-flex"
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </motion.button>

            {/* User Profile Menu - Desktop */}
            {user && (
              <div className="hidden sm:block relative">
                <motion.button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800/40 hover:bg-slate-800/60 transition-all border border-slate-700/30 hover:border-slate-600/50 group"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center flex-shrink-0 shadow-lg">
                    <span className="text-white font-bold text-sm">
                      {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </span>
                  </div>
                  <div className="hidden lg:block min-w-0 text-left">
                    <p className="text-sm font-medium text-slate-200 truncate">
                      {user?.name?.split(' ')[0]}
                    </p>
                  </div>
                  <ChevronDown
                    size={14}
                    className={`transition-transform flex-shrink-0 ${isUserMenuOpen ? 'rotate-180' : ''}`}
                  />
                </motion.button>

                {/* User Menu Dropdown */}
                <AnimatePresence>
                  {isUserMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      className="absolute top-full right-0 mt-2 w-48 bg-slate-800 rounded-lg border border-slate-700 shadow-xl overflow-hidden"
                    >
                      <Link
                        to="/settings"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-3 w-full px-4 py-3 text-sm text-slate-300 hover:bg-slate-700/50 hover:text-white transition-colors"
                      >
                        <Settings size={16} />
                        Settings
                      </Link>
                      <motion.button
                        onClick={() => {
                          logout();
                          setIsUserMenuOpen(false);
                        }}
                        whileHover={{ backgroundColor: 'rgba(239, 68, 68, 0.1)' }}
                        className="flex items-center gap-3 w-full px-4 py-3 text-sm text-red-400 hover:text-red-300 transition-colors border-t border-slate-700"
                      >
                        <LogOut size={16} />
                        Logout
                      </motion.button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <motion.button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="lg:hidden p-2 text-slate-400 hover:text-slate-300 hover:bg-slate-800/50 rounded-lg transition-all"
            >
              {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </motion.button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden border-t border-slate-800/50 bg-slate-950/50"
            >
              <div className="px-4 py-4 space-y-2">
                {/* Workspace Switcher - Mobile */}
                <motion.button
                  onClick={() => setIsWorkspaceSwitcherOpen(!isWorkspaceSwitcherOpen)}
                  className="w-full px-3 py-2 rounded-lg text-sm font-medium text-slate-300 bg-slate-800/30 hover:bg-slate-800/50 transition-all flex items-center justify-between border border-slate-700/30"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span>My Workspace</span>
                  <ChevronDown
                    size={14}
                    className={`transition-transform ${isWorkspaceSwitcherOpen ? 'rotate-180' : ''}`}
                  />
                </motion.button>

                {isWorkspaceSwitcherOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden"
                  >
                    <button className="w-full px-4 py-2 text-left text-sm text-slate-300 hover:bg-slate-700/50 hover:text-white transition-colors">
                      Default Workspace
                    </button>
                    <button className="w-full px-4 py-2 text-left text-sm text-slate-400 hover:bg-slate-700/50 hover:text-white transition-colors border-t border-slate-700">
                      + New Workspace
                    </button>
                  </motion.div>
                )}

                {/* Navigation Items - Mobile */}
                <div className="space-y-1 pt-2 border-t border-slate-800/50">
                  {navigationItems.map((item) => {
                    const Icon = item.icon;
                    const active = isActive(item.path);

                    return (
                      <Link
                        key={item.label}
                        to={item.path}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-all text-sm font-medium ${
                          active
                            ? 'bg-violet-600/20 text-violet-300'
                            : 'text-slate-400 hover:text-slate-300 hover:bg-slate-800/50'
                        }`}
                      >
                        <Icon size={18} />
                        <span>{item.label}</span>
                        {item.badge && (
                          <span className={`ml-auto px-2 py-0.5 rounded-full text-xs font-semibold ${
                            active
                              ? 'bg-violet-600/40 text-violet-200'
                              : 'bg-slate-700/50 text-slate-400'
                          }`}>
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>

                {/* Mobile Actions */}
                <div className="pt-2 border-t border-slate-800/50 space-y-2">
                  <motion.button
                    onClick={toggleTheme}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-slate-800/30 hover:bg-slate-800/50 transition-all text-slate-400 hover:text-slate-300 text-sm"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
                    {theme === 'dark' ? 'Light' : 'Dark'} Mode
                  </motion.button>

                  {user && (
                    <>
                      <Link
                        to="/settings"
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="flex items-center gap-3 w-full px-3 py-3 rounded-lg text-slate-400 hover:text-slate-300 hover:bg-slate-800/50 transition-all text-sm"
                      >
                        <Settings size={18} />
                        Settings
                      </Link>
                      <motion.button
                        onClick={() => {
                          logout();
                          setIsMobileMenuOpen(false);
                        }}
                        className="flex items-center gap-3 w-full px-3 py-3 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all text-sm"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <LogOut size={18} />
                        Logout
                      </motion.button>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
};

export default Sidebar;
