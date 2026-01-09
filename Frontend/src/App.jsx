import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/authStore';
import { SocketProvider } from './contexts/SocketContext';

// Landing Page
import { LandingPage } from './components/landing';

// Layouts
import { DashboardLayout } from './layouts/DashboardLayout';

// Auth pages
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';
import LoginPage from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage';

// Main pages
import { Dashboard } from './pages/Dashboard';
import { Projects } from './pages/Projects';
import { ProjectWorkspace } from './pages/ProjectWorkspace';
import { Teams } from './pages/Teams';
import { TeamDetail } from './pages/TeamDetail';

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
        
        {/* Auth routes - Old versions */}
        <Route path="/login-old" element={<Login />} />
        <Route path="/register-old" element={<Register />} />

        {/* Auth routes - New modern versions */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        {/* Protected routes */}
        <Route
          path="/app"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/app/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="projects" element={<Projects />} />
          <Route path="projects/:projectId" element={<ProjectWorkspace />} />
          <Route path="teams" element={<Teams />} />
          <Route path="teams/:teamId" element={<TeamDetail />} />
          <Route path="tasks" element={<div className="glass rounded-2xl p-8"><h1 className="text-3xl font-bold gradient-text">Tasks (Coming Soon)</h1></div>} />
          <Route path="chat" element={<div className="glass rounded-2xl p-8"><h1 className="text-3xl font-bold gradient-text">Chat (Coming Soon)</h1></div>} />
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
