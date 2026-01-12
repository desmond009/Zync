import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { projectsApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { useTeam } from '@/contexts/TeamContext';
import { StatCard, SectionCard } from '@/components/dashboard/Card';
import { MyTasks } from '@/components/dashboard/MyTasks';
import { ActivityFeed } from '@/components/dashboard/ActivityFeed';
import { OnlineTeammates } from '@/components/dashboard/OnlineTeammates';
import {
  Briefcase,
  CheckSquare,
  Clock,
  Users,
  Sparkles,
  ArrowRight,
  Zap,
  TrendingUp,
  Calendar,
  Target
} from 'lucide-react';
import { cn } from '@/lib/utils';

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
        try {
          const projects = await projectsApi.list();
          setProjectCount(projects.length);
        } catch (err) {
          console.error('Failed to load projects', err);
        }

        // In a real implementation, fetch tasks assigned to user
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

  // Get greeting based on time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  // Get current date formatted
  const getCurrentDate = () => {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric'
    });
  };

  // Empty state for new users
  if (teams.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 flex items-center justify-center px-4">
        <div className="max-w-md text-center animate-fade-in-up">
          {/* Animated decorative elements */}
          <div className="relative mb-8">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-indigo-500/20 to-violet-500/20 blur-2xl animate-float" />
            </div>
            <div className="relative inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 shadow-xl shadow-indigo-500/30">
              <Sparkles className="w-10 h-10 text-white" />
            </div>
          </div>

          <h1 className="text-3xl font-bold font-display text-slate-900 mb-3">
            Welcome to Zync
          </h1>
          <p className="text-slate-500 mb-8 text-lg">
            Let's get you started. Create your first team to begin collaborating with your crew.
          </p>

          <button
            onClick={() => navigate('/dashboard/team')}
            className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-indigo-500 to-violet-500 text-white rounded-xl font-semibold text-lg shadow-xl shadow-indigo-500/30 hover:shadow-2xl hover:shadow-indigo-500/40 hover:-translate-y-1 transition-all duration-300"
          >
            Create Your First Team
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30">
      {/* Decorative background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-br from-indigo-500/5 to-violet-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-gradient-to-br from-cyan-500/5 to-blue-500/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Header */}
        <div className="mb-10 animate-fade-in-up">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-indigo-600 mb-1 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {getCurrentDate()}
              </p>
              <h1 className="text-4xl md:text-5xl font-bold font-display text-slate-900 mb-2">
                {getGreeting()},{' '}
                <span className="text-gradient-aurora">{user?.name?.split(' ')[0]}</span>
              </h1>
              <p className="text-slate-500 text-lg">
                Here's what's happening with your work today
              </p>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate('/dashboard/projects')}
                className="group flex items-center gap-2 px-5 py-2.5 bg-white/70 backdrop-blur-sm border border-slate-200/50 rounded-xl text-sm font-medium text-slate-700 hover:bg-white hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
              >
                <Target className="w-4 h-4 text-indigo-500" />
                New Project
              </button>
              <button
                onClick={() => navigate('/dashboard/team')}
                className="group flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-violet-500 rounded-xl text-sm font-medium text-white shadow-lg shadow-indigo-500/25 hover:shadow-xl hover:shadow-indigo-500/30 hover:-translate-y-0.5 transition-all duration-300"
              >
                <Zap className="w-4 h-4" />
                Invite Team
              </button>
            </div>
          </div>
        </div>

        {/* Stats Grid - Bento Layout */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="animate-fade-in-up stagger-1">
            <StatCard
              label="Active Projects"
              value={projectCount}
              subtitle="Across all teams"
              icon={<Briefcase className="w-5 h-5" />}
              isLoading={isLoadingStats}
              onClick={() => navigate('/dashboard/projects')}
              variant="projects"
              trend={{ value: 12, isPositive: true }}
            />
          </div>
          <div className="animate-fade-in-up stagger-2">
            <StatCard
              label="My Tasks"
              value={taskCount}
              subtitle="Assigned to you"
              icon={<CheckSquare className="w-5 h-5" />}
              isLoading={isLoadingStats}
              onClick={() => navigate('/dashboard/projects')}
              variant="tasks"
            />
          </div>
          <div className="animate-fade-in-up stagger-3">
            <StatCard
              label="Due Soon"
              value={dueCount}
              subtitle="Next 7 days"
              icon={<Clock className="w-5 h-5" />}
              isLoading={isLoadingStats}
              onClick={() => navigate('/dashboard/projects')}
              variant="due"
            />
          </div>
          <div className="animate-fade-in-up stagger-4">
            <StatCard
              label="Online Now"
              value={onlineCount}
              subtitle="Teammates"
              icon={<Users className="w-5 h-5" />}
              isLoading={isLoadingStats}
              variant="online"
            />
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Primary Focus (My Tasks) */}
          <div className="lg:col-span-2 animate-fade-in-up stagger-5">
            <MyTasks
              onViewAll={() => navigate('/dashboard/projects')}
            />
          </div>

          {/* Right Column - Activity & Presence */}
          <div className="space-y-6">
            <div className="animate-fade-in-up stagger-5">
              <ActivityFeed limit={6} />
            </div>
            <div className="animate-fade-in-up stagger-6">
              <OnlineTeammates limit={5} />
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="mt-10 text-center animate-fade-in">
          <p className="text-sm text-slate-400 flex items-center justify-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-glow-pulse" />
            Last synced just now • All times in your local timezone
          </p>
        </div>
      </div>
    </div>
  );
}