import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTeam } from '@/contexts/TeamContext';
import { useProject } from '@/contexts/ProjectContext';
import { useSocket } from '@/contexts/SocketContext';
import {
  Zap,
  LayoutDashboard,
  FolderKanban,
  Users,
  Settings,
  Bell,
  LogOut,
  ChevronDown,
  Plus,
  Search,
  Menu,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { Link, useLocation, useNavigate } from 'react-router-dom';

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const { teams, currentTeam, selectTeam } = useTeam();
  const { projects, selectProject } = useProject();
  const { isConnected } = useSocket();
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: FolderKanban, label: 'Projects', path: '/dashboard/projects' },
    { icon: Users, label: 'Team', path: '/dashboard/team' },
    { icon: Settings, label: 'Settings', path: '/dashboard/settings' },
  ];

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 bg-sidebar border-r border-sidebar-border transition-transform duration-300 lg:relative lg:translate-x-0',
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo & Team Switcher */}
          <div className="p-4 border-b border-sidebar-border">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-8 w-8 rounded-lg gradient-primary flex items-center justify-center">
                <Zap className="h-4 w-4 text-primary-foreground" />
              </div>
              <span className="font-bold text-lg text-sidebar-foreground">Zync</span>
              
              {/* Connection indicator */}
              <div className="ml-auto">
                <div
                  className={cn(
                    'h-2 w-2 rounded-full',
                    isConnected ? 'bg-success' : 'bg-muted-foreground'
                  )}
                  title={isConnected ? 'Connected' : 'Disconnected'}
                />
              </div>
            </div>

            {/* Team Switcher */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-between h-10 px-3 bg-sidebar-accent/50 hover:bg-sidebar-accent text-sidebar-foreground"
                >
                  <span className="truncate">{currentTeam?.name || 'Select team'}</span>
                  <ChevronDown className="h-4 w-4 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                <DropdownMenuLabel>Switch team</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {Array.isArray(teams) && teams.map((team) => (
                  <DropdownMenuItem
                    key={team.id}
                    onClick={() => selectTeam(team)}
                    className={cn(currentTeam?.id === team.id && 'bg-accent')}
                  >
                    {team.name}
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Plus className="h-4 w-4 mr-2" />
                  Create new team
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link key={item.path} to={item.path}>
                  <Button
                    variant="ghost"
                    className={cn(
                      'w-full justify-start gap-3 h-10 text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent',
                      isActive && 'bg-sidebar-accent text-sidebar-foreground'
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Button>
                </Link>
              );
            })}

            {/* Projects List */}
            {projects.length > 0 && (
              <div className="pt-4 mt-4 border-t border-sidebar-border">
                <p className="px-3 text-xs font-medium text-sidebar-muted mb-2 uppercase tracking-wider">
                  Projects
                </p>
                <div className="space-y-1">
                  {projects.slice(0, 5).map((project) => (
                    <Button
                      key={project.id}
                      variant="ghost"
                      className="w-full justify-start h-9 text-sm text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent"
                      onClick={() => {
                        selectProject(project.id);
                        navigate(`/dashboard/projects/${project.id}`);
                      }}
                    >
                      <span className="truncate">{project.name}</span>
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </nav>

          {/* User Menu */}
          <div className="p-4 border-t border-sidebar-border">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-3 h-12 px-3 hover:bg-sidebar-accent"
                >
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.avatar} />
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                      {user?.name ? getInitials(user.name) : 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 text-left min-w-0">
                    <p className="text-sm font-medium text-sidebar-foreground truncate">
                      {user?.name}
                    </p>
                    <p className="text-xs text-sidebar-muted truncate">{user?.email}</p>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                  <LogOut className="h-4 w-4 mr-2" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </aside>

      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-16 border-b border-border bg-card/50 backdrop-blur-sm flex items-center px-4 gap-4 sticky top-0 z-30">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          >
            {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>

          {/* Search */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search..."
                className="w-full h-9 pl-9 pr-4 rounded-lg bg-secondary border-none text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Notifications */}
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-destructive" />
            </Button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
