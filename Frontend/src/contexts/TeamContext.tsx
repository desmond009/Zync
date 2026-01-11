import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { teamsApi, Team, TeamMember } from '@/lib/api';
import { useAuth } from './AuthContext';

interface TeamContextType {
  teams: Team[];
  currentTeam: Team | null;
  members: TeamMember[];
  isLoading: boolean;
  error: string | null;
  selectTeam: (team: Team) => void;
  refreshTeams: () => Promise<void>;
  refreshMembers: () => Promise<void>;
}

const TeamContext = createContext<TeamContextType | null>(null);

export function TeamProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [teams, setTeams] = useState<Team[]>([]);
  const [currentTeam, setCurrentTeam] = useState<Team | null>(null);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshTeams = useCallback(async () => {
    if (!isAuthenticated) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const fetchedTeams = await teamsApi.list();
      setTeams(fetchedTeams);
      
      // Auto-select first team if none selected
      if (!currentTeam && fetchedTeams.length > 0) {
        setCurrentTeam(fetchedTeams[0]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load teams');
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, currentTeam]);

  const refreshMembers = useCallback(async () => {
    if (!currentTeam) return;
    
    try {
      const fetchedMembers = await teamsApi.getMembers(currentTeam.id);
      setMembers(fetchedMembers);
    } catch (err) {
      console.error('Failed to load team members:', err);
    }
  }, [currentTeam]);

  useEffect(() => {
    refreshTeams();
  }, [isAuthenticated]);

  useEffect(() => {
    if (currentTeam) {
      refreshMembers();
    }
  }, [currentTeam?.id]);

  const selectTeam = useCallback((team: Team) => {
    setCurrentTeam(team);
    setMembers([]);
  }, []);

  return (
    <TeamContext.Provider
      value={{
        teams,
        currentTeam,
        members,
        isLoading,
        error,
        selectTeam,
        refreshTeams,
        refreshMembers,
      }}
    >
      {children}
    </TeamContext.Provider>
  );
}

export function useTeam() {
  const context = useContext(TeamContext);
  if (!context) {
    throw new Error('useTeam must be used within a TeamProvider');
  }
  return context;
}
