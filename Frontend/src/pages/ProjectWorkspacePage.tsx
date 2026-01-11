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
import { MessageSquare, Activity, Paperclip, LayoutList } from 'lucide-react';
import { Loader2 } from 'lucide-react';

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

  // Socket event handlers for real-time updates
  useSocketEvent<Task>('task.created', (task) => {
    setTasks((prev) => [...prev, task]);
  }, []);

  useSocketEvent<Task>('task.updated', (updatedTask) => {
    setTasks((prev) =>
      prev.map((task) => (task.id === updatedTask.id ? updatedTask : task))
    );
  }, []);

  useSocketEvent<{ taskId: string; status: string; position: number }>(
    'task.moved',
    (data) => {
      setTasks((prev) =>
        prev.map((task) =>
          task.id === data.taskId
            ? { ...task, status: data.status as Task['status'], position: data.position }
            : task
        )
      );
    },
    []
  );

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
    if (!projectId) return;
    
    try {
      const newTask = await tasksApi.create(projectId, taskData);
      // Task will be added via socket event
      return newTask;
    } catch (error) {
      console.error('Failed to create task:', error);
      throw error;
    }
  };

  if (projectLoading || !currentProject) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col">
      {/* Project Header */}
      <div className="px-6 py-4 border-b border-border bg-card/50">
        <h1 className="text-2xl font-bold">{currentProject.name}</h1>
        {currentProject.description && (
          <p className="text-muted-foreground mt-1">{currentProject.description}</p>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Kanban Board */}
        <div className="flex-1 overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <KanbanBoard
              tasks={tasks}
              onTaskUpdate={handleTaskUpdate}
              onTaskMove={handleTaskMove}
              onTaskCreate={handleTaskCreate}
            />
          )}
        </div>

        {/* Right Panel */}
        <div className="w-80 border-l border-border bg-card/30 flex flex-col">
          <Tabs defaultValue="chat" className="flex-1 flex flex-col">
            <TabsList className="mx-4 mt-4 grid grid-cols-4">
              <TabsTrigger value="chat" className="gap-1">
                <MessageSquare className="h-4 w-4" />
              </TabsTrigger>
              <TabsTrigger value="activity" className="gap-1">
                <Activity className="h-4 w-4" />
              </TabsTrigger>
              <TabsTrigger value="files" className="gap-1">
                <Paperclip className="h-4 w-4" />
              </TabsTrigger>
              <TabsTrigger value="details" className="gap-1">
                <LayoutList className="h-4 w-4" />
              </TabsTrigger>
            </TabsList>

            <TabsContent value="chat" className="flex-1 overflow-hidden m-0">
              <ChatPanel projectId={projectId!} />
            </TabsContent>

            <TabsContent value="activity" className="flex-1 overflow-hidden m-0">
              <ActivityFeed projectId={projectId!} />
            </TabsContent>

            <TabsContent value="files" className="flex-1 overflow-hidden m-0">
              <FilesList projectId={projectId!} />
            </TabsContent>

            <TabsContent value="details" className="flex-1 overflow-auto p-4 m-0">
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Team</p>
                  <p className="font-medium">{currentProject.team?.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Members</p>
                  <p className="font-medium">{currentProject.memberCount} members</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Tasks</p>
                  <p className="font-medium">{tasks.length} total</p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
