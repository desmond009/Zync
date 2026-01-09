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
  ChevronDown,
  LogOut,
  Menu,
  X,
  Plus,
  Check,
} from 'lucide-react';
import { Avatar, Badge } from '@/components/ui';
import { useAuthStore } from '@/store/authStore';
import { useTeamStore } from '@/store/teamStore';
import { getInitials } from '@/lib/utils';

export const DashboardLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { teams, currentTeam, setCurrentTeam, fetchTeams } = useTeamStore();
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isTeamDropdownOpen, setIsTeamDropdownOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
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

  const handleTeamSwitch = (team) => {
    setCurrentTeam(team);
    setIsTeamDropdownOpen(false);
  };

  // Command palette shortcut
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Sidebar */}
      <AnimatePresence mode="wait">
        {isSidebarOpen && (
          <motion.aside
            initial={{ x: -280, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -280, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 40 }}
            className="fixed left-0 top-0 bottom-0 w-[280px] bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 z-50 flex flex-col"
          >
            {/* Logo & Team Switcher */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2 mb-3">
                <Link to="/app/dashboard">
                  <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    Zync
                  </h1>
                </Link>
              </div>

              {/* Team Switcher */}
              <div className="relative">
                <button
                  onClick={() => setIsTeamDropdownOpen(!isTeamDropdownOpen)}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <Avatar
                      src={currentTeam?.avatar}
                      fallback={getInitials(currentTeam?.name || 'Personal')}
                      size="sm"
                    />
                    <span className="text-sm font-medium text-slate-900 dark:text-white truncate">
                      {currentTeam?.name || 'Personal Workspace'}
                    </span>
                  </div>
                  <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
                </button>

                {/* Team Dropdown */}
                <AnimatePresence>
                  {isTeamDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg overflow-hidden z-50"
                    >
                      <div className="p-2">
                        <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 px-3 py-2">
                          YOUR WORKSPACES
                        </div>
                        
                        {/* Personal Workspace */}
                        <button
                          onClick={() => {
                            setCurrentTeam(null);
                            setIsTeamDropdownOpen(false);
                          }}
                          className="w-full flex items-center justify-between px-3 py-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            <Avatar
                              src={user?.avatar}
                              fallback={getInitials(user?.name)}
                              size="sm"
                            />
                            <span className="text-sm font-medium text-slate-900 dark:text-white">
                              Personal Workspace
                            </span>
                          </div>
                          {!currentTeam && (
                            <Check className="w-4 h-4 text-indigo-600" />
                          )}
                        </button>

                        {/* Teams */}
                        {teams.map((team) => (
                          <button
                            key={team._id}
                            onClick={() => handleTeamSwitch(team)}
                            className="w-full flex items-center justify-between px-3 py-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                          >
                            <div className="flex items-center gap-2">
                              <Avatar
                                src={team.avatar}
                                fallback={getInitials(team.name)}
                                size="sm"
                              />
                              <span className="text-sm font-medium text-slate-900 dark:text-white">
                                {team.name}
                              </span>
                            </div>
                            {currentTeam?._id === team._id && (
                              <Check className="w-4 h-4 text-indigo-600" />
                            )}
                          </button>
                        ))}

                        {/* Create Team */}
                        <button
                          onClick={() => {
                            navigate('/app/teams');
                            setIsTeamDropdownOpen(false);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 mt-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-slate-700 dark:text-slate-300"
                        >
                          <Plus className="w-4 h-4" />
                          <span className="text-sm font-medium">Create Team</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
              {navigation.map((item) => {
                const isActive = location.pathname === item.path;
                const Icon = item.icon;
                
                return (
                  <Link key={item.path} to={item.path}>
                    <motion.div
                      whileHover={{ x: 2 }}
                      whileTap={{ scale: 0.98 }}
                      className={`flex items-center justify-between px-3 py-2 rounded-lg transition-all ${
                        isActive
                          ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 font-medium'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="w-5 h-5" />
                        <span className="text-sm">{item.name}</span>
                      </div>
                      {item.badge && (
                        <Badge 
                          variant="secondary" 
                          className="ml-auto bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs"
                        >
                          {item.badge}
                        </Badge>
                      )}
                    </motion.div>
                  </Link>
                );
              })}
            </nav>

            {/* User Profile */}
            <div className="p-4 border-t border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <Avatar
                    src={user?.avatar}
                    fallback={getInitials(user?.name)}
                    size="sm"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                      {user?.name}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                      {user?.email}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-rose-600 transition-colors flex-shrink-0"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className={`transition-all duration-300 ${isSidebarOpen ? 'ml-[280px]' : 'ml-0'}`}>
        {/* Top navbar */}
        <motion.header
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800"
        >
          <div className="flex items-center justify-between px-6 py-3">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
              >
                <Menu className="w-5 h-5" />
              </button>

              {/* Search */}
              <button
                onClick={() => setIsCommandPaletteOpen(true)}
                className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition-all w-64"
              >
                <Search className="w-4 h-4" />
                <span className="text-sm">Quick search...</span>
                <kbd className="ml-auto px-1.5 py-0.5 text-xs font-semibold bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded">
                  ⌘K
                </kbd>
              </button>
            </div>

            <div className="flex items-center gap-2">
              {/* Notifications */}
              <button
                className="relative p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
                title="Notifications"
              >
                <Bell className="w-5 h-5" />
                {hasUnreadNotifications && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full"></span>
                )}
              </button>

              {/* Settings */}
              <button
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors"
                title="Settings"
              >
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
        </motion.header>

        {/* Page content */}
        <main className="p-6">
          <Outlet />
        </main>
      </div>

      {/* Overlay when team dropdown is open */}
      <AnimatePresence>
        {isTeamDropdownOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsTeamDropdownOpen(false)}
            className="fixed inset-0 bg-black/20 z-40"
          />
        )}
      </AnimatePresence>
    </div>
  );
};
