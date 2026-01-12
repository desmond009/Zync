import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTeam } from '@/contexts/TeamContext';
import { useProject } from '@/contexts/ProjectContext';
import { useSocket } from '@/contexts/SocketContext';
import {
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
  Inbox,
  Layers,
  HelpCircle,
  Hash,
  PanelRight,
  Filter,
  MoreHorizontal
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
      {/* Sidebar - Linear Style */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-[260px] bg-[#18181b] border-r border-[#27272a] transition-transform duration-300 lg:relative lg:translate-x-0 flex flex-col',
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Workspace Dropdown Header */}
        <div className="h-14 px-3 flex items-center border-b border-[#27272a]/50">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-[#27272a] text-[#e4e4e7] text-sm w-full transition-colors group">
                <div className="h-5 w-5 rounded bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold text-xs ring-1 ring-inset ring-indigo-500/30">
                  {currentTeam?.name?.[0] || 'Z'}
                </div>
                <span className="font-medium truncate flex-1 text-left">{currentTeam?.name || 'Select Team'}</span>
                <ChevronDown className="h-3.5 w-3.5 opacity-50 group-hover:opacity-100" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-[240px] bg-[#18181b] border-[#27272a] text-[#e4e4e7]">
              <DropdownMenuLabel className="text-[#a1a1aa] text-xs font-normal">Switch team</DropdownMenuLabel>
              {Array.isArray(teams) && teams.map((team) => (
                <DropdownMenuItem
                  key={team.id}
                  onClick={() => {
                    selectTeam(team);
                    navigate('/dashboard');
                  }}
                  className={cn(
                    "cursor-pointer focus:bg-[#27272a] focus:text-[#e4e4e7]",
                    currentTeam?.id === team.id && "bg-[#27272a]"
                  )}
                >
                  <div className="h-4 w-4 rounded bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-[10px] mr-2">
                    {team.name[0]}
                  </div>
                  {team.name}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator className="bg-[#27272a]" />
              <DropdownMenuItem className="cursor-pointer focus:bg-[#27272a] focus:text-[#e4e4e7]">
                <Plus className="h-4 w-4 mr-2" />
                Create new team
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="flex items-center gap-1 ml-1">
            <button className="p-1.5 rounded-md hover:bg-[#27272a] text-[#a1a1aa] hover:text-[#e4e4e7] transition-colors">
              <Search className="h-4 w-4" />
            </button>
            <button className="p-1.5 rounded-md hover:bg-[#27272a] text-[#a1a1aa] hover:text-[#e4e4e7] transition-colors relative">
              <Inbox className="h-4 w-4" />
              <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-indigo-500 ring-2 ring-[#18181b]" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto py-3 px-3 space-y-6">

          {/* Section 1: Core Nav */}
          <div className="space-y-0.5">
            <Link to="/dashboard">
              <button className={cn(
                "w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm font-medium transition-colors",
                location.pathname === '/dashboard'
                  ? "bg-[#27272a] text-[#e4e4e7]"
                  : "text-[#a1a1aa] hover:bg-[#27272a]/50 hover:text-[#e4e4e7]"
              )}>
                <Inbox className="h-4 w-4" />
                Inbox
              </button>
            </Link>
            <Link to="/dashboard">
              <button className={cn(
                "w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm font-medium transition-colors",
                location.pathname === '/dashboard/my-issues' // Placeholder route
                  ? "bg-[#27272a] text-[#e4e4e7]"
                  : "text-[#a1a1aa] hover:bg-[#27272a]/50 hover:text-[#e4e4e7]"
              )}>
                <Layers className="h-4 w-4" />
                My issues
              </button>
            </Link>
          </div>

          {/* Section 2: Workspace */}
          <div>
            <div className="px-2 mb-1 flex items-center justify-between group cursor-pointer">
              <span className="text-xs font-medium text-[#a1a1aa] group-hover:text-[#e4e4e7]">Workspace</span>
              <ChevronDown className="h-3 w-3 text-[#a1a1aa] opacity-0 group-hover:opacity-100" />
            </div>
            <div className="space-y-0.5">
              <Link to="/dashboard/projects">
                <button className={cn(
                  "w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm font-medium transition-colors",
                  location.pathname.includes('/projects') && !location.pathname.includes('/projects/')
                    ? "bg-[#27272a] text-[#e4e4e7]"
                    : "text-[#a1a1aa] hover:bg-[#27272a]/50 hover:text-[#e4e4e7]"
                )}>
                  <FolderKanban className="h-4 w-4" />
                  Projects
                </button>
              </Link>
              <button className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm font-medium text-[#a1a1aa] hover:bg-[#27272a]/50 hover:text-[#e4e4e7] transition-colors">
                <PanelRight className="h-4 w-4" />
                Views
              </button>
            </div>
          </div>

          {/* Projects List (Your Teams in original image, but useful here) */}
          <div>
            <div className="px-2 mb-1 flex items-center justify-between group cursor-pointer">
              <span className="text-xs font-medium text-[#a1a1aa] group-hover:text-[#e4e4e7]">Your projects</span>
              <Plus className="h-3 w-3 text-[#a1a1aa] hover:text-[#e4e4e7]" />
            </div>
            <div className="space-y-0.5">
              {projects.slice(0, 6).map(project => (
                <button
                  key={project.id}
                  onClick={() => {
                    selectProject(project.id);
                    navigate(`/dashboard/projects/${project.id}`);
                  }}
                  className={cn(
                    "w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm font-medium transition-colors text-left group",
                    false // Active state logic can be added
                      ? "bg-[#27272a] text-[#e4e4e7]"
                      : "text-[#a1a1aa] hover:bg-[#27272a]/50 hover:text-[#e4e4e7]"
                  )}
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <Hash className="h-3.5 w-3.5 flex-shrink-0" />
                    <span className="truncate">{project.name}</span>
                  </div>
                  {/* Status dot or indicator could go here */}
                </button>
              ))}
              <div className="px-2 py-1">
                <button onClick={() => navigate('/dashboard/projects')} className="text-xs text-[#a1a1aa] hover:text-[#e4e4e7] flex items-center gap-1">
                  <Filter className="h-3 w-3" /> All projects
                </button>
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-3 border-t border-[#27272a]/50 space-y-1">
          <button className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm font-medium text-[#a1a1aa] hover:bg-[#27272a]/50 hover:text-[#e4e4e7] transition-colors">
            <Users className="h-4 w-4" />
            Invite people
          </button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm font-medium text-[#a1a1aa] hover:bg-[#27272a]/50 hover:text-[#e4e4e7] transition-colors group">
                <Avatar className="h-5 w-5 rounded-full border border-[#27272a]">
                  <AvatarImage src={user?.avatar} />
                  <AvatarFallback className="text-[10px] bg-[#27272a] text-[#a1a1aa]">{user?.name ? getInitials(user.name) : 'U'}</AvatarFallback>
                </Avatar>
                <span className="flex-1 text-left truncate">{user?.name}</span>
                <MoreHorizontal className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-[#18181b] border-[#27272a] text-[#e4e4e7]">
              <DropdownMenuItem onClick={() => navigate('/dashboard/settings')} className="focus:bg-[#27272a] focus:text-[#e4e4e7] cursor-pointer">
                <Settings className="h-4 w-4 mr-2" /> Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-[#27272a]" />
              <DropdownMenuItem onClick={handleLogout} className="focus:bg-red-900/20 text-red-400 focus:text-red-400 cursor-pointer">
                <LogOut className="h-4 w-4 mr-2" /> Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#f4f5f8] dark:bg-[#09090b]">
        {/* Mobile Header */}
        <header className="lg:hidden h-14 border-b border-border bg-card flex items-center px-4 sticky top-0 z-30">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="mr-2"
          >
            {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
          <span className="font-semibold">{currentTeam?.name}</span>
        </header>

        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>

      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
}
