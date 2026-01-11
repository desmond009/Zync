import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { projectsApi, Project, ProjectDetails } from '@/lib/api';
import { useTeam } from './TeamContext';
import { useSocket } from './SocketContext';

interface ProjectContextType {
  projects: Project[];
  currentProject: ProjectDetails | null;
  isLoading: boolean;
  error: string | null;
  selectProject: (projectId: string) => Promise<void>;
  clearProject: () => void;
  refreshProjects: () => Promise<void>;
}

const ProjectContext = createContext<ProjectContextType | null>(null);

export function ProjectProvider({ children }: { children: React.ReactNode }) {
  const { currentTeam } = useTeam();
  const { joinProjectRoom, leaveProjectRoom, currentRoom } = useSocket();
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProject, setCurrentProject] = useState<ProjectDetails | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshProjects = useCallback(async () => {
    if (!currentTeam) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const fetchedProjects = await projectsApi.list();
      // Filter projects by current team if backend doesn't do it
      const teamProjects = fetchedProjects.filter(p => p.teamId === currentTeam.id);
      setProjects(teamProjects);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load projects');
    } finally {
      setIsLoading(false);
    }
  }, [currentTeam]);

  useEffect(() => {
    if (currentTeam) {
      refreshProjects();
      setCurrentProject(null);
    }
  }, [currentTeam?.id]);

  const selectProject = useCallback(async (projectId: string) => {
    // Leave current room before switching
    if (currentRoom) {
      leaveProjectRoom(currentRoom);
    }

    setIsLoading(true);
    setError(null);

    try {
      const project = await projectsApi.get(projectId);
      setCurrentProject(project);
      joinProjectRoom(projectId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load project');
    } finally {
      setIsLoading(false);
    }
  }, [currentRoom, joinProjectRoom, leaveProjectRoom]);

  const clearProject = useCallback(() => {
    if (currentRoom) {
      leaveProjectRoom(currentRoom);
    }
    setCurrentProject(null);
  }, [currentRoom, leaveProjectRoom]);

  return (
    <ProjectContext.Provider
      value={{
        projects,
        currentProject,
        isLoading,
        error,
        selectProject,
        clearProject,
        refreshProjects,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
}

export function useProject() {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
}
