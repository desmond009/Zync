# Zync Frontend - Enterprise Collaboration Platform

## 🎨 UI/UX Philosophy

Zync follows modern enterprise design principles inspired by Linear, Notion, and Asana:

- **Clean & Minimal** - Focus on content, not decoration
- **Consistent** - Predictable patterns throughout
- **Responsive** - Works on all screen sizes
- **Fast** - Smooth animations, optimized performance
- **Accessible** - Keyboard shortcuts, ARIA labels

## 🏗️ Architecture

### Tech Stack
- **React 18** - UI library
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Smooth animations
- **Zustand** - State management
- **React Router** - Navigation
- **Socket.io** - Real-time updates

### Directory Structure

```
src/
├── components/
│   ├── landing/          # Landing page components
│   ├── auth/             # Authentication UI
│   ├── teams/            # Team management
│   │   ├── TeamCard.jsx
│   │   ├── MemberCard.jsx
│   │   ├── InviteMemberModal.jsx
│   │   ├── CreateTeamModal.jsx
│   │   ├── JoinTeamModal.jsx
│   │   └── TeamSettings.jsx
│   ├── projects/         # Project workspace
│   │   ├── KanbanBoard.jsx      ✨ NEW
│   │   ├── ProjectChat.jsx      ✨ NEW
│   │   └── ActivityFeed.jsx     ✨ NEW
│   └── ui/               # Reusable UI components
│
├── layouts/
│   └── DashboardLayout.jsx   ✅ IMPROVED
│
├── pages/
│   ├── Dashboard.jsx
│   ├── Projects.jsx
│   ├── ProjectWorkspace.jsx  ✨ NEW
│   ├── Teams.jsx
│   └── TeamDetail.jsx        ✅ REDESIGNED
│
├── store/
│   ├── authStore.js
│   ├── projectStore.js
│   ├── teamStore.js
│   └── taskStore.js          ✨ NEW
│
├── services/
│   ├── api.js           # REST API client
│   └── socket.js        # Socket.io client
│
└── lib/
    └── utils.js         # Helper functions
```

## 🎯 Key Features

### 1. Dashboard Layout
- **Team Switcher** - Quick switch between personal and team workspaces
- **Smart Navigation** - Active state indicators, badge counters
- **Command Palette** - ⌘K for quick search
- **Dark Mode** - Full support with smooth transitions

### 2. Team Management
- **Table View** - Professional data display for members
- **Inline Editing** - Quick role changes via dropdown
- **Real-time Status** - Online indicators for active members
- **Invite System** - Email invites + shareable invite codes

### 3. Project Workspace
- **Kanban Board** - Visual task management
  - 4 columns: To Do, In Progress, Review, Done
  - Priority badges (Urgent, High, Medium, Low)
  - Assignee avatars
  - Due dates, comments, attachments
  
- **Team Chat** - Real-time messaging
  - Message bubbles with avatars
  - Typing indicators
  - Read receipts
  - File attachments support
  
- **Activity Feed** - Comprehensive audit log
  - All project activities
  - Timeline view with date dividers
  - Filter by activity type

### 4. Real-time Features
- Online presence indicators
- Typing indicators in chat
- Live activity updates
- Socket.io integration ready

## 🎨 Design System

### Colors

```jsx
// Primary
bg-indigo-600    // Main actions
bg-indigo-700    // Hover states

// Status
bg-green-600     // Success
bg-amber-600     // Warning
bg-rose-600      // Error
bg-blue-600      // Info

// Neutrals (Light Mode)
bg-white         // Cards, panels
bg-slate-50      // Background
text-slate-900   // Headings
text-slate-600   // Body text

// Neutrals (Dark Mode)
bg-slate-900     // Background
bg-slate-800     // Cards, panels
text-white       // Headings
text-slate-400   // Body text
```

### Typography

```jsx
// Headings
text-2xl font-bold    // Page titles (H1)
text-xl font-semibold // Section titles (H2)
text-lg font-medium   // Subsections (H3)

// Body
text-sm               // Default body text
text-xs               // Metadata, labels
```

### Spacing

```jsx
// Component padding
p-6              // Large cards
p-4              // Medium cards
p-3              // Small cards

// Element spacing
gap-6            // Large gaps
gap-4            // Medium gaps
gap-2            // Small gaps
```

### Borders & Shadows

```jsx
// Borders
border border-slate-200 dark:border-slate-700
rounded-lg              // 8px
rounded-md              // 6px

// Shadows
shadow-sm               // Subtle elevation
shadow-md               // Medium elevation
shadow-lg               // High elevation
```

## 🚀 Routes

```
/                           → Landing Page
/login                      → Login
/signup                     → Sign Up

/app
  /dashboard                → Main dashboard
  /projects                 → Projects list
  /projects/:projectId      → Project workspace
    → Tasks tab             → Kanban board
    → Chat tab              → Team chat
    → Activity tab          → Activity feed
    → Files tab             → File manager
  /teams                    → Teams list
  /teams/:teamId            → Team detail
  /tasks                    → All tasks view
  /chat                     → Direct messages
```

## 🔧 State Management

### Auth Store (`authStore.js`)
```jsx
- user                    // Current user data
- isAuthenticated         // Auth status
- login(email, password)  // Login action
- register(userData)      // Register action
- logout()                // Logout action
```

### Team Store (`teamStore.js`)
```jsx
- teams                   // All teams
- currentTeam             // Active team
- teamMembers             // Current team members
- fetchTeams()            // Get all teams
- inviteMemberByEmail()   // Send invitation
- updateMemberRole()      // Change member role
- removeMember()          // Remove team member
```

### Project Store (`projectStore.js`)
```jsx
- projects                // All projects
- currentProject          // Active project
- fetchProjects()         // Get all projects
- createProject()         // Create new project
- updateProject()         // Update project
- deleteProject()         // Delete project
```

### Task Store (`taskStore.js`)
```jsx
- tasks                   // All tasks
- currentTask             // Active task
- fetchTasks()            // Get tasks (with filters)
- createTask()            // Create new task
- updateTask()            // Update task
- deleteTask()            // Delete task
- assignTask()            // Assign to user
```

## 🎮 Keyboard Shortcuts

```
⌘K / Ctrl+K          Command Palette (Quick search)
Shift+Enter          New line in chat (Enter sends message)
Esc                  Close modals/dropdowns
```

## 📱 Responsive Design

### Breakpoints
```jsx
sm: 640px           // Mobile landscape
md: 768px           // Tablet
lg: 1024px          // Desktop
xl: 1280px          // Large desktop
```

### Layout Behavior
- **Mobile** (< 768px): Collapsed sidebar, stacked cards
- **Tablet** (768-1024px): Sidebar toggle, 2-column grid
- **Desktop** (> 1024px): Fixed sidebar, 3-column grid

## 🔌 API Integration

### Base Configuration
```jsx
// services/api.js
const API_URL = 'http://localhost:3000/api/v1';

// All endpoints
- /auth/*           Authentication
- /users/*          User management
- /teams/*          Team operations
- /projects/*       Project CRUD
- /tasks/*          Task management
- /notifications/*  Notifications
```

### Socket.io Events
```jsx
// services/socket.js

// Team events
socket.on('team:member-added')
socket.on('team:member-removed')
socket.on('team:updated')

// Project events
socket.on('project:updated')
socket.on('project:member-added')

// Task events
socket.on('task:created')
socket.on('task:updated')
socket.on('task:completed')

// Chat events
socket.on('message:new')
socket.on('user:typing')
socket.on('user:online')
socket.on('user:offline')
```

## 🧪 Testing

### Component Testing
```bash
# Run tests
npm test

# Run with coverage
npm run test:coverage
```

### E2E Testing
```bash
# Cypress
npm run cypress:open
```

## 🚀 Deployment

### Build
```bash
npm run build
```

### Preview
```bash
npm run preview
```

### Environment Variables
```env
VITE_API_URL=https://api.zync.app
VITE_SOCKET_URL=https://socket.zync.app
VITE_CLOUDINARY_CLOUD_NAME=your-cloud-name
```

## 📚 Component Usage

### KanbanBoard
```jsx
import { KanbanBoard } from '@/components/projects';

<KanbanBoard projectId={projectId} />
```

### ProjectChat
```jsx
import { ProjectChat } from '@/components/projects';

<ProjectChat projectId={projectId} />
```

### ActivityFeed
```jsx
import { ActivityFeed } from '@/components/projects';

<ActivityFeed projectId={projectId} />
```

## 🎓 Best Practices

### 1. Component Structure
- Keep components small and focused
- Use composition over inheritance
- Extract reusable logic to hooks

### 2. State Management
- Use Zustand for global state
- Use React state for local UI state
- Use React Query for server state (future)

### 3. Styling
- Prefer Tailwind utilities
- Use `cn()` helper for conditional classes
- Create reusable component variants

### 4. Performance
- Use React.memo for expensive components
- Implement virtual scrolling for long lists
- Lazy load routes and heavy components

### 5. Accessibility
- Use semantic HTML
- Add ARIA labels
- Support keyboard navigation
- Test with screen readers

## 🐛 Troubleshooting

### Common Issues

**Issue:** Sidebar not showing
**Solution:** Check `isSidebarOpen` state in localStorage

**Issue:** Socket connection fails
**Solution:** Verify `VITE_SOCKET_URL` in .env

**Issue:** Tailwind styles not applying
**Solution:** Run `npm run build:css`

**Issue:** Dark mode not working
**Solution:** Check `dark` class on `<html>` element

## 📝 Code Style

### Naming Conventions
```jsx
// Components: PascalCase
const ProjectCard = () => {}

// Functions: camelCase
const handleSubmit = () => {}

// Constants: UPPER_SNAKE_CASE
const API_BASE_URL = 'https://api.zync.app';

// CSS classes: kebab-case
<div className="project-card">
```

### File Organization
```jsx
// Imports order
1. React & external libraries
2. Internal components
3. Utils & helpers
4. Types & constants
5. Styles (if any)
```

## 🔐 Security

- All API calls include JWT tokens
- XSS protection via React
- CSRF tokens for mutations
- Sanitize user input
- Validate all forms

## 🌐 Internationalization (Future)

```jsx
// Structure prepared for i18n
import { useTranslation } from 'react-i18next';

const { t } = useTranslation();
<h1>{t('dashboard.welcome')}</h1>
```

## 📊 Analytics (Future)

```jsx
// Track user actions
analytics.track('project_created', {
  projectId,
  teamId,
  timestamp: Date.now()
});
```

---

## 🎉 Getting Started

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Start dev server**
   ```bash
   npm run dev
   ```

3. **Open browser**
   ```
   http://localhost:5173
   ```

4. **Login**
   - Use your credentials or create an account
   - Explore the dashboard, projects, and teams

---

**Built with ❤️ by the Zync Team**

For questions or support, reach out on GitHub or email support@zync.app
