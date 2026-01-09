# Migration Guide: Updating Existing Components

This guide shows how to update your existing components to use the new real-time system.

---

## Before & After Examples

### Example 1: Project Workspace Component

#### BEFORE (Old Pattern)
```jsx
// ❌ OLD - Don't use this pattern anymore
import { socketService } from '@/services/socket';

function ProjectWorkspace() {
  const { projectId } = useParams();
  const { fetchTasks, tasks } = useTaskStore();

  useEffect(() => {
    // Fetch initial data
    fetchTasks({ projectId });

    // OLD socket pattern
    socketService.joinProject(projectId);
    socketService.onTaskCreate((task) => {
      // Manually add to state
      // ❌ Not idempotent, no validation
    });

    return () => {
      socketService.leaveProject(projectId);
    };
  }, [projectId]);

  return <div>{/* ... */}</div>;
}
```

#### AFTER (New Pattern)
```jsx
// ✅ NEW - Use this pattern
import { useTaskEvents, useProjectRoom } from '@/hooks/useSocketEvents';
import { ConnectionStatus } from '@/components/ui/ConnectionStatus';

function ProjectWorkspace() {
  const { projectId } = useParams();
  const { fetchTasks, tasks } = useTaskStore();

  // Fetch initial state from REST API
  useEffect(() => {
    if (projectId) {
      fetchTasks({ projectId });
    }
  }, [projectId, fetchTasks]);

  // Real-time updates (auto cleanup on unmount)
  useProjectRoom(projectId);  // Auto join/leave
  useTaskEvents(projectId);   // Subscribe to events

  return (
    <div>
      <ConnectionStatus />
      {/* ... */}
    </div>
  );
}
```

**Changes:**
- ✅ Use `useProjectRoom()` instead of manual join/leave
- ✅ Use `useTaskEvents()` instead of manual listeners
- ✅ Add `<ConnectionStatus />` for user feedback
- ✅ Automatic cleanup - no need to track subscriptions
- ✅ Built-in validation and deduplication

---

### Example 2: Task Creation

#### BEFORE (Old Pattern)
```jsx
// ❌ OLD
const handleCreateTask = async (taskData) => {
  try {
    const response = await tasksAPI.createTask(taskData);
    // Manually add to state
    setTasks([...tasks, response.data.task]);
    toast.success('Task created');
  } catch (error) {
    toast.error('Failed to create task');
  }
};
```

#### AFTER (New Pattern)
```jsx
// ✅ NEW
const { createTask } = useTaskStore();

const handleCreateTask = async (taskData) => {
  const task = await createTask(taskData);
  // Store handles everything:
  // - Optimistic update
  // - API request
  // - Rollback on failure
  // - Success toast
  
  if (task) {
    console.log('Task created:', task._id);
  }
};
```

**Changes:**
- ✅ Use store method instead of direct API call
- ✅ Optimistic updates built-in
- ✅ Automatic rollback on failure
- ✅ Error handling built-in

---

### Example 3: Task Update

#### BEFORE (Old Pattern)
```jsx
// ❌ OLD
const handleUpdateTask = async (taskId, updates) => {
  // Optimistic update
  setTasks(tasks.map(t => 
    t._id === taskId ? { ...t, ...updates } : t
  ));

  try {
    await tasksAPI.updateTask(taskId, updates);
  } catch (error) {
    // Manual rollback
    fetchTasks({ projectId });
    toast.error('Failed to update');
  }
};
```

#### AFTER (New Pattern)
```jsx
// ✅ NEW
const { updateTask } = useTaskStore();

const handleUpdateTask = async (taskId, updates) => {
  await updateTask(taskId, updates);
  // Store handles:
  // - Optimistic update
  // - API request
  // - Automatic rollback on failure
  // - Success/error toasts
};
```

---

### Example 4: Listening to Events

#### BEFORE (Old Pattern)
```jsx
// ❌ OLD
useEffect(() => {
  const handleTaskCreated = (task) => {
    setTasks(prev => [...prev, task]); // No validation
  };

  socketService.onTaskCreate(handleTaskCreated);

  return () => {
    // No cleanup - listener stays forever
  };
}, []);
```

#### AFTER (New Pattern)
```jsx
// ✅ NEW
useTaskEvents(projectId);
// That's it! Hook handles:
// - Event validation
// - Deduplication
// - Project filtering
// - State updates
// - Automatic cleanup
```

---

### Example 5: Connection Status

#### BEFORE (Old Pattern)
```jsx
// ❌ OLD - No connection status shown
function App() {
  return <div>{/* No feedback to user */}</div>;
}
```

#### AFTER (New Pattern)
```jsx
// ✅ NEW
import { ConnectionStatus } from '@/components/ui/ConnectionStatus';

function App() {
  return (
    <div>
      <ConnectionStatus />
      {/* User sees reconnection status */}
    </div>
  );
}
```

---

## Complete Migration Checklist

### Phase 1: Update App.jsx
- [x] Wrap with `<SocketProvider>`
- [x] Remove old `socketService.connect()` calls
- [x] Add `<ConnectionStatus />` to layout

### Phase 2: Update Stores
- [x] Add optimistic update logic to `createTask()`
- [x] Add optimistic update logic to `updateTask()`
- [x] Add socket event handlers:
  - [x] `addTaskFromSocket()`
  - [x] `updateTaskFromSocket()`
  - [x] `removeTaskFromSocket()`

### Phase 3: Update Components
- [ ] Replace `socketService.joinProject()` with `useProjectRoom()`
- [ ] Replace `socketService.onTaskCreate()` with `useTaskEvents()`
- [ ] Replace direct API calls with store methods
- [ ] Add `<ConnectionStatus />` to main layout

### Phase 4: Remove Old Code
- [ ] Delete old `src/services/socket.js` (optional - keep for reference)
- [ ] Remove any manual socket listeners
- [ ] Remove manual state updates from socket events

---

## Component-by-Component Migration

### ProjectWorkspace.jsx
```jsx
// Find this:
import { socketService } from '@/services/socket';

// Replace with:
import { useTaskEvents, useProjectRoom, useChatEvents } from '@/hooks/useSocketEvents';
import { ConnectionStatus } from '@/components/ui/ConnectionStatus';

// Find these useEffect hooks:
useEffect(() => {
  socketService.joinProject(projectId);
  socketService.onTaskCreate(...);
  // ... more listeners
  return () => socketService.leaveProject(projectId);
}, [projectId]);

// Replace with:
useProjectRoom(projectId);
useTaskEvents(projectId);
useChatEvents(projectId);

// Add to JSX:
<ConnectionStatus />
```

### TaskBoard.jsx
```jsx
// Find:
const handleCreateTask = async (data) => {
  const response = await tasksAPI.createTask(data);
  setTasks([...tasks, response.data.task]);
};

// Replace with:
const { createTask } = useTaskStore();
const handleCreateTask = async (data) => {
  await createTask(data);
};
```

### TaskCard.jsx
```jsx
// Find:
const handleUpdateTask = async (updates) => {
  await tasksAPI.updateTask(taskId, updates);
  // manual state update
};

// Replace with:
const { updateTask } = useTaskStore();
const handleUpdateTask = async (updates) => {
  await updateTask(taskId, updates);
};
```

---

## Testing After Migration

### Test 1: Real-time Updates
1. Open project in 2 browser tabs
2. Create task in Tab 1
3. ✅ Should appear in Tab 2 immediately

### Test 2: Optimistic Updates
1. Create task
2. ✅ Should appear immediately with "Saving..." indicator
3. ✅ Indicator should disappear when saved

### Test 3: Network Issues
1. Open DevTools Network tab
2. Set throttling to "Offline"
3. Try creating task
4. ✅ Should see "Reconnecting..." status
5. Set back to "Online"
6. ✅ Should reconnect and work normally

### Test 4: Navigation
1. Navigate between projects
2. ✅ Should only see events for active project
3. ✅ No duplicate events

---

## Common Migration Errors

### Error: "useSocket must be used within SocketProvider"
**Cause:** Missing `<SocketProvider>` in App.jsx  
**Fix:** Wrap your app with `<SocketProvider>`

```jsx
// App.jsx
import { SocketProvider } from './contexts/SocketContext';

function App() {
  return (
    <SocketProvider>
      <Routes>...</Routes>
    </SocketProvider>
  );
}
```

### Error: Tasks duplicating on socket events
**Cause:** Using old manual socket listeners alongside new hooks  
**Fix:** Remove all old `socketService.*` calls

### Error: "Cannot read property 'emit' of null"
**Cause:** Trying to emit before socket connects  
**Fix:** Use `isConnected` check

```jsx
const { isConnected, emit } = useSocket();

if (isConnected) {
  emit('task:create', data);
}
```

---

## Rollback Plan (If Issues)

If you need to rollback:

1. Keep old `src/services/socket.js` file
2. Revert `App.jsx` changes
3. Remove `useSocketEvents` imports
4. Re-add old socket listeners

However, the new system is more robust, so rollback should not be needed.

---

## Need Help?

### Review These Files
1. `Frontend/REALTIME_INTEGRATION_GUIDE.md` - Complete guide
2. `Frontend/REALTIME_QUICK_START.md` - Quick reference
3. `src/components/examples/ProjectWorkspaceRealtime.jsx` - Working example

### Debug Checklist
- [ ] Is `<SocketProvider>` wrapping your app?
- [ ] Is socket connected? (Check console logs)
- [ ] Are you using `useProjectRoom()` to join rooms?
- [ ] Are you using store methods instead of direct API calls?
- [ ] Did you remove old socket listeners?

---

**Migration Status:** Ready to proceed  
**Estimated Time:** 1-2 hours for full migration  
**Risk Level:** Low (new system is backwards compatible)
