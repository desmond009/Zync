import { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  FolderKanban,
  Users,
  Activity,
  Settings,
  ChevronDown,
  Plus,
  Search,
  Bell,
  LogOut,
} from 'lucide-react';
import { Avatar } from '@/components/ui';
import { useAuthStore } from '@/store/authStore';
import { useTeamStore } from '@/store/teamStore';
import { getInitials } from '@/lib/utils';

export const SaaSDashboardLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { teams, currentTeam, fetchTeams } = useTeamStore();
  const [showTeamSwitcher, setShowTeamSwitcher] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    fetchTeams();
  }, []);

  const navigation = [
    { name: 'Dashboard', path: '/app/dashboard', icon: LayoutDashboard },
    { name: 'Projects', path: '/app/projects', icon: FolderKanban },
    { name: 'Team', path: '/app/teams', icon: Users },
    { name: 'Activity', path: '/app/activity', icon: Activity },
    { name: 'Settings', path: '/app/settings', icon: Settings },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname.startsWith(path);

  return (
    <div className="h-screen flex bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col">
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-slate-200">
          <Link to="/app/dashboard" className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center">
              <span className="text-white font-bold text-lg">Z</span>
            </div>
            <span className="text-xl font-semibold text-slate-900">Zync</span>
          </Link>
        </div>

        {/* Team Switcher */}
        <div className="px-3 py-3 border-b border-slate-200">
          <button
            onClick={() => setShowTeamSwitcher(!showTeamSwitcher)}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors group"
          >
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              {currentTeam?.avatar ? (
                <img src={currentTeam.avatar} alt={currentTeam.name} className="w-8 h-8 rounded-lg object-cover" />
              ) : (
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-sm">
                  {currentTeam?.name ? getInitials(currentTeam.name) : 'T'}
                </div>
              )}
              <div className="flex-1 min-w-0 text-left">
                <div className="text-sm font-medium text-slate-900 truncate">
                  {currentTeam?.name || 'Select Team'}
                </div>
                <div className="text-xs text-slate-500">
                  {teams.length} team{teams.length !== 1 && 's'}
                </div>
              </div>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
          </button>

          {/* Team Switcher Dropdown */}
          <AnimatePresence>
            {showTeamSwitcher && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowTeamSwitcher(false)}
                />
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="relative mt-2 bg-white rounded-lg shadow-xl border border-slate-200 py-2 z-50"
                >
                  <div className="max-h-64 overflow-y-auto">
                    {teams.map((team) => (
                      <button
                        key={team._id}
                        onClick={() => {
                          navigate(`/app/teams/${team._id}`);
                          setShowTeamSwitcher(false);
                        }}
                        className="w-full flex items-center space-x-3 px-3 py-2 hover:bg-slate-50 transition-colors"
                      >
                        {team.avatar ? (
                          <img src={team.avatar} alt={team.name} className="w-8 h-8 rounded-lg object-cover" />
                        ) : (
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-sm">
                            {getInitials(team.name)}
                          </div>
                        )}
                        <div className="flex-1 text-left min-w-0">
                          <div className="text-sm font-medium text-slate-900 truncate">{team.name}</div>
                          <div className="text-xs text-slate-500">{team.userRole}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                  <div className="border-t border-slate-200 mt-2 pt-2 px-3">
                    <Link
                      to="/app/teams"
                      onClick={() => setShowTeamSwitcher(false)}
                      className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Create or Join Team</span>
                    </Link>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  active
                    ? 'bg-purple-50 text-purple-700'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Menu */}
        <div className="px-3 py-3 border-t border-slate-200">
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors"
            >
              <Avatar
                src={user?.avatar}
                alt={`${user?.firstName} ${user?.lastName}`}
                fallback={getInitials(`${user?.firstName} ${user?.lastName}`)}
                size="sm"
              />
              <div className="flex-1 text-left min-w-0">
                <div className="text-sm font-medium text-slate-900 truncate">
                  {user?.firstName} {user?.lastName}
                </div>
                <div className="text-xs text-slate-500 truncate">{user?.email}</div>
              </div>
            </button>

            {/* User Dropdown */}
            <AnimatePresence>
              {showUserMenu && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowUserMenu(false)}
                  />
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-lg shadow-xl border border-slate-200 py-2 z-50"
                  >
                    <Link
                      to="/app/settings"
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center space-x-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
                    >
                      <Settings className="w-4 h-4" />
                      <span>Settings</span>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center space-x-2 px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Log out</span>
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 flex-shrink-0">
          <div className="flex-1 max-w-2xl">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search projects, tasks, or teammates..."
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-transparent focus:border-purple-300 focus:bg-white rounded-lg text-sm transition-all outline-none placeholder:text-slate-400"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button className="relative p-2 text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-purple-600 rounded-full ring-2 ring-white"></span>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-auto bg-slate-50">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default SaaSDashboardLayout;
