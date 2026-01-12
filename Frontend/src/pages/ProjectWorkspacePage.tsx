import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useProject } from '@/contexts/ProjectContext';
import { useSocketEvent } from '@/contexts/SocketContext';
import { tasksApi, Task } from '@/lib/api';
import KanbanBoard from '@/components/project/KanbanBoard';
import ChatPanel from '@/components/project/ChatPanel';
import ActivityFeed from '@/components/project/ActivityFeed';
import FilesList from '@/components/project/FilesList';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  MessageSquare,
  Activity,
  Paperclip,
  LayoutList,
  Box,
  MoreHorizontal,
  Star,
  Bell,
  Link as LinkIcon,
  Maximize2,
  FileText,
  Clock,
  Plus,
  Circle,
  AlertCircle,
  User,
  Users,
  Calendar,
  Tag,
  CheckCircle2
} from 'lucide-react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function ProjectWorkspacePage() {
  const { projectId } = useParams<{ projectId: string }>();
  const { currentProject, selectProject, isLoading: projectLoading } = useProject();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load project and tasks
  useEffect(() => {
    if (projectId && (!currentProject || currentProject.id !== projectId)) {
      selectProject(projectId);
    }
  }, [projectId, currentProject, selectProject]);

  const loadTasks = useCallback(async () => {
    if (!projectId) return;

    setIsLoading(true);
    try {
      const fetchedTasks = await tasksApi.list(projectId);
      setTasks(fetchedTasks);
    } catch (error) {
      console.error('Failed to load tasks:', error);
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    if (currentProject) {
      loadTasks();
    }
  }, [currentProject, loadTasks]);

  // Socket event handlers (omitted for brevity, keep existing logic)
  useSocketEvent<Task>('task.created', (task) => setTasks((prev) => [...prev, task]), []);
  useSocketEvent<Task>('task.updated', (updatedTask) => setTasks((prev) => prev.map((t) => (t.id === updatedTask.id ? updatedTask : t))), []);

  // Handle optimistic task updates
  const handleTaskUpdate = async (taskId: string, updates: Partial<Task>) => {
    // Optimistic update
    const previousTasks = tasks;
    setTasks((prev) =>
      prev.map((task) => (task.id === taskId ? { ...task, ...updates } : task))
    );

    try {
      await tasksApi.update(taskId, updates);
    } catch (error) {
      // Revert on error
      setTasks(previousTasks);
      console.error('Failed to update task:', error);
    }
  };

  const handleTaskMove = async (taskId: string, status: string, position: number) => {
    // Optimistic update
    const previousTasks = tasks;
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId
          ? { ...task, status: status as Task['status'], position }
          : task
      )
    );

    try {
      await tasksApi.move(taskId, status, position);
    } catch (error) {
      // Revert on error
      setTasks(previousTasks);
      console.error('Failed to move task:', error);
    }
  };

  const handleTaskCreate = async (taskData: Partial<Task>) => {
    if (!projectId) throw new Error("Project ID is missing");

    try {
      // @ts-ignore - api signature mismatch workaround
      const newTask = await tasksApi.create({ projectId, ...taskData });
      // Task will be added via socket event
      return newTask;
    } catch (error) {
      console.error('Failed to create task:', error);
      throw error;
    }
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
      {/* Project Header - Linear Style */}
      <div className="h-14 border-b border-[#27272a] flex items-center justify-between px-6 bg-[#09090b]">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-[#a1a1aa]">
            <span>Projects</span>
            <span className="text-[#3f3f46]">›</span>
            <span className="flex items-center gap-2 text-[#e4e4e7] font-medium">
              <Box className="h-4 w-4" />
              {currentProject.name}
            </span>
          </div>
          <button className="text-[#a1a1aa] hover:text-[#e4e4e7] transition-colors">
            <Star className="h-4 w-4" />
          </button>
          <button className="text-[#a1a1aa] hover:text-[#e4e4e7] transition-colors">
            <MoreHorizontal className="h-4 w-4" />
          </button>
        </div>

        {/* Navigation Tabs (Overview, Updates, Issues) */}
        <Tabs defaultValue="overview" className="h-14">
          <TabsList className="h-full bg-transparent p-0 gap-1">
            <TabsTrigger value="overview" className="h-8 px-3 rounded-md data-[state=active]:bg-[#27272a] data-[state=active]:text-[#e4e4e7] text-[#8a8a93] text-sm font-medium border-0 shadow-none">
              <FileText className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="tasks" className="h-8 px-3 rounded-md data-[state=active]:bg-[#27272a] data-[state=active]:text-[#e4e4e7] text-[#8a8a93] text-sm font-medium border-0 shadow-none">
              <LayoutList className="h-4 w-4 mr-2" />
              Issues
            </TabsTrigger>
            <TabsTrigger value="updates" className="h-8 px-3 rounded-md data-[state=active]:bg-[#27272a] data-[state=active]:text-[#e4e4e7] text-[#8a8a93] text-sm font-medium border-0 shadow-none">
              <Activity className="h-4 w-4 mr-2" />
              Updates
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex items-center gap-3">
          <button className="p-1.5 rounded hover:bg-[#27272a] text-[#a1a1aa] transition-colors">
            <Bell className="h-4 w-4" />
          </button>
          <button className="p-1.5 rounded hover:bg-[#27272a] text-[#a1a1aa] transition-colors">
            <LinkIcon className="h-4 w-4" />
          </button>
          <div className="w-px h-4 bg-[#27272a]" />
          <button className="p-1.5 rounded hover:bg-[#27272a] text-[#a1a1aa] transition-colors">
            <Maximize2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Main Content Area - Split View */}
      <div className="flex-1 overflow-hidden flex">
        {/* Center Panel */}
        <div className="flex-1 overflow-y-auto min-w-0 border-r border-[#27272a]">
          {/* Using Tabs to switch main view */}
          <Tabs defaultValue="overview" className="w-full">
            <TabsContent value="overview" className="m-0 p-8 max-w-3xl mx-auto space-y-8 animate-fade-in">

              {/* Hero Section */}
              <div className="space-y-6">
                <div className="h-16 w-16 bg-[#27272a] rounded-lg border border-[#3f3f46] flex items-center justify-center">
                  <Box className="h-8 w-8 text-[#a1a1aa]" />
                </div>
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tight">{currentProject.name}</h1>
                  <input
                    type="text"
                    placeholder="Add a short summary..."
                    className="w-full bg-transparent border-none text-[#a1a1aa] placeholder:text-[#3f3f46] focus:ring-0 px-0 text-lg"
                  />
                </div>
              </div>

              {/* Quick Properties Row */}
              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2 group cursor-pointer">
                  <div className="h-4 w-4 rounded-full border border-[#a1a1aa] border-dashed text-[#a1a1aa] flex items-center justify-center">
                    <Circle className="h-2.5 w-2.5" />
                  </div>
                  <span className="font-medium text-[#e4e4e7]">Backlog</span>
                </div>
                <div className="flex items-center gap-2 text-[#a1a1aa] group cursor-pointer hover:text-[#e4e4e7] transition-colors">
                  <AlertCircle className="h-4 w-4" />
                  <span>No priority</span>
                </div>
                <div className="flex items-center gap-2 text-[#a1a1aa] group cursor-pointer hover:text-[#e4e4e7] transition-colors">
                  <User className="h-4 w-4" />
                  <span>Lead</span>
                </div>
                <div className="flex items-center gap-2 text-[#a1a1aa] group cursor-pointer hover:text-[#e4e4e7] transition-colors">
                  <Calendar className="h-4 w-4" />
                  <span>Target date</span>
                </div>
                <div className="flex items-center gap-2 text-[#a1a1aa] group cursor-pointer hover:text-[#e4e4e7] transition-colors">
                  <Avatar className="h-5 w-5">
                    <AvatarFallback className="text-[9px] bg-[#5e6ad2] text-white">D</AvatarFallback>
                  </Avatar>
                  <span>Desmond009</span>
                </div>
              </div>

              {/* Resources Section */}
              <div className="pt-2">
                <button className="flex items-center gap-2 text-sm text-[#a1a1aa] hover:text-[#e4e4e7] transition-colors">
                  <Plus className="h-4 w-4" />
                  Add document or link...
                </button>
              </div>

              {/* Project Update Button */}
              <button className="w-full py-3 rounded-lg border border-[#27272a] hover:bg-[#27272a]/50 text-[#a1a1aa] hover:text-[#e4e4e7] transition-colors flex items-center justify-center gap-2 text-sm font-medium">
                <FileText className="h-4 w-4" />
                Write first project update
              </button>

              {/* Description */}
              <div className="pt-8 space-y-4">
                <h3 className="text-sm font-medium text-[#a1a1aa]">Description</h3>
                <div className="min-h-[100px] text-[#e4e4e7]">
                  {currentProject.description || "No description provided."}
                </div>
              </div>

              {/* Milestones */}
              <div className="pt-8 space-y-4">
                <button className="flex items-center gap-2 text-sm text-[#a1a1aa] hover:text-[#e4e4e7] transition-colors">
                  <Plus className="h-4 w-4" />
                  Milestone
                </button>
              </div>

            </TabsContent>

            <TabsContent value="tasks" className="h-full m-0 p-0">
              <KanbanBoard tasks={tasks} onTaskUpdate={handleTaskUpdate} onTaskMove={handleTaskMove} onTaskCreate={handleTaskCreate} />
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Sidebar - Properties */}
        <div className="w-80 border-l border-[#27272a] bg-[#09090b] p-5 space-y-8 hidden xl:block">
          {/* Properties List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between group">
              <span className="text-xs font-medium text-[#a1a1aa]">Status</span>
              <div className="flex items-center gap-2 text-sm text-[#e4e4e7] hover:bg-[#27272a] px-2 py-1 -mr-2 rounded cursor-pointer transition-colors">
                <div className="h-3 w-3 rounded-full border border-[#e4e4e7] border-dashed" />
                Backlog
              </div>
            </div>
            <div className="flex items-center justify-between group">
              <span className="text-xs font-medium text-[#a1a1aa]">Priority</span>
              <div className="flex items-center gap-2 text-sm text-[#a1a1aa] hover:text-[#e4e4e7] hover:bg-[#27272a] px-2 py-1 -mr-2 rounded cursor-pointer transition-colors">
                <MoreHorizontal className="h-3 w-3" />
                No priority
              </div>
            </div>
            <div className="flex items-center justify-between group">
              <span className="text-xs font-medium text-[#a1a1aa]">Lead</span>
              <div className="flex items-center gap-2 text-sm text-[#a1a1aa] hover:text-[#e4e4e7] hover:bg-[#27272a] px-2 py-1 -mr-2 rounded cursor-pointer transition-colors">
                <User className="h-3 w-3" />
                Add lead
              </div>
            </div>
            <div className="flex items-center justify-between group">
              <span className="text-xs font-medium text-[#a1a1aa]">Members</span>
              <div className="flex items-center gap-2 text-sm text-[#a1a1aa] hover:text-[#e4e4e7] hover:bg-[#27272a] px-2 py-1 -mr-2 rounded cursor-pointer transition-colors">
                <Users className="h-3 w-3" />
                Add members
              </div>
            </div>
            <div className="flex items-center justify-between group">
              <span className="text-xs font-medium text-[#a1a1aa]">Dates</span>
              <div className="flex items-center gap-2 text-sm text-[#a1a1aa] hover:text-[#e4e4e7] hover:bg-[#27272a] px-2 py-1 -mr-2 rounded cursor-pointer transition-colors">
                <Calendar className="h-3 w-3" />
                Start
                <ArrowRightIcon className="h-3 w-3 mx-1" />
                Target
              </div>
            </div>
            <div className="flex items-center justify-between group">
              <span className="text-xs font-medium text-[#a1a1aa]">Teams</span>
              <div className="flex items-center gap-2 text-sm text-[#e4e4e7] hover:bg-[#27272a] px-2 py-1 -mr-2 rounded cursor-pointer transition-colors">
                <div className="h-4 w-4 rounded bg-[#f59e0b]/20 text-[#f59e0b] flex items-center justify-center text-[10px] font-bold">D</div>
                Desmond009
              </div>
            </div>
            <div className="flex items-center justify-between group">
              <span className="text-xs font-medium text-[#a1a1aa]">Labels</span>
              <div className="flex items-center gap-2 text-sm text-[#a1a1aa] hover:text-[#e4e4e7] hover:bg-[#27272a] px-2 py-1 -mr-2 rounded cursor-pointer transition-colors">
                <Tag className="h-3 w-3" />
                Add label
              </div>
            </div>
          </div>

          <div className="w-full h-px bg-[#27272a]" />

          {/* Milestones */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[#e4e4e7]">Milestones</span>
              <Plus className="h-3 w-3 text-[#a1a1aa] cursor-pointer hover:text-[#e4e4e7]" />
            </div>
            <p className="text-xs text-[#71717a]">
              Add milestones to organize work within your project and break it into more granular stages.
            </p>
          </div>

          <div className="w-full h-px bg-[#27272a]" />

          {/* Activity */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-[#e4e4e7]">Activity</span>
              <span className="text-xs text-[#a1a1aa] hover:text-[#e4e4e7] cursor-pointer">See all</span>
            </div>
            <ActivityFeed projectId={projectId} limit={3} />
          </div>

        </div>
      </div>
    </div>
  );
}

// Helper icon
function ArrowRightIcon({ className }: { className?: string }) {
  return (
    <svg className={className} width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6.1584 3.13508C6.35985 2.94621 6.67627 2.95642 6.86514 3.15788L10.6151 7.15788C10.7954 7.3502 10.7954 7.64949 10.6151 7.84182L6.86514 11.8418C6.67627 12.0433 6.35985 12.0535 6.1584 11.8646C5.95694 11.6757 5.94673 11.3593 6.1356 11.1579L9.565 7.49985L6.1356 3.84182C5.94673 3.64036 5.95694 3.32394 6.1584 3.13508Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path></svg>
  );
}
