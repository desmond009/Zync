import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { SocketProvider } from "@/contexts/SocketContext";
import { TeamProvider } from "@/contexts/TeamContext";
import { ProjectProvider } from "@/contexts/ProjectContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import PublicRoute from "@/components/auth/PublicRoute";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import DashboardLayout from "./components/layout/DashboardLayout";
import DashboardPage from "./pages/DashboardPage";
import ProjectsPage from "./pages/ProjectsPage";
import ProjectWorkspacePage from "./pages/ProjectWorkspacePage";
import TeamPage from "./pages/TeamPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <SocketProvider>
        <TeamProvider>
          <ProjectProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Routes>
                  {/* Public routes */}
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
                  <Route path="/signup" element={<PublicRoute><SignupPage /></PublicRoute>} />

                  {/* Protected dashboard routes */}
                  <Route
                    path="/dashboard"
                    element={
                      <ProtectedRoute>
                        <DashboardLayout />
                      </ProtectedRoute>
                    }
                  >
                    <Route index element={<DashboardPage />} />
                    <Route path="projects" element={<ProjectsPage />} />
                    <Route path="projects/:projectId" element={<ProjectWorkspacePage />} />
                    <Route path="team" element={<TeamPage />} />
                    <Route path="settings" element={<DashboardPage />} />
                  </Route>

                  {/* Catch-all */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </TooltipProvider>
          </ProjectProvider>
        </TeamProvider>
      </SocketProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
