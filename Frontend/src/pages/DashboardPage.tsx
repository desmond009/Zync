import { useProject } from '@/contexts/ProjectContext';
import { useTeam } from '@/contexts/TeamContext';
import { Plus, FolderKanban, Users, Clock, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';

export default function DashboardPage() {
  const { currentTeam, members } = useTeam();
  const { projects, selectProject } = useProject();
  const navigate = useNavigate();

  const stats = [
    {
      label: 'Active Projects',
      value: projects.length,
      icon: FolderKanban,
      color: 'text-primary',
      bg: 'bg-primary/10',
    },
    {
      label: 'Team Members',
      value: members.length,
      icon: Users,
      color: 'text-accent',
      bg: 'bg-accent/10',
    },
    {
      label: 'Tasks This Week',
      value: '—',
      icon: Clock,
      color: 'text-warning',
      bg: 'bg-warning/10',
    },
    {
      label: 'Completed',
      value: '—',
      icon: TrendingUp,
      color: 'text-success',
      bg: 'bg-success/10',
    },
  ];

  const handleProjectClick = (projectId: string) => {
    selectProject(projectId);
    navigate(`/dashboard/projects/${projectId}`);
  };

  return (
    <div className="p-6 lg:p-8 space-y-8">
      {/* Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back to {currentTeam?.name || 'your workspace'}
          </p>
        </div>
        <Button className="gradient-primary gap-2">
          <Plus className="h-4 w-4" />
          New Project
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="border-border/50">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className={`h-12 w-12 rounded-xl ${stat.bg} flex items-center justify-center`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Projects */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Recent Projects</h2>
          <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard/projects')}>
            View all
          </Button>
        </div>

        {projects.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-12 text-center">
              <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center mx-auto mb-4">
                <FolderKanban className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="font-medium mb-1">No projects yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Create your first project to get started
              </p>
              <Button className="gradient-primary gap-2">
                <Plus className="h-4 w-4" />
                Create Project
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.slice(0, 6).map((project) => (
              <Card
                key={project.id}
                className="border-border/50 hover:border-primary/30 hover:shadow-soft transition-all cursor-pointer group"
                onClick={() => handleProjectClick(project.id)}
              >
                <CardHeader>
                  <CardTitle className="text-lg group-hover:text-primary transition-colors">
                    {project.name}
                  </CardTitle>
                  <CardDescription className="line-clamp-2">
                    {project.description || 'No description'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <FolderKanban className="h-4 w-4" />
                      {project.taskCount} tasks
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {project.memberCount} members
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
