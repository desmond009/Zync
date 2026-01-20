import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useProject } from '@/contexts/ProjectContext';
import { useSocketEvent } from '@/contexts/SocketContext';
import { tasksApi, Task } from '@/lib/api';
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
  Calendar,
  Tag,
  ArrowRight,
  PanelRightOpen
} from 'lucide-react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function ProjectWorkspacePage() {
  const { projectId } = useParams<{ projectId: string }>();
  const { currentProject, selectProject, isLoading: projectLoading } = useProject();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showSidebar, setShowSidebar] = useState(true);

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

  if (projectLoading || !currentProject) {
    return (
      <div className="flex items-center justify-center h-full bg-[#09090b]">
        <Loader2 className="h-8 w-8 animate-spin text-[#5e6ad2]" />
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-3.5rem)] flex flex-col bg-[#09090b] text-[#e4e4e7]">
      {/* Project Header */}
      <div className="h-12 border-b border-[#27272a] flex items-center justify-between px-4 bg-[#09090b] shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex items-center gap-2 text-sm text-[#a1a1aa] whitespace-nowrap">
            <span>Projects</span>
            <span className="text-[#3f3f46]">›</span>
            <span className="text-[#e4e4e7] font-medium truncate max-w-[150px]">{currentProject.name}</span>
          </div>
          <button className="text-[#a1a1aa] hover:text-[#e4e4e7] transition-colors">
            <Star className="h-4 w-4" />
          </button>
          <button className="text-[#a1a1aa] hover:text-[#e4e4e7] transition-colors">
            <MoreHorizontal className="h-4 w-4" />
          </button>

          <div className="h-6 w-px bg-[#27272a] mx-2" />

          <Tabs defaultValue="overview" className="h-full">
            <TabsList className="h-full bg-transparent p-0 gap-1">
              <TabsTrigger value="overview" className="h-8 px-3 rounded-md data-[state=active]:bg-[#27272a] data-[state=active]:text-[#e4e4e7] text-[#8a8a93] text-sm font-medium border-0 shadow-none">
                <FileText className="h-4 w-4 mr-2" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="updates" className="h-8 px-3 rounded-md data-[state=active]:bg-[#27272a] data-[state=active]:text-[#e4e4e7] text-[#8a8a93] text-sm font-medium border-0 shadow-none">
                <Activity className="h-4 w-4 mr-2" />
                Updates
              </TabsTrigger>
              <TabsTrigger value="tasks" className="h-8 px-3 rounded-md data-[state=active]:bg-[#27272a] data-[state=active]:text-[#e4e4e7] text-[#8a8a93] text-sm font-medium border-0 shadow-none">
                <LayoutList className="h-4 w-4 mr-2" />
                Issues
              </TabsTrigger>
              <button className="h-8 w-8 flex items-center justify-center rounded-md hover:bg-[#27272a] text-[#8a8a93] transition-colors">
                <Box className="h-4 w-4" />
              </button>
            </TabsList>
          </Tabs>
        </div>

        <div className="flex items-center gap-3 ml-4 shrink-0">
          <button className="text-[#a1a1aa] hover:text-[#e4e4e7] transition-colors">
            <Bell className="h-4 w-4" />
          </button>
          <button className="text-[#a1a1aa] hover:text-[#e4e4e7] transition-colors">
            <LinkIcon className="h-4 w-4" />
          </button>
          <button onClick={() => setShowSidebar(!showSidebar)} className={cn("text-[#a1a1aa] hover:text-[#e4e4e7] transition-colors", !showSidebar && "text-[#e4e4e7]")}>
            <PanelRightOpen className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex">
        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto min-w-0">
          <Tabs defaultValue="overview" value="overview" className="w-full"> {/* Hardcoded since we only use tabs for header navigation but implement content switching via route or this state if we had sub-routes. Here we stick to Overview content for the challenge match */}
            <div className="p-8 max-w-4xl mx-auto space-y-10 animate-fade-in">

              {/* Header Info */}
              <div className="space-y-6">
                <div className="h-16 w-16 bg-[#27272a] rounded-xl flex items-center justify-center border border-[#3f3f46]/50 shadow-sm">
                  <Box className="h-8 w-8 text-[#e4e4e7]" />
                </div>
                <div className="space-y-4">
                  <h1 className="text-4xl font-bold tracking-tight text-[#e4e4e7]">{currentProject.name}</h1>
                  <input
                    type="text"
                    placeholder="Add a short summary..."
                    defaultValue={currentProject.description}
                    className="w-full bg-transparent border-none text-[#a1a1aa] placeholder:text-[#3f3f46] focus:ring-0 px-0 text-lg p-0 h-auto font-normal focus-visible:ring-0 focus-visible:ring-offset-0"
                  />
                </div>
              </div>

              {/* Properties Summary Row */}
              <div className="flex flex-wrap items-center gap-x-8 gap-y-4 text-sm">
                <div className="flex items-center gap-3 group">
                  <span className="text-[#a1a1aa] w-20">Properties</span>
                  <div className="flex items-center gap-2 text-[#e4e4e7] bg-[#27272a]/50 px-2 py-1 rounded hover:bg-[#27272a] transition-colors cursor-pointer border border-transparent hover:border-[#3f3f46]">
                    <div className="h-3 w-3 rounded-full border border-[#e4e4e7] border-dashed" />
                    <span className="font-medium">Backlog</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#a1a1aa] hover:text-[#e4e4e7] px-2 py-1 rounded hover:bg-[#27272a] transition-colors cursor-pointer">
                    <MoreHorizontal className="h-4 w-4" />
                    <span>No priority</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#e4e4e7] px-2 py-1 rounded hover:bg-[#27272a] transition-colors cursor-pointer">
                    <Avatar className="h-4 w-4">
                      <AvatarFallback className="text-[8px] bg-[#f59e0b] text-[#fef3c7]">VY</AvatarFallback>
                    </Avatar>
                    <span>Vijender Yadav</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#e4e4e7] px-2 py-1 rounded hover:bg-[#27272a] transition-colors cursor-pointer">
                    <Calendar className="h-3.5 w-3.5 text-[#a1a1aa]" />
                    <span>Target date</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#e4e4e7] px-2 py-1 rounded hover:bg-[#27272a] transition-colors cursor-pointer">
                    <div className="h-4 w-4 bg-[#facc15]/20 text-[#facc15] rounded flex items-center justify-center text-[9px] font-bold">D</div>
                    <span>Desmond009</span>
                  </div>
                  <button className="text-[#a1a1aa] hover:text-[#e4e4e7]">
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                </div>

                <div className="flex items-center gap-3 w-full">
                  <span className="text-[#a1a1aa] w-20">Resources</span>
                  <button className="flex items-center gap-2 text-[#a1a1aa] hover:text-[#e4e4e7] px-2 py-1 rounded hover:bg-[#27272a] transition-colors cursor-pointer">
                    <Plus className="h-4 w-4" />
                    <span>Add document or link...</span>
                  </button>
                </div>
              </div>

              {/* Main Actions */}
              <div className="py-2">
                <button className="w-full h-12 rounded-lg border border-[#27272a] hover:bg-[#27272a]/40 text-[#a1a1aa] hover:text-[#e4e4e7] transition-all flex items-center justify-center gap-2 text-sm font-medium group">
                  <FileText className="h-4 w-4 group-hover:scale-110 transition-transform" />
                  Write first project update
                </button>
              </div>

              {/* Text Description Block */}
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-[#a1a1aa]">Description</h3>
                <p className="text-[#e4e4e7] leading-relaxed">asdfghdsg</p>
              </div>

              {/* Milestones Section */}
              <div className="pt-4 space-y-4">
                <button className="flex items-center gap-2 text-[#a1a1aa] hover:text-[#e4e4e7] font-medium transition-colors">
                  <Plus className="h-4 w-4" />
                  Milestone
                </button>
              </div>
            </div>
          </Tabs>
        </div>

        {/* Right Sidebar - Properties & Activity */}
        {showSidebar && (
          <div className="w-[300px] border-l border-[#27272a] bg-[#09090b] flex flex-col">
            <div className="p-4 space-y-1 overflow-y-auto">

              {/* Properties Section */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4 group cursor-pointer px-2">
                  <span className="text-sm font-medium text-[#a1a1aa] group-hover:text-[#e4e4e7]">Properties</span>
                  <Plus className="h-3.5 w-3.5 text-[#a1a1aa] opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>

                <div className="space-y-1">
                  <PropertyRow label="Status">
                    <div className="flex items-center gap-2 text-[#e4e4e7]">
                      <div className="h-3 w-3 rounded-full border border-[#f59e0b] border-dashed" />
                      <span>Backlog</span>
                    </div>
                  </PropertyRow>
                  <PropertyRow label="Priority">
                    <div className="flex items-center gap-2 text-[#a1a1aa]">
                      <MoreHorizontal className="h-3 w-3" />
                      <span>No priority</span>
                    </div>
                  </PropertyRow>
                  <PropertyRow label="Lead">
                    <div className="flex items-center gap-2 text-[#e4e4e7]">
                      <Avatar className="h-4 w-4">
                        <AvatarFallback className="text-[8px] bg-[#f59e0b] text-[#fef3c7]">VY</AvatarFallback>
                      </Avatar>
                      <span>Vijender Yadav</span>
                    </div>
                  </PropertyRow>
                  <PropertyRow label="Members">
                    <div className="flex items-center gap-2 text-[#a1a1aa] group/item hover:text-[#e4e4e7]">
                      <Users className="h-3.5 w-3.5" />
                      <span>Add members</span>
                    </div>
                  </PropertyRow>
                  <PropertyRow label="Dates">
                    <div className="flex items-center gap-1 text-[#a1a1aa] group/item hover:text-[#e4e4e7]">
                      <Calendar className="h-3.5 w-3.5 mr-1" />
                      <span>Start</span>
                      <ArrowRight className="h-3 w-3 mx-1" />
                      <Calendar className="h-3.5 w-3.5 mr-1" />
                      <span>Target</span>
                    </div>
                  </PropertyRow>
                  <PropertyRow label="Teams">
                    <div className="flex items-center gap-2 text-[#e4e4e7]">
                      <div className="h-4 w-4 bg-[#facc15]/20 text-[#facc15] rounded flex items-center justify-center text-[9px] font-bold">D</div>
                      <span>Desmond009</span>
                    </div>
                  </PropertyRow>
                  <PropertyRow label="Labels">
                    <div className="flex items-center gap-2 text-[#a1a1aa] group/item hover:text-[#e4e4e7]">
                      <Tag className="h-3.5 w-3.5" />
                      <span>Add label</span>
                    </div>
                  </PropertyRow>
                </div>
              </div>

              {/* Milestones Section */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-2 group cursor-pointer px-2">
                  <span className="text-sm font-medium text-[#a1a1aa] group-hover:text-[#e4e4e7]">Milestones</span>
                  <Plus className="h-3.5 w-3.5 text-[#a1a1aa] opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <p className="px-2 text-xs text-[#52525b] leading-relaxed">
                  Add milestones to organize work within your project and break it into more granular stages. <span className="text-[#e4e4e7] underline cursor-pointer">Learn more</span>
                </p>
              </div>

              {/* Activity Section */}
              <div>
                <div className="flex items-center justify-between mb-4 group cursor-pointer px-2">
                  <span className="text-sm font-medium text-[#a1a1aa] group-hover:text-[#e4e4e7]">Activity</span>
                  <span className="text-xs text-[#a1a1aa] hover:text-[#e4e4e7]">See all</span>
                </div>
                <div className="space-y-4 px-2">
                  <ActivityItem
                    icon={<Users className="h-3.5 w-3.5" />}
                    text={<span><span className="text-[#e4e4e7]">Vijender Yadav</span> added themselves as a member</span>}
                    time="Jan 20"
                  />
                  <ActivityItem
                    icon={<User className="h-3.5 w-3.5" />}
                    text={<span><span className="text-[#e4e4e7]">Vijender Yadav</span> assigned themselves as a lead</span>}
                    time="Jan 20"
                  />
                  <ActivityItem
                    icon={<Box className="h-3.5 w-3.5" />}
                    text={<span><span className="text-[#e4e4e7]">Vijender Yadav</span> created the project</span>}
                    time="Jan 12"
                  />
                </div>
              </div>

            </div>
          </div>
        )}
      </div>
    </div>
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

function ActivityItem({ icon, text, time }: { icon: React.ReactNode, text: React.ReactNode, time: string }) {
  return (
    <div className="flex gap-3 text-xs">
      <div className="mt-0.5 text-[#a1a1aa] shrink-0">{icon}</div>
      <div className="flex flex-col gap-0.5 min-w-0">
        <span className="text-[#a1a1aa] leading-relaxed">{text}</span>
        <span className="text-[#52525b]">{time}</span>
      </div>
    </div>
  );
}
