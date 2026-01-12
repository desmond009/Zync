import { useProject } from '@/contexts/ProjectContext';
import { useTeam } from '@/contexts/TeamContext';
import { Plus, ListFilter, SlidersHorizontal, LayoutGrid, Box, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useState } from 'react';

export default function ProjectsPage() {
  const { currentTeam } = useTeam();
  const { projects, selectProject } = useProject();
  const navigate = useNavigate();
  const [view, setView] = useState<'list' | 'grid'>('list');

  const handleProjectClick = (projectId: string) => {
    selectProject(projectId);
    navigate(`/dashboard/projects/${projectId}`);
  };

  return (
    <div className="flex flex-col h-full bg-[#09090b] text-[#e4e4e7]">
      {/* Header */}
      <div className="h-14 border-b border-[#27272a] flex items-center justify-between px-4 lg:px-6">
        <div className="flex items-center gap-4">
          <h1 className="text-sm font-medium">Projects</h1>
          <div className="w-px h-4 bg-[#27272a]" />
          <div className="flex items-center gap-1">
            <button className="flex items-center gap-2 px-2 py-1 bg-[#27272a] rounded text-xs font-medium text-[#e4e4e7] hover:bg-[#3f3f46] transition-colors">
              <Box className="h-3.5 w-3.5" />
              All projects
            </button>
            <button className="flex items-center gap-2 px-2 py-1 rounded text-xs font-medium text-[#a1a1aa] hover:bg-[#27272a] hover:text-[#e4e4e7] transition-colors">
              <LayoutGrid className="h-3.5 w-3.5" />
              New view
            </button>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-[#a1a1aa] hover:text-[#e4e4e7] hover:bg-[#27272a]"
          >
            <ListFilter className="h-4 w-4" />
          </Button>
          <div className="w-px h-4 bg-[#27272a]" />
          <Button
            size="sm"
            className="h-7 text-xs bg-[#e4e4e7] text-[#09090b] hover:bg-white font-medium px-3 gap-1.5"
          >
            <Plus className="h-3.5 w-3.5" />
            Add project
          </Button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="h-10 border-b border-[#27272a] flex items-center px-4 lg:px-6 justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-[#a1a1aa] hover:text-[#e4e4e7] hover:bg-[#27272a] gap-2">
            <ListFilter className="h-3.5 w-3.5" />
            Filter
          </Button>
        </div>
        <Button variant="ghost" size="sm" className="h-7 px-2 text-xs text-[#a1a1aa] hover:text-[#e4e4e7] hover:bg-[#27272a] gap-2">
          <SlidersHorizontal className="h-3.5 w-3.5" />
          Display
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-6 flex flex-col items-center justify-center">
        {projects.length === 0 ? (
          <div className="max-w-[420px] text-center">
            <div className="mb-6 flex justify-center">
              <div className="relative">
                <Box className="h-16 w-16 text-[#e4e4e7] stroke-[1]" />
                <Box className="h-16 w-16 text-[#e4e4e7]/20 stroke-[1] absolute top-1 left-1 -z-10" />
                <Box className="h-16 w-16 text-[#e4e4e7]/10 stroke-[1] absolute top-2 left-2 -z-20" />
              </div>
            </div>
            <h2 className="text-base font-medium text-[#e4e4e7] mb-2">Projects</h2>
            <p className="text-sm text-[#a1a1aa] leading-relaxed mb-8">
              Projects are larger units of work with a clear outcome, such as new feature you want to ship. They can be shared across multiple teams and are comprised of issues and optional documents.
            </p>
            <div className="flex items-center justify-center gap-3">
              <button className="h-8 px-3 rounded bg-[#5e6ad2] hover:bg-[#5e6ad2]/90 text-white text-xs font-medium flex items-center gap-2 transition-colors">
                Create new project
                <div className="px-1 py-0.5 rounded bg-black/20 text-[10px] font-mono leading-none">N</div>
                <span className="opacity-60 text-[10px]">then</span>
                <div className="px-1 py-0.5 rounded bg-black/20 text-[10px] font-mono leading-none">P</div>
              </button>
              <button className="h-8 px-3 rounded bg-[#27272a] hover:bg-[#3f3f46] text-[#e4e4e7] text-xs font-medium transition-colors">
                Documentation
              </button>
            </div>
          </div>
        ) : (
          <div className="w-full max-w-5xl mx-auto self-start">
            {/* List View Header */}
            <div className="grid grid-cols-12 gap-4 px-4 py-2 border-b border-[#27272a] text-xs font-medium text-[#a1a1aa]">
              <div className="col-span-6">Name</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-2">Priority</div>
              <div className="col-span-2">Lead</div>
            </div>
            {/* List Items */}
            <div className="mt-2 space-y-1">
              {projects.map((project) => (
                <div
                  key={project.id}
                  onClick={() => handleProjectClick(project.id)}
                  className="grid grid-cols-12 gap-4 px-4 py-2.5 rounded-md hover:bg-[#27272a]/50 cursor-pointer items-center group transition-colors"
                >
                  <div className="col-span-6 flex items-center gap-3">
                    <Box className="h-4 w-4 text-[#a1a1aa]" />
                    <span className="text-sm text-[#e4e4e7] font-medium">{project.name}</span>
                    <span className="text-xs text-[#71717a] opacity-0 group-hover:opacity-100 transition-opacity">ZYN-{project.id.slice(0, 3).toUpperCase()}</span>
                  </div>
                  <div className="col-span-2">
                    <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border border-[#27272a] text-xs text-[#a1a1aa]">
                      <div className="h-1.5 w-1.5 rounded-full border border-[#a1a1aa]" />
                      Backlog
                    </div>
                  </div>
                  <div className="col-span-2 text-xs text-[#a1a1aa]">
                    ---
                  </div>
                  <div className="col-span-2 flex items-center gap-2">
                    <div className="h-5 w-5 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-[10px]">
                      U
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
