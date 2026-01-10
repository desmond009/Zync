import { useState } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { motion, AnimatePresence } from 'framer-motion';
import { Button, Modal, Input, Avatar, Badge } from '@/components/ui';
import { useProjectWorkspaceStore } from '@/store/projectWorkspaceStore';
import { getInitials, formatDate } from '@/lib/utils';

const COLUMNS = [
  { id: 'TODO', label: 'To Do', color: 'slate' },
  { id: 'IN_PROGRESS', label: 'In Progress', color: 'blue' },
  { id: 'DONE', label: 'Done', color: 'green' },
];

export const TasksView = () => {
  const {
    tasks,
    taskOrder,
    members,
    createTask,
    updateTask,
    moveTask,
    deleteTask,
    isLoadingTasks,
  } = useProjectWorkspaceStore();
  
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [activeId, setActiveId] = useState(null);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'MEDIUM',
    assigneeId: '',
  });
  
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  
  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };
  
  const handleDragEnd = async (event) => {
    const { active, over } = event;
    setActiveId(null);
    
    if (!over) return;
    
    const taskId = active.id;
    const overId = over.id;
    
    let newStatus = null;
    
    if (overId.startsWith('column-')) {
      newStatus = overId.replace('column-', '');
    } else {
      for (const [status, taskIds] of Object.entries(taskOrder)) {
        if (taskIds.includes(overId)) {
          newStatus = status;
          break;
        }
      }
    }
    
    if (!newStatus) return;
    
    const task = tasks[taskId];
    if (!task || task.status === newStatus) return;
    
    const newIndex = taskOrder[newStatus].indexOf(overId);
    const targetIndex = newIndex >= 0 ? newIndex : taskOrder[newStatus].length;
    
    try {
      await moveTask(taskId, newStatus, targetIndex);
    } catch (error) {
      console.error('Failed to move task:', error);
    }
  };
  
  const handleCreateTask = async () => {
    if (!newTask.title.trim()) return;
    
    try {
      await createTask(newTask);
      setIsCreateModalOpen(false);
      setNewTask({
        title: '',
        description: '',
        priority: 'MEDIUM',
        assigneeId: '',
      });
    } catch (error) {
      console.error('Failed to create task:', error);
    }
  };
  
  const handleUpdateTask = async (taskId, updates) => {
    try {
      await updateTask(taskId, updates);
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  };
  
  const handleDeleteTask = async (taskId) => {
    if (!confirm('Are you sure you want to delete this task?')) return;
    
    try {
      await deleteTask(taskId);
      setSelectedTask(null);
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
  };
  
  if (isLoadingTasks) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-400">Loading tasks...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Tasks</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Manage and track project tasks
            </p>
          </div>
          <Button onClick={() => setIsCreateModalOpen(true)} size="lg">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Task
          </Button>
        </div>
      </div>
      
      <div className="flex-1 overflow-x-auto p-6">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-6 h-full min-w-max">
            {COLUMNS.map((column) => (
              <KanbanColumn
                key={column.id}
                column={column}
                tasks={tasks}
                taskOrder={taskOrder}
                onTaskClick={setSelectedTask}
              />
            ))}
          </div>
          
          <DragOverlay>
            {activeId && tasks[activeId] ? (
              <TaskCard task={tasks[activeId]} isDragging />
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>
      
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Task"
      >
        <div className="space-y-4">
          <Input
            label="Title"
            placeholder="Task title"
            value={newTask.title}
            onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
            autoFocus
          />
          
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Description
            </label>
            <textarea
              className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
              rows="3"
              placeholder="Task description"
              value={newTask.description}
              onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Priority
            </label>
            <select
              className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
              value={newTask.priority}
              onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Assignee
            </label>
            <select
              className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
              value={newTask.assigneeId}
              onChange={(e) => setNewTask({ ...newTask, assigneeId: e.target.value })}
            >
              <option value="">Unassigned</option>
              {members.map((member) => (
                <option key={member._id || member.id} value={member.userId?._id || member.userId?.id}>
                  {member.userId?.firstName} {member.userId?.lastName}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex gap-3 pt-4">
            <Button
              variant="ghost"
              className="flex-1"
              onClick={() => setIsCreateModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              className="flex-1"
              onClick={handleCreateTask}
              disabled={!newTask.title.trim()}
            >
              Create Task
            </Button>
          </div>
        </div>
      </Modal>
      
      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onUpdate={handleUpdateTask}
          onDelete={handleDeleteTask}
        />
      )}
    </div>
  );
};

const KanbanColumn = ({ column, tasks, taskOrder, onTaskClick }) => {
  const { setNodeRef, isOver } = useSortable({
    id: `column-${column.id}`,
    data: { type: 'column', status: column.id },
  });
  
  const taskIds = taskOrder[column.id] || [];
  
  return (
    <div className="flex flex-col w-80">
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-slate-900 dark:text-white">
            {column.label}
          </h3>
          <Badge variant="default" className="text-xs">
            {taskIds.length}
          </Badge>
        </div>
        <div className={`h-1 bg-${column.color}-500 rounded-full`} />
      </div>
      
      <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
        <div
          ref={setNodeRef}
          className={`flex-1 space-y-3 p-3 rounded-xl transition-colors min-h-[200px] ${
            isOver
              ? 'bg-indigo-50 dark:bg-indigo-900/20 border-2 border-indigo-300 dark:border-indigo-700'
              : 'bg-slate-100 dark:bg-slate-800/50 border-2 border-transparent'
          }`}
        >
          {taskIds.map((taskId) => {
            const task = tasks[taskId];
            if (!task) return null;
            
            return (
              <SortableTaskCard
                key={taskId}
                task={task}
                onClick={() => onTaskClick(task)}
              />
            );
          })}
        </div>
      </SortableContext>
    </div>
  );
};

const SortableTaskCard = ({ task, onClick }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task._id || task.id,
    data: { type: 'task', task },
  });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };
  
  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
    >
      <TaskCard task={task} />
    </div>
  );
};

const TaskCard = ({ task }) => {
  return (
    <div className="glass p-4 rounded-lg cursor-pointer hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-2">
        <Badge
          variant={
            task.priority === 'HIGH'
              ? 'error'
              : task.priority === 'MEDIUM'
              ? 'warning'
              : 'default'
          }
          className="text-xs"
        >
          {task.priority}
        </Badge>
        
        {task.assignee && (
          <Avatar
            src={task.assignee.avatar}
            fallback={getInitials(task.assignee.name)}
            size="xs"
          />
        )}
      </div>
      
      <h4 className="font-semibold text-slate-900 dark:text-white mb-1 line-clamp-2">
        {task.title}
      </h4>
      
      {task.description && (
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-3 line-clamp-2">
          {task.description}
        </p>
      )}
      
      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <span>{formatDate(task.createdAt)}</span>
        {task.commentsCount > 0 && (
          <div className="flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            {task.commentsCount}
          </div>
        )}
      </div>
    </div>
  );
};

const TaskDetailModal = ({ task, onClose, onUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTask, setEditedTask] = useState(task);
  
  const handleSave = async () => {
    await onUpdate(task._id || task.id, editedTask);
    setIsEditing(false);
  };
  
  return (
    <Modal isOpen={true} onClose={onClose} title="Task Details" size="lg">
      <div className="space-y-4">
        {isEditing ? (
          <>
            <Input
              label="Title"
              value={editedTask.title}
              onChange={(e) => setEditedTask({ ...editedTask, title: e.target.value })}
            />
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Description
              </label>
              <textarea
                className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                rows="4"
                value={editedTask.description}
                onChange={(e) => setEditedTask({ ...editedTask, description: e.target.value })}
              />
            </div>
          </>
        ) : (
          <>
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                {task.title}
              </h3>
              <p className="text-slate-600 dark:text-slate-400">
                {task.description || 'No description'}
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-slate-500 dark:text-slate-400">Status</span>
                <p className="font-medium text-slate-900 dark:text-white">{task.status}</p>
              </div>
              <div>
                <span className="text-sm text-slate-500 dark:text-slate-400">Priority</span>
                <p className="font-medium text-slate-900 dark:text-white">{task.priority}</p>
              </div>
            </div>
          </>
        )}
        
        <div className="flex gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
          {isEditing ? (
            <>
              <Button variant="ghost" className="flex-1" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button className="flex-1" onClick={handleSave}>
                Save Changes
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" className="flex-1" onClick={() => setIsEditing(true)}>
                Edit
              </Button>
              <Button
                variant="ghost"
                className="flex-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                onClick={() => onDelete(task._id || task.id)}
              >
                Delete
              </Button>
            </>
          )}
        </div>
      </div>
    </Modal>
  );
};
