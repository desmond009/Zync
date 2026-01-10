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
  const [hasUnreadNotifications, setHasUnreadNotifications] = useState(true);

  useEffect(() => {
    fetchTeams();
  }, [fetchTeams]);

  const navigation = [
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
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  // Sidebar Content Component (reusable for desktop and mobile)
  const SidebarContent = ({ isMobile = false }) => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-zinc-200 dark:border-zinc-800">
        <Link to="/app/dashboard" className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <span className="text-white font-bold text-xl">Z</span>
          </div>
          <span className="text-xl font-bold gradient-text">Zync</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.path);
          
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => isMobile && setIsMobileMenuOpen(false)}
              className={cn(
                'flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200',
                active
                  ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-l-4 border-indigo-500'
                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800/50 border-l-4 border-transparent'
              )}
            >
              <div className="flex items-center space-x-3">
                <Icon className="w-5 h-5" />
                <span>{item.name}</span>
              </div>
              {item.badge && (
                <Badge variant="primary" className="ml-auto">
                  {item.badge}
                </Badge>
              )}
            </Link>
          );
        })}
      </nav>

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
      <aside className="hidden lg:block fixed left-0 top-0 h-screen w-[260px] border-r border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-950/80 backdrop-blur-xl z-30">
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
            <div className="h-full bg-zinc-50 dark:bg-zinc-950">
              {/* Close button */}
              <div className="flex items-center justify-between px-6 py-6 border-b border-zinc-200 dark:border-zinc-800">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                    <span className="text-white font-bold text-xl">Z</span>
                  </div>
                  <span className="text-xl font-bold gradient-text">Zync</span>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  <X className="w-5 h-5 text-zinc-700 dark:text-zinc-300" />
                </button>
              </div>
              <SidebarContent isMobile />
            </div>
          </Sheet>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="lg:ml-[260px] min-h-screen">
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
