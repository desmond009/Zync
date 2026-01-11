import { useState } from 'react';
import { Task } from '@/lib/api';
import { Plus, MoreHorizontal, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface KanbanBoardProps {
  tasks: Task[];
  onTaskUpdate: (taskId: string, updates: Partial<Task>) => Promise<void>;
  onTaskMove: (taskId: string, status: string, position: number) => Promise<void>;
  onTaskCreate: (task: Partial<Task>) => Promise<Task>;
}

const COLUMNS = [
  { id: 'backlog', label: 'Backlog', color: 'bg-muted' },
  { id: 'todo', label: 'To Do', color: 'bg-blue-500/10' },
  { id: 'in_progress', label: 'In Progress', color: 'bg-yellow-500/10' },
  { id: 'review', label: 'Review', color: 'bg-purple-500/10' },
  { id: 'done', label: 'Done', color: 'bg-green-500/10' },
];

const PRIORITY_COLORS = {
  low: 'bg-muted text-muted-foreground',
  medium: 'bg-blue-500/10 text-blue-700',
  high: 'bg-orange-500/10 text-orange-700',
  urgent: 'bg-red-500/10 text-red-700',
};

export default function KanbanBoard({
  tasks,
  onTaskUpdate,
  onTaskMove,
  onTaskCreate,
}: KanbanBoardProps) {
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [createInColumn, setCreateInColumn] = useState<string>('todo');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const getTasksByStatus = (status: string) => {
    return tasks
      .filter((task) => task.status === status)
      .sort((a, b) => a.position - b.position);
  };

  const handleDragStart = (e: React.DragEvent, task: Task) => {
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    if (!draggedTask || draggedTask.status === columnId) {
      setDraggedTask(null);
      return;
    }

    const tasksInColumn = getTasksByStatus(columnId);
    const newPosition = tasksInColumn.length;

    onTaskMove(draggedTask.id, columnId, newPosition);
    setDraggedTask(null);
  };

  const handleCreateTask = async () => {
    if (!newTaskTitle.trim()) return;

    setIsCreating(true);
    try {
      await onTaskCreate({
        title: newTaskTitle,
        description: newTaskDescription,
        status: createInColumn as Task['status'],
        priority: 'medium',
        position: getTasksByStatus(createInColumn).length,
      });
      setNewTaskTitle('');
      setNewTaskDescription('');
      setIsCreateDialogOpen(false);
    } catch (error) {
      console.error('Failed to create task:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const openCreateDialog = (columnId: string) => {
    setCreateInColumn(columnId);
    setIsCreateDialogOpen(true);
  };

  return (
    <div className="h-full overflow-x-auto p-6">
      <div className="flex gap-4 h-full min-w-max">
        {COLUMNS.map((column) => {
          const columnTasks = getTasksByStatus(column.id);

          return (
            <div
              key={column.id}
              className="w-72 flex flex-col bg-secondary/30 rounded-xl"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, column.id)}
            >
              {/* Column Header */}
              <div className="p-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={cn('h-2 w-2 rounded-full', column.color.replace('/10', ''))} />
                  <h3 className="font-medium text-sm">{column.label}</h3>
                  <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                    {columnTasks.length}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => openCreateDialog(column.id)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {/* Tasks */}
              <div className="flex-1 overflow-y-auto px-2 pb-2 space-y-2">
                {columnTasks.map((task) => (
                  <Card
                    key={task.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, task)}
                    className={cn(
                      'cursor-grab active:cursor-grabbing border-border/50 hover:border-primary/30 hover:shadow-soft transition-all group',
                      draggedTask?.id === task.id && 'opacity-50'
                    )}
                  >
                    <CardContent className="p-3">
                      <div className="flex items-start gap-2">
                        <GripVertical className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p className="font-medium text-sm leading-tight">
                              {task.title}
                            </p>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                                >
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>Edit</DropdownMenuItem>
                                <DropdownMenuItem className="text-destructive">
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>

                          {task.description && (
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                              {task.description}
                            </p>
                          )}

                          <div className="flex items-center gap-2 mt-3">
                            <Badge
                              variant="secondary"
                              className={cn('text-xs', PRIORITY_COLORS[task.priority])}
                            >
                              {task.priority}
                            </Badge>

                            {task.assignee && (
                              <Avatar className="h-5 w-5 ml-auto">
                                <AvatarImage src={task.assignee.avatar} />
                                <AvatarFallback className="text-[10px]">
                                  {task.assignee.name
                                    .split(' ')
                                    .map((n) => n[0])
                                    .join('')}
                                </AvatarFallback>
                              </Avatar>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}

                {columnTasks.length === 0 && (
                  <div className="h-20 border-2 border-dashed border-border/50 rounded-lg flex items-center justify-center">
                    <p className="text-xs text-muted-foreground">Drop tasks here</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Task Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create Task</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="Task title..."
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Add a description..."
                value={newTaskDescription}
                onChange={(e) => setNewTaskDescription(e.target.value)}
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleCreateTask}
                disabled={!newTaskTitle.trim() || isCreating}
                className="gradient-primary"
              >
                {isCreating ? 'Creating...' : 'Create Task'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
