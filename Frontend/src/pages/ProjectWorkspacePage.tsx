import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useProject } from '@/contexts/ProjectContext';
import { useSocketEvent } from '@/contexts/SocketContext';
import { tasksApi, Task, projectsApi, Project } from '@/lib/api';
import KanbanBoard from '@/components/project/KanbanBoard';
import ActivityFeed from '@/components/project/ActivityFeed';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Box,
  MoreHorizontal,
  Star,
  Bell,
  Link as LinkIcon,
  Maximize2,
  FileText,
  Activity,
  LayoutList,
  Plus,
  Circle,
  AlertCircle,
  User,
  Users,
  Calendar as CalendarIcon,
  Tag,
  ArrowRight,
  PanelRightOpen,
  CheckCircle2,
  Clock,
  AlertTriangle,
  XCircle,
  MinusCircle,
  ChevronDown,
  LineChart,
  FileEdit,
  Loader2,
  CircleDashed,
  CalendarPlus,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { toast } from 'sonner';

const STATUS_OPTIONS = [
  { label: 'Backlog', value: 'BACKLOG', icon: CircleDashed, color: 'text-orange-400' },
  { label: 'Planned', value: 'PLANNED', icon: Circle, color: 'text-blue-400' },
  { label: 'In Progress', value: 'IN_PROGRESS', icon: Circle, color: 'text-yellow-400' },
  { label: 'Completed', value: 'COMPLETED', icon: CheckCircle2, color: 'text-green-400' },
  { label: 'Canceled', value: 'CANCELED', icon: XCircle, color: 'text-red-400' },
];

const PRIORITY_OPTIONS = [
  { label: 'No priority', value: 'NONE', icon: MoreHorizontal, color: 'text-gray-400' },
  { label: 'Low', value: 'LOW', icon: ArrowRight, color: 'text-blue-400' },
  { label: 'Medium', value: 'MEDIUM', icon: ArrowRight, color: 'text-yellow-400' },
  { label: 'High', value: 'HIGH', icon: ArrowRight, color: 'text-orange-400' },
  { label: 'Urgent', value: 'URGENT', icon: AlertTriangle, color: 'text-red-400' },
];

export default function ProjectWorkspacePage() {
  const { projectId } = useParams<{ projectId: string }>();
  const { currentProject, selectProject, updateProject, isLoading: projectLoading } = useProject();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showSidebar, setShowSidebar] = useState(() => window.innerWidth >= 1024);
  const [activeTab, setActiveTab] = useState('overview');

  // Load project
  useEffect(() => {
    if (projectId && (!currentProject || currentProject.id !== projectId)) {
      selectProject(projectId);
    }
  }, [projectId, currentProject, selectProject]);

  // Load tasks
  const loadTasks = useCallback(async () => {
    if (!projectId) return;
    try {
      const fetchedTasks = await tasksApi.list(projectId);
      setTasks(fetchedTasks);
    } catch (error) {
      console.error('Failed to load tasks:', error);
    }
  }, [projectId]);

  useEffect(() => {
    if (currentProject) {
      loadTasks();
    }
  }, [currentProject, loadTasks]);

  // Socket event handlers
  useSocketEvent<Task>('task.created', (task) => setTasks((prev) => [...prev, task]), []);
  useSocketEvent<Task>('task.updated', (updatedTask) => setTasks((prev) => prev.map((t) => (t.id === updatedTask.id ? updatedTask : t))), []);
  useSocketEvent<any>('task.deleted', ({ taskId }) => setTasks((prev) => prev.filter((t) => t.id !== taskId)), []);

  const handleTaskUpdate = async (taskId: string, updates: Partial<Task>) => {
    const previousTasks = tasks;
    setTasks((prev) => prev.map((task) => (task.id === taskId ? { ...task, ...updates } : task)));
    try {
      await tasksApi.update(taskId, updates);
    } catch (error) {
      setTasks(previousTasks);
    }
  };

  const handleTaskMove = async (taskId: string, status: string, position: number) => {
    const previousTasks = tasks;
    setTasks((prev) => prev.map((task) => (task.id === taskId ? { ...task, status: status as Task['status'], position } : task)));
    try {
      await tasksApi.move(taskId, status, position);
    } catch (error) {
      setTasks(previousTasks);
    }
  };

  const handleTaskCreate = async (taskData: Partial<Task>) => {
    if (!projectId) throw new Error("Project ID is missing");
    // @ts-ignore
    return await tasksApi.create({ projectId, ...taskData });
  };

  const handleUpdateProject = async (updates: Partial<Project>) => {
    if (!projectId) return;
    try {
      await updateProject(projectId, updates);
      toast.success('Project updated');
    } catch (error) {
      toast.error('Failed to update project');
    }
  };

  if (projectLoading || !currentProject) {
    return (
      <div className="flex items-center justify-center h-full bg-[#09090b]">
        <Loader2 className="h-8 w-8 animate-spin text-[#5e6ad2]" />
      </div>
    );
  }

  const currentStatus = STATUS_OPTIONS.find(s => s.value === currentProject.status) || STATUS_OPTIONS[0];
  const currentPriority = PRIORITY_OPTIONS.find(p => p.value === currentProject.priority) || PRIORITY_OPTIONS[0];

  // Find lead user in members
  // @ts-ignore
  const leadMember = currentProject.members?.find(m => (m?.user?.id || m?.user?._id) === currentProject.leadUserId);

  return (
    <div className="h-[calc(100vh-3.5rem)] flex flex-col bg-[#09090b] text-[#e4e4e7]">
      {/* Project Header */}
      <div className="h-12 border-b border-[#27272a] flex items-center justify-between px-4 bg-[#09090b] shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex items-center gap-2 text-sm text-[#a1a1aa] whitespace-nowrap">
            <span className="hover:text-[#e4e4e7] cursor-pointer">Projects</span>
            <span className="text-[#3f3f46]">›</span>
            <div className="flex items-center gap-1.5 px-1.5 py-0.5 rounded hover:bg-[#27272a] transition-colors cursor-pointer group">
              <div className="h-4 w-4 bg-[#27272a] rounded flex items-center justify-center border border-[#3f3f46]/50">
                <Box className="h-2.5 w-2.5 text-[#e4e4e7]" />
              </div>
              <span className="text-[#e4e4e7] font-medium truncate max-w-[150px]">{currentProject.name}</span>
              <Star className="h-3.5 w-3.5 text-[#a1a1aa] group-hover:text-[#e4e4e7]" />
            </div>
          </div>
          <button className="text-[#a1a1aa] hover:text-[#e4e4e7] transition-colors p-1 hidden sm:block">
            <MoreHorizontal className="h-4 w-4" />
          </button>

          <div className="h-6 w-px bg-[#27272a] mx-2 hidden sm:block" />

          <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
            <TabsList className="h-full bg-transparent p-0 gap-1 overflow-x-auto no-scrollbar max-w-[calc(100vw-180px)] sm:max-w-none">
              <TabsTrigger value="overview" className="h-8 px-3 rounded-md data-[state=active]:bg-[#18181b] data-[state=active]:text-white text-[#8a8a93] text-sm font-medium border-0 shadow-none hover:text-[#e4e4e7] transition-colors">
                <FileText className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Overview</span>
              </TabsTrigger>
              <TabsTrigger value="updates" className="h-8 px-3 rounded-md data-[state=active]:bg-[#18181b] data-[state=active]:text-white text-[#8a8a93] text-sm font-medium border-0 shadow-none hover:text-[#e4e4e7] transition-colors">
                <LineChart className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Updates</span>
              </TabsTrigger>
              <TabsTrigger value="tasks" className="h-8 px-3 rounded-md data-[state=active]:bg-[#18181b] data-[state=active]:text-white text-[#8a8a93] text-sm font-medium border-0 shadow-none hover:text-[#e4e4e7] transition-colors">
                <LayoutList className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Issues</span>
              </TabsTrigger>
              <button className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-[#27272a] text-[#8a8a93] transition-colors hidden sm:flex">
                <Box className="h-4 w-4" />
              </button>
            </TabsList>
          </Tabs>
        </div>

        <div className="flex items-center gap-2 ml-4 shrink-0">
          <button className="p-2 text-[#a1a1aa] hover:text-[#e4e4e7] transition-colors rounded-md hover:bg-[#27272a]">
            <Bell className="h-4 w-4" />
          </button>
          <button className="p-2 text-[#a1a1aa] hover:text-[#e4e4e7] transition-colors rounded-md hover:bg-[#27272a]">
            <LinkIcon className="h-4 w-4" />
          </button>
          <button onClick={() => setShowSidebar(!showSidebar)} className={cn("p-2 transition-colors rounded-md", showSidebar ? "bg-[#27272a] text-[#e4e4e7]" : "text-[#a1a1aa] hover:text-[#e4e4e7] hover:bg-[#27272a]")}>
            <PanelRightOpen className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex">
        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto min-w-0">
          <Tabs value={activeTab} className="w-full">
            <TabsContent value="overview" className="m-0 border-0 focus-visible:ring-0">
              <div className="p-8 max-w-4xl mx-auto space-y-10 animate-fade-in">
                {/* Header Info */}
                <div className="space-y-4">
                  <div className="h-14 w-14 bg-[#27272a] rounded-xl flex items-center justify-center border border-[#3f3f46]/50 shadow-sm mb-4">
                    <Box className="h-7 w-7 text-[#e4e4e7]" />
                  </div>
                  <div className="space-y-1">
                    <input
                      type="text"
                      defaultValue={currentProject.name}
                      onBlur={(e) => {
                        if (e.target.value !== currentProject.name) {
                          handleUpdateProject({ name: e.target.value });
                        }
                      }}
                      className="text-3xl font-bold tracking-tight text-[#e4e4e7] bg-transparent border-none focus:ring-0 p-0 w-full"
                    />
                    <input
                      type="text"
                      placeholder="Add a short summary..."
                      defaultValue={currentProject.description}
                      onBlur={(e) => {
                        if (e.target.value !== currentProject.description) {
                          handleUpdateProject({ description: e.target.value });
                        }
                      }}
                      className="w-full bg-transparent border-none text-[#a1a1aa] placeholder:text-[#3f3f46] focus:ring-0 px-0 text-base p-0 h-auto font-normal focus-visible:ring-0 focus-visible:ring-offset-0"
                    />
                  </div>
                </div>

                {/* Properties Summary Row */}
                <div className="flex flex-wrap items-center gap-x-8 gap-y-4 text-sm">
                  <div className="flex items-center gap-3 group">
                    <span className="text-[#a1a1aa] w-20 shrink-0">Properties</span>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <div className="flex items-center gap-2 text-[#e4e4e7] hover:text-white px-2 py-1.5 rounded-md hover:bg-[#27272a] transition-all cursor-pointer group/prop">
                          <currentStatus.icon className={cn("h-4 w-4", currentStatus.color)} />
                          <span className="font-medium text-[13px]">{currentStatus.label}</span>
                        </div>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="bg-[#18181b] border-[#27272a] text-[#e4e4e7]">
                        {STATUS_OPTIONS.map((status) => (
                          <DropdownMenuItem
                            key={status.value}
                            onClick={() => handleUpdateProject({ status: status.value as Project['status'] })}
                            className="hover:bg-[#27272a] focus:bg-[#27272a] cursor-pointer"
                          >
                            <status.icon className={cn("h-3.5 w-3.5 mr-2", status.color)} />
                            {status.label}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <div className="flex items-center gap-2 text-[#a1a1aa] hover:text-[#e4e4e7] px-2 py-1.5 rounded-md hover:bg-[#27272a] transition-all cursor-pointer group/prop">
                          <currentPriority.icon className={cn("h-4 w-4", currentPriority.color)} />
                          <span className="text-[13px]">{currentPriority.label}</span>
                        </div>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="bg-[#18181b] border-[#27272a] text-[#e4e4e7]">
                        {PRIORITY_OPTIONS.map((priority) => (
                          <DropdownMenuItem
                            key={priority.value}
                            onClick={() => handleUpdateProject({ priority: priority.value as Project['priority'] })}
                            className="hover:bg-[#27272a] focus:bg-[#27272a] cursor-pointer"
                          >
                            <priority.icon className={cn("h-3.5 w-3.5 mr-2", priority.color)} />
                            {priority.label}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <div className="flex items-center gap-2 text-[#a1a1aa] hover:text-[#e4e4e7] px-2 py-1.5 rounded-md hover:bg-[#27272a] transition-all cursor-pointer group/prop">
                          <Avatar className="h-5 w-5">
                            <AvatarImage src={leadMember?.user?.avatar} />
                            <AvatarFallback className="text-[9px] bg-[#f59e0b] text-[#fef3c7]">
                              {leadMember?.user?.name?.[0] || 'L'}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-[13px]">{leadMember?.user?.name || 'Add lead'}</span>
                        </div>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="bg-[#18181b] border-[#27272a] text-[#e4e4e7]">
                        {currentProject.members?.filter(m => m?.user).map((member: any) => (
                          <DropdownMenuItem
                            key={member.user.id || member.user._id}
                            onClick={() => handleUpdateProject({ leadUserId: member.user.id || member.user._id })}
                            className="hover:bg-[#27272a] focus:bg-[#27272a] cursor-pointer"
                          >
                            <Avatar className="h-4 w-4 mr-2">
                              <AvatarImage src={member.user.avatar} />
                              <AvatarFallback className="text-[8px]">
                                {member.user.name?.[0]}
                              </AvatarFallback>
                            </Avatar>
                            {member.user.name}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>

                    <Popover>
                      <PopoverTrigger asChild>
                        <div className="flex items-center gap-2 text-[#a1a1aa] hover:text-[#e4e4e7] px-2 py-1.5 rounded-md hover:bg-[#27272a] transition-all cursor-pointer group/prop">
                          <CalendarPlus className="h-4 w-4" />
                          <span className="text-[13px]">{currentProject.targetDate ? format(new Date(currentProject.targetDate), 'MMM d, yyyy') : 'Target date'}</span>
                        </div>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 bg-[#18181b] border-[#27272a]" align="start">
                        <Calendar
                          mode="single"
                          selected={currentProject.targetDate ? new Date(currentProject.targetDate) : undefined}
                          onSelect={(date) => date && handleUpdateProject({ targetDate: date.toISOString() })}
                        />
                      </PopoverContent>
                    </Popover>

                    <div className="flex items-center gap-2 text-[#a1a1aa] hover:text-[#e4e4e7] px-2 py-1.5 rounded-md hover:bg-[#27272a] transition-all cursor-pointer group/prop">
                      <div className="h-4 w-4 bg-[#facc15] text-[#18181b] rounded flex items-center justify-center">
                        <User className="h-2.5 w-2.5 fill-current" />
                      </div>
                      <span className="text-[13px]">{currentProject.team?.name || 'No team'}</span>
                    </div>

                    <button className="flex items-center justify-center h-8 w-8 text-[#a1a1aa] hover:text-[#e4e4e7] hover:bg-[#27272a] rounded-md transition-colors">
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                  </div>

                  <div className="flex items-center gap-3 w-full">
                    <span className="text-[#a1a1aa] w-20 shrink-0">Resources</span>
                    <button className="flex items-center gap-2 text-[#a1a1aa] hover:text-[#e4e4e7] px-2 py-1.5 rounded-md hover:bg-[#27272a] transition-all cursor-pointer group/prop text-[13px]">
                      <Plus className="h-4 w-4" />
                      <span>Add document or link...</span>
                    </button>
                  </div>
                </div>

                {/* Main Actions */}
                <button
                  onClick={() => setActiveTab('updates')}
                  className="w-full h-12 rounded-lg border border-[#27272a] hover:bg-[#27272a]/40 text-[#a1a1aa] hover:text-[#e4e4e7] transition-all flex items-center justify-center gap-2 text-sm font-medium group"
                >
                  <FileEdit className="h-4 w-4 group-hover:scale-110 transition-transform" />
                  Write first project update
                </button>

                {/* Text Description Block */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-[#a1a1aa]">Description</h3>
                    <textarea
                      defaultValue={currentProject.description}
                      onBlur={(e) => {
                        if (e.target.value !== currentProject.description) {
                          handleUpdateProject({ description: e.target.value });
                        }
                      }}
                      placeholder="Add a detailed description..."
                      className="w-full bg-transparent border-none text-[#e4e4e7] leading-relaxed resize-none focus:ring-0 p-0 min-h-[60px]"
                    />
                  </div>

                  <button className="flex items-center gap-2 text-[#a1a1aa] hover:text-[#e4e4e7] text-sm transition-colors py-1.5 -ml-1 hover:bg-[#27272a] px-2 rounded-md">
                    <Plus className="h-4 w-4" />
                    Milestone
                  </button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="updates" className="h-full m-0 border-0 focus-visible:ring-0 overflow-y-auto">
              {projectId && <ActivityFeed projectId={projectId} />}
            </TabsContent>

            <TabsContent value="tasks" className="h-full m-0 border-0 focus-visible:ring-0">
              <KanbanBoard
                tasks={tasks}
                onTaskUpdate={handleTaskUpdate}
                onTaskMove={handleTaskMove}
                onTaskCreate={handleTaskCreate}
              />
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Sidebar - Properties & Activity */}
        {showSidebar && (
          <>
            {/* Mobile Overlay */}
            <div
              className="fixed inset-0 bg-black/50 z-30 lg:hidden"
              onClick={() => setShowSidebar(false)}
            />

            <div className={cn(
              "w-[300px] border-l border-[#27272a] bg-[#09090b] flex flex-col",
              "fixed inset-y-0 right-0 z-40 shadow-xl lg:relative lg:z-0 lg:shadow-none"
            )}>
              <div className="p-4 space-y-1 overflow-y-auto">

                {/* Properties Section */}
                <div className="mb-8 px-2">
                  <div className="flex items-center justify-between mb-4 group cursor-pointer">
                    <div className="flex items-center gap-1.5 text-[#a1a1aa] hover:text-[#e4e4e7] transition-colors">
                      <span className="text-sm font-medium">Properties</span>
                      <ChevronDown className="h-3.5 w-3.5" />
                    </div>
                    <Plus className="h-4 w-4 text-[#a1a1aa] hover:text-[#e4e4e7] transition-colors" />
                  </div>

                  <div className="space-y-0.5">
                    <PropertyRow label="Status">
                      <DropdownMenu>
                        <DropdownMenuTrigger className="flex items-center gap-2 text-[#e4e4e7] w-full text-left outline-none">
                          <currentStatus.icon className={cn("h-3.5 w-3.5", currentStatus.color)} />
                          <span className="text-[13px]">{currentStatus.label}</span>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="bg-[#18181b] border-[#27272a] text-[#e4e4e7]">
                          {STATUS_OPTIONS.map((status) => (
                            <DropdownMenuItem
                              key={status.value}
                              onClick={() => handleUpdateProject({ status: status.value as Project['status'] })}
                              className="hover:bg-[#27272a] focus:bg-[#27272a] cursor-pointer"
                            >
                              <status.icon className={cn("h-3.5 w-3.5 mr-2", status.color)} />
                              {status.label}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </PropertyRow>

                    <PropertyRow label="Priority">
                      <DropdownMenu>
                        <DropdownMenuTrigger className={cn(
                          "flex items-center gap-2 w-full text-left outline-none transition-colors",
                          currentPriority.value === 'NONE' ? "text-[#a1a1aa] hover:text-[#e4e4e7]" : "text-[#e4e4e7]"
                        )}>
                          <currentPriority.icon className={cn("h-3.5 w-3.5", currentPriority.color)} />
                          <span className="text-[13px]">{currentPriority.label}</span>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="bg-[#18181b] border-[#27272a] text-[#e4e4e7]">
                          {PRIORITY_OPTIONS.map((priority) => (
                            <DropdownMenuItem
                              key={priority.value}
                              onClick={() => handleUpdateProject({ priority: priority.value as Project['priority'] })}
                              className="hover:bg-[#27272a] focus:bg-[#27272a] cursor-pointer"
                            >
                              <priority.icon className={cn("h-3.5 w-3.5 mr-2", priority.color)} />
                              {priority.label}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </PropertyRow>

                    <PropertyRow label="Lead">
                      <DropdownMenu>
                        <DropdownMenuTrigger className={cn(
                          "flex items-center gap-2 w-full text-left outline-none transition-colors",
                          !leadMember ? "text-[#a1a1aa] hover:text-[#e4e4e7]" : "text-[#e4e4e7]"
                        )}>
                          <Avatar className="h-5 w-5">
                            <AvatarImage src={leadMember?.user?.avatar} />
                            <AvatarFallback className="text-[10px] bg-[#f59e0b] text-[#fef3c7]">
                              {leadMember?.user?.name?.[0] || 'L'}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-[13px]">{leadMember?.user?.name || 'Assign lead'}</span>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start" className="bg-[#18181b] border-[#27272a] text-[#e4e4e7]">
                          {currentProject.members?.filter(m => m?.user).map((member: any) => (
                            <DropdownMenuItem
                              key={member.user.id || member.user._id}
                              onClick={() => handleUpdateProject({ leadUserId: member.user.id || member.user._id })}
                              className="hover:bg-[#27272a] focus:bg-[#27272a] cursor-pointer"
                            >
                              <Avatar className="h-4 w-4 mr-2">
                                <AvatarImage src={member.user.avatar} />
                                <AvatarFallback className="text-[8px]">
                                  {member.user.name?.[0]}
                                </AvatarFallback>
                              </Avatar>
                              {member.user.name}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </PropertyRow>

                    <PropertyRow label="Members">
                      <div className="flex items-center gap-2 text-[#a1a1aa] group/item hover:text-[#e4e4e7]">
                        <Users className="h-3.5 w-3.5" />
                        <span className="text-[13px]">{currentProject.members?.length || 0} members</span>
                      </div>
                    </PropertyRow>

                    <PropertyRow label="Dates">
                      <Popover>
                        <PopoverTrigger className="flex items-center gap-1.5 text-[#a1a1aa] group/item hover:text-[#e4e4e7] w-full text-left outline-none">
                          <CalendarIcon className="h-3.5 w-3.5" />
                          <span className="text-[13px]">{currentProject.startDate ? format(new Date(currentProject.startDate), 'MMM d') : 'Start'}</span>
                          <ArrowRight className="h-3 w-3 mx-0.5 text-[#52525b]" />
                          <span className="text-[13px]">{currentProject.targetDate ? format(new Date(currentProject.targetDate), 'MMM d') : 'Target'}</span>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 bg-[#18181b] border-[#27272a]" align="start">
                          <div className="p-3 border-b border-[#27272a]">
                            <span className="text-xs font-medium text-[#71717a]">Target Date</span>
                          </div>
                          <Calendar
                            mode="single"
                            selected={currentProject.targetDate ? new Date(currentProject.targetDate) : undefined}
                            onSelect={(date) => date && handleUpdateProject({ targetDate: date.toISOString() })}
                          />
                        </PopoverContent>
                      </Popover>
                    </PropertyRow>
                    <PropertyRow label="Teams">
                      <div className="flex items-center gap-2 text-[#e4e4e7]">
                        <div className="h-4 w-4 bg-[#facc15]/20 text-[#facc15] rounded flex items-center justify-center text-[9px] font-bold">
                          {currentProject.team?.name?.[0] || 'T'}
                        </div>
                        <span className="text-[13px]">{currentProject.team?.name || 'No team'}</span>
                      </div>
                    </PropertyRow>
                    <PropertyRow label="Labels">
                      <div className="flex items-center gap-2 text-[#a1a1aa] group/item hover:text-[#e4e4e7]">
                        <Tag className="h-3.5 w-3.5" />
                        <span className="text-[13px]">Add label</span>
                      </div>
                    </PropertyRow>
                  </div>
                </div>

                {/* Milestones Section */}
                <div className="mb-8 px-2">
                  <div className="flex items-center justify-between mb-4 group cursor-pointer">
                    <div className="flex items-center gap-1.5 text-[#a1a1aa] hover:text-[#e4e4e7] transition-colors">
                      <span className="text-sm font-medium">Milestones</span>
                      <ChevronDown className="h-3.5 w-3.5" />
                    </div>
                    <Plus className="h-4 w-4 text-[#a1a1aa] hover:text-[#e4e4e7] transition-colors" />
                  </div>
                  <p className="text-xs text-[#52525b] leading-relaxed">
                    Add milestones to organize work within your project and break it into more granular stages. <span className="text-[#e4e4e7] underline cursor-pointer">Learn more</span>
                  </p>
                </div>

                {/* Activity Section */}
                <div className="flex-1 overflow-hidden flex flex-col min-h-0 px-2">
                  <div className="flex items-center justify-between mb-4 group cursor-pointer shrink-0">
                    <div className="flex items-center gap-1.5 text-[#a1a1aa] hover:text-[#e4e4e7] transition-colors">
                      <span className="text-sm font-medium">Activity</span>
                      <ChevronDown className="h-3.5 w-3.5" />
                    </div>
                    <span className="text-xs text-[#a1a1aa] hover:text-[#e4e4e7] transition-colors" onClick={() => setActiveTab('updates')}>See all</span>
                  </div>
                  <div className="space-y-4 px-2 overflow-y-auto flex-1 pb-4">
                    {projectId && <ActivityFeed projectId={projectId} limit={5} showTitle={false} />}
                  </div>
                </div>

              </div>
            </div>
          </>
        )}
      </div>
    </div >
  );
}

function PropertyRow({ label, children }: { label: string, children: React.ReactNode }) {
  return (
    <div className="flex items-center min-h-[32px] hover:bg-[#27272a]/50 rounded px-2 -mx-2 transition-colors group cursor-pointer">
      <span className="w-24 text-sm text-[#71717a] shrink-0 font-medium">{label}</span>
      <div className="flex-1 text-sm min-w-0 pr-2">
        {children}
      </div>
    </div>
  );
}

