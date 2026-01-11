import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { projectsApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useTeam } from '@/contexts/TeamContext';
import { StatCard, Card } from '@/components/dashboard/Card';
import { MyTasks } from '@/components/dashboard/MyTasks';
import { ActivityFeed } from '@/components/dashboard/ActivityFeed';
import { OnlineTeammates } from '@/components/dashboard/OnlineTeammates';
import { Briefcase, CheckSquare, AlertCircle, Users } from 'lucide-react';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { teams } = useTeam();
  
  const [projectCount, setProjectCount] = useState(0);
  const [taskCount, setTaskCount] = useState(0);
  const [dueCount, setDueCount] = useState(0);
  const [onlineCount, setOnlineCount] = useState(0);
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        // Load projects
        try {
          const projects = await projectsApi.list();
          setProjectCount(projects.length);
        } catch (err) {
          console.error('Failed to load projects', err);
        }

        // In a real implementation, fetch tasks assigned to user
        // For now, show 0
        setTaskCount(0);
        setDueCount(0);
        setOnlineCount(0);
      } catch (error) {
        console.error('Failed to load dashboard data', error);
      } finally {
        setIsLoadingStats(false);
      }
    };

    loadDashboardData();
  }, [teams]);

  // Empty state for new users
  if (teams.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="max-w-md text-center">
          <div className="mb-6">
            <Briefcase className="w-16 h-16 text-slate-300 mx-auto" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-3">
            Welcome to Zync
          </h1>
          <p className="text-slate-600 mb-6">
            Let's get you started. Create your first team to begin collaborating.
          </p>
          <button
            onClick={() => navigate('/dashboard/team')}
            className="inline-flex items-center justify-center px-6 py-3 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition-colors"
          >
            Create Your First Team
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Welcome back, {user?.name?.split(' ')[0]}
          </h1>
          <p className="text-slate-600">
            Here's what's happening with your work
          </p>
        </div>

        {/* Quick Overview Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            label="Active Projects"
            value={projectCount}
            subtitle="Across all teams"
            icon={<Briefcase className="w-5 h-5" />}
            isLoading={isLoadingStats}
            onClick={() => navigate('/dashboard/projects')}
          />
          <StatCard
            label="My Tasks"
            value={taskCount}
            subtitle="Assigned to you"
            icon={<CheckSquare className="w-5 h-5" />}
            isLoading={isLoadingStats}
            onClick={() => navigate('/dashboard/projects')}
          />
          <StatCard
            label="Due Soon"
            value={dueCount}
            subtitle="Next 7 days"
            icon={<AlertCircle className="w-5 h-5" />}
            isLoading={isLoadingStats}
            onClick={() => navigate('/dashboard/projects')}
          />
          <StatCard
            label="Online Now"
            value={onlineCount}
            subtitle="Teammates"
            icon={<Users className="w-5 h-5" />}
            isLoading={isLoadingStats}
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Primary Focus (My Tasks) */}
          <div className="lg:col-span-2">
            <MyTasks
              onViewAll={() => navigate('/dashboard/projects')}
            />
          </div>

          {/* Right Column - Activity & Presence */}
          <div className="space-y-6">
            <ActivityFeed limit={6} />
            <OnlineTeammates limit={5} />
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-8 text-center text-sm text-slate-500">
          <p>Last updated just now • All times in your local timezone</p>
        </div>
      </div>
    </div>
  );
}