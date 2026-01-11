import { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  Users,
  MessageSquare,
  Settings,
  Bell,
  Search,
  Menu,
  X,
  Sun,
  Moon,
  ChevronDown,
  LogOut,
  User,
  Building2,
  ChevronRight,
} from 'lucide-react';
import { Avatar, Badge, Sheet } from '@/components/ui';
import { useAuthStore } from '@/store/authStore';
import { useTeamStore } from '@/store/teamStore';
import { useTheme } from '@/contexts/ThemeContext';
import { getInitials } from '@/lib/utils';
import { cn } from '@/lib/utils';

export const EnhancedDashboardLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { teams, currentTeam, setCurrentTeam, fetchTeams } = useTeamStore();
  const { theme, toggleTheme } = useTheme();
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isWorkspaceSwitcherOpen, setIsWorkspaceSwitcherOpen] = useState(false);
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(true);

  useEffect(() => {
    fetchTeams();
  }, [fetchTeams]);

  const navigationGroups = [
    {
      label: 'Core',
      items: [
        {
          name: 'Dashboard',
          path: '/app/dashboard',
          icon: LayoutDashboard,
        },
        {
          name: 'Projects',
          path: '/app/projects',
          icon: FolderKanban,
        },
        {
          name: 'Tasks',
          path: '/app/tasks',
          icon: CheckSquare,
          badge: 12,
        },
      ],
    },
    {
      label: 'Collaboration',
      items: [
        {
          name: 'Teams',
          path: '/app/teams',
          icon: Users,
        },
        {
          name: 'Chat',
          path: '/app/chat',
          icon: MessageSquare,
          badge: 3,
        },
      ],
    },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  // Sidebar Content Component (reusable for desktop and mobile)
  const SidebarContent = ({ isMobile = false }) => (
    <div className="flex flex-col h-full bg-black">
      {/* Logo Section */}
      <div className="px-4 pt-6 pb-4">
        <Link to="/app/dashboard" className="flex items-center space-x-3 px-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <span className="text-white font-bold text-xl">Z</span>
          </div>
          <span className="text-xl font-bold text-white">Zync</span>
        </Link>
      </div>

      {/* Workspace Switcher */}
      <div className="px-4 pb-4">
        <button
          onClick={() => setIsWorkspaceSwitcherOpen(!isWorkspaceSwitcherOpen)}
          className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg bg-zinc-900/50 hover:bg-zinc-800/80 border border-zinc-800 transition-all duration-200 group"
        >
          <div className="flex items-center space-x-2 min-w-0">
            <Building2 className="w-4 h-4 text-zinc-400 flex-shrink-0" />
            <span className="text-sm font-medium text-zinc-200 truncate">
              {currentTeam?.name || 'My Workspace'}
            </span>
          </div>
          <ChevronDown
            className={cn(
              'w-4 h-4 text-zinc-400 transition-transform duration-200 flex-shrink-0',
              isWorkspaceSwitcherOpen && 'rotate-180'
            )}
          />
        </button>

        {/* Workspace Dropdown */}
        <AnimatePresence>
          {isWorkspaceSwitcherOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-2 overflow-hidden"
            >
              <div className="p-1 rounded-lg bg-zinc-900/50 border border-zinc-800">
                {teams?.slice(0, 3).map((team) => (
                  <button
                    key={team._id}
                    onClick={() => {
                      setCurrentTeam(team);
                      setIsWorkspaceSwitcherOpen(false);
                    }}
                    className="w-full flex items-center space-x-2 px-3 py-2 rounded-md hover:bg-zinc-800 transition-colors text-left"
                  >
                    <div className="w-6 h-6 rounded-md bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-white">
                        {team.name.charAt(0)}
                      </span>
                    </div>
                    <span className="text-sm text-zinc-300 truncate">{team.name}</span>
                  </button>
                ))}
                {teams?.length > 3 && (
                  <div className="border-t border-zinc-800 mt-1 pt-1">
                    <Link
                      to="/app/teams"
                      className="w-full flex items-center justify-between px-3 py-2 rounded-md hover:bg-zinc-800 transition-colors text-sm text-zinc-400 hover:text-zinc-200"
                      onClick={() => {
                        setIsWorkspaceSwitcherOpen(false);
                        isMobile && setIsMobileMenuOpen(false);
                      }}
                    >
                      <span>View all workspaces</span>
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation Groups */}
      <nav className="flex-1 px-3 pb-4 space-y-6 overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
        {navigationGroups.map((group) => (
          <div key={group.label}>
            {/* Group Label */}
            <div className="px-3 mb-2">
              <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                {group.label}
              </span>
            </div>

            {/* Group Items */}
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => isMobile && setIsMobileMenuOpen(false)}
                    className={cn(
                      'relative flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group',
                      active
                        ? 'bg-gradient-to-r from-indigo-500/10 to-purple-500/5 text-white'
                        : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50'
                    )}
                  >
                    {/* Active indicator bar */}
                    {active && (
                      <motion.div
                        layoutId="activeIndicator"
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-full"
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                      />
                    )}

                    <div className="flex items-center space-x-3">
                      <Icon
                        className={cn(
                          'w-5 h-5 transition-colors',
                          active
                            ? 'text-indigo-400'
                            : 'text-zinc-500 group-hover:text-zinc-300'
                        )}
                      />
                      <span>{item.name}</span>
                    </div>

                    {/* Badge */}
                    {item.badge && (
                      <motion.div
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        className={cn(
                          'flex items-center justify-center min-w-[22px] h-5 px-1.5 rounded-full text-xs font-semibold',
                          active
                            ? 'bg-indigo-500 text-white'
                            : 'bg-zinc-800 text-zinc-300'
                        )}
                      >
                        {item.badge}
                      </motion.div>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom Section */}
      <div className="border-t border-zinc-900 p-4 space-y-3 bg-black">
        {/* Theme Toggle - Icon Only */}
        <div className="flex justify-center">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleTheme}
            className="p-2.5 rounded-lg bg-zinc-900/50 hover:bg-zinc-800 border border-zinc-800 transition-all duration-200 group"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            <motion.div
              animate={{ rotate: theme === 'dark' ? 0 : 180 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
              {theme === 'dark' ? (
                <Moon className="w-5 h-5 text-indigo-400" />
              ) : (
                <Sun className="w-5 h-5 text-amber-400" />
              )}
            </motion.div>
          </motion.button>
        </div>

        {/* User Profile Card */}
        <div className="relative">
          <button
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg bg-zinc-900/30 hover:bg-zinc-900/60 border border-zinc-900 hover:border-zinc-800 transition-all duration-200 group"
          >
            <Avatar
              src={user?.avatar}
              alt={user?.name}
              fallback={getInitials(user?.name || 'User')}
              size="md"
              className="ring-2 ring-zinc-800"
            />
            <div className="flex-1 text-left min-w-0">
              <p className="text-sm font-semibold text-zinc-100 truncate">
                {user?.name || 'User'}
              </p>
              <p className="text-xs text-zinc-500 truncate">
                {user?.email}
              </p>
            </div>
            <Settings className="w-4 h-4 text-zinc-500 group-hover:text-zinc-400 transition-colors flex-shrink-0" />
          </button>

          {/* User Menu Dropdown */}
          <AnimatePresence>
            {isUserMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute bottom-full left-0 right-0 mb-2 p-1.5 bg-zinc-900 rounded-lg shadow-xl border border-zinc-800"
              >
                <Link
                  to="/app/profile"
                  className="flex items-center space-x-2.5 px-3 py-2 rounded-md hover:bg-zinc-800 transition-colors text-sm text-zinc-300 hover:text-white"
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    isMobile && setIsMobileMenuOpen(false);
                  }}
                >
                  <User className="w-4 h-4" />
                  <span>Profile</span>
                </Link>
                <Link
                  to="/app/settings"
                  className="flex items-center space-x-2.5 px-3 py-2 rounded-md hover:bg-zinc-800 transition-colors text-sm text-zinc-300 hover:text-white"
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    isMobile && setIsMobileMenuOpen(false);
                  }}
                >
                  <Settings className="w-4 h-4" />
                  <span>Settings</span>
                </Link>
                <div className="h-px bg-zinc-800 my-1.5" />
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-md hover:bg-rose-500/10 transition-colors text-sm text-rose-400 hover:text-rose-300"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );

      {/* User Profile & Theme Toggle */}
      <div className="border-t border-zinc-200 dark:border-zinc-800 p-4 space-y-3">
        {/* Theme Toggle */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleTheme}
          className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
        >
          <motion.div
            animate={{ rotate: theme === 'dark' ? 180 : 0 }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
          >
            {theme === 'dark' ? (
              <Moon className="w-5 h-5 text-indigo-500" />
            ) : (
              <Sun className="w-5 h-5 text-amber-500" />
            )}
          </motion.div>
          <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
            {theme === 'dark' ? 'Dark' : 'Light'} Mode
          </span>
        </motion.button>

        {/* User Profile Card */}
        <div className="relative">
          <button
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <Avatar
              src={user?.avatar}
              alt={user?.name}
              fallback={getInitials(user?.name || 'User')}
              size="md"
            />
            <div className="flex-1 text-left">
              <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                {user?.name || 'User'}
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                {user?.email}
              </p>
            </div>
            <Settings className="w-4 h-4 text-zinc-400" />
          </button>

          {/* User Menu Dropdown */}
          <AnimatePresence>
            {isUserMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute bottom-full left-0 right-0 mb-2 p-2 glass rounded-lg shadow-xl border border-zinc-200 dark:border-zinc-800"
              >
                <Link
                  to="/app/profile"
                  className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-sm text-zinc-700 dark:text-zinc-300"
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    isMobile && setIsMobileMenuOpen(false);
                  }}
                >
                  <User className="w-4 h-4" />
                  <span>Profile</span>
                </Link>
                <Link
                  to="/app/settings"
                  className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-sm text-zinc-700 dark:text-zinc-300"
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    isMobile && setIsMobileMenuOpen(false);
                  }}
                >
                  <Settings className="w-4 h-4" />
                  <span>Settings</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors text-sm text-rose-600 dark:text-rose-400"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block fixed left-0 top-0 h-screen w-[280px] border-r border-zinc-900 bg-black z-30 shadow-2xl">
        <SidebarContent />
      </aside>

      {/* Mobile Header */}
      <header className="lg:hidden fixed top-0 left-0 right-0 h-16 border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl z-40 px-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          >
            <Menu className="w-6 h-6 text-zinc-700 dark:text-zinc-300" />
          </button>
          <Link to="/app/dashboard" className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <span className="text-white font-bold">Z</span>
            </div>
            <span className="text-lg font-bold gradient-text">Zync</span>
          </Link>
        </div>
        
        <div className="flex items-center space-x-2">
          <button className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors relative">
            <Bell className="w-5 h-5 text-zinc-700 dark:text-zinc-300" />
            {hasUnreadNotifications && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full" />
            )}
          </button>
        </div>
      </header>

      {/* Mobile Sidebar Sheet */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <Sheet
            isOpen={isMobileMenuOpen}
            onClose={() => setIsMobileMenuOpen(false)}
            side="left"
          >
            <div className="h-full bg-black">
              {/* Close button */}
              <div className="flex items-center justify-between px-6 py-6 border-b border-zinc-900">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                    <span className="text-white font-bold text-xl">Z</span>
                  </div>
                  <span className="text-xl font-bold text-white">Zync</span>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 rounded-lg hover:bg-zinc-900 transition-colors"
                >
                  <X className="w-5 h-5 text-zinc-400" />
                </button>
              </div>
              <SidebarContent isMobile />
            </div>
          </Sheet>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="lg:ml-[280px] min-h-screen">
        {/* Mobile padding for fixed header */}
        <div className="lg:hidden h-16" />
        
        {/* Scrollable content with pattern background */}
        <div className="flex-1 relative">
          {/* Dot pattern background */}
          <div className="absolute inset-0 bg-dot-pattern opacity-[0.15] dark:opacity-[0.05] pointer-events-none" />
          
          {/* Content */}
          <div className="relative">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
};
