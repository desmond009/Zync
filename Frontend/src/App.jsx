import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/authStore';
import { SocketProvider } from './contexts/SocketContext';

// Landing Page
import { LandingPage } from './components/landing';

// Layouts
import { DashboardLayout } from './layouts/DashboardLayout';
import { EnhancedDashboardLayout } from './layouts/EnhancedDashboardLayout';
import { ProjectWorkspaceLayout } from './layouts/ProjectWorkspaceLayout';

// Auth pages
import AuthPage from './pages/AuthPage';

// Main pages
import { Dashboard } from './pages/Dashboard';
import { Projects } from './pages/Projects';
import { ProjectWorkspace } from './pages/ProjectWorkspace';
import { Teams } from './pages/Teams';
import { TeamDetail } from './pages/TeamDetail';
import { LayoutDemo } from './pages/LayoutDemo';

// Project views
import { TasksView } from './components/projects/TasksView';
import { ChatView } from './components/projects/ChatView';
import { FilesView } from './components/projects/FilesView';
import { ActivityView } from './components/projects/ActivityView';

// Protected Route wrapper
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center gradient-bg">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

function App() {
  const { initialize } = useAuthStore();

  useEffect(() => {
    initialize();
  }, []);

  return (
    <SocketProvider>
      <Routes>
        {/* Landing Page */}
        <Route path="/" element={<LandingPage />} />
        
        {/* Auth routes - Modern authentication screens */}
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/login" element={<Navigate to="/auth" replace />} />
        <Route path="/signup" element={<Navigate to="/auth" replace />} />

        {/* Protected routes - Enhanced Layout */}
        <Route
          path="/app"
          element={
            <ProtectedRoute>
              <EnhancedDashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/app/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="projects" element={<Projects />} />
          <Route path="teams" element={<Teams />} />
          <Route path="teams/:teamId" element={<TeamDetail />} />
          <Route path="demo" element={<LayoutDemo />} />
        </Route>

        {/* Protected routes - Old Layout (for comparison) */}
        <Route
          path="/app-old"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/app-old/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="projects" element={<Projects />} />
          <Route path="teams" element={<Teams />} />
          <Route path="teams/:teamId" element={<TeamDetail />} />
        </Route>

        {/* Project Workspace - Separate layout for project views */}
        <Route
          path="/app/projects/:projectId"
          element={
            <ProtectedRoute>
              <ProjectWorkspaceLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="tasks" replace />} />
          <Route path="tasks" element={<TasksView />} />
          <Route path="chat" element={<ChatView />} />
          <Route path="files" element={<FilesView />} />
          <Route path="activity" element={<ActivityView />} />
        </Route>

        {/* Fallback: redirect /dashboard to /app/dashboard */}
        <Route path="/dashboard" element={<Navigate to="/app/dashboard" replace />} />

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      {/* Toast notifications */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(226, 232, 240, 0.8)',
            borderRadius: '12px',
            padding: '16px',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
    </SocketProvider>
  );
}

export default App;
