import { useProject } from '@/contexts/ProjectContext';
import { useTeam } from '@/contexts/TeamContext';
import { Plus, FolderKanban } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';

export default function ProjectsPage() {
  const { currentTeam } = useTeam();
  const { projects, selectProject, isLoading } = useProject();
  const navigate = useNavigate();

  const handleProjectClick = (projectId: string) => {
    selectProject(projectId);
    navigate(`/dashboard/projects/${projectId}`);
  };

  return (
    <div className="p-6 lg:p-8 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Projects</h1>
          <p className="text-muted-foreground mt-1">
            Manage your team's projects
          </p>
        </div>
        <Button className="gradient-primary gap-2">
          <Plus className="h-4 w-4" />
          New Project
        </Button>
      </div>

      {projects.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="py-16 text-center">
            <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-6">
              <FolderKanban className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">No projects yet</h3>
            <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
              Create your first project to start organizing tasks and collaborating with your team.
            </p>
            <Button className="gradient-primary gap-2">
              <Plus className="h-4 w-4" />
              Create your first project
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
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
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
