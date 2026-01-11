import { useState, useEffect, useCallback, useRef } from 'react';
import { filesApi, ProjectFile } from '@/lib/api';
import { useSocketEvent } from '@/contexts/SocketContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Loader2, Upload, File, Image, FileText, Film, Music, MoreHorizontal, Download, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

interface FilesListProps {
  projectId: string;
}

const FILE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  image: Image,
  video: Film,
  audio: Music,
  document: FileText,
  default: File,
};

function getFileIcon(mimeType: string) {
  if (mimeType.startsWith('image/')) return FILE_ICONS.image;
  if (mimeType.startsWith('video/')) return FILE_ICONS.video;
  if (mimeType.startsWith('audio/')) return FILE_ICONS.audio;
  if (mimeType.includes('pdf') || mimeType.includes('document') || mimeType.includes('text')) {
    return FILE_ICONS.document;
  }
  return FILE_ICONS.default;
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export default function FilesList({ projectId }: FilesListProps) {
  const [files, setFiles] = useState<ProjectFile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadFiles = useCallback(async () => {
    setIsLoading(true);
    try {
      const fetchedFiles = await filesApi.list(projectId);
      setFiles(fetchedFiles);
    } catch (error) {
      console.error('Failed to load files:', error);
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    loadFiles();
  }, [loadFiles]);

  // Socket event for new files
  useSocketEvent<ProjectFile>('file.uploaded', (file) => {
    setFiles((prev) => [file, ...prev]);
  }, []);

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      await filesApi.upload(projectId, file);
      // File will be added via socket event
    } catch (error) {
      console.error('Failed to upload file:', error);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDelete = async (fileId: string) => {
    try {
      await filesApi.delete(fileId);
      setFiles((prev) => prev.filter((f) => f.id !== fileId));
    } catch (error) {
      console.error('Failed to delete file:', error);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <h3 className="font-medium">Files</h3>
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={handleUpload}
        />
        <Button
          size="sm"
          variant="ghost"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
        >
          {isUploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Upload className="h-4 w-4" />
          )}
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : files.length === 0 ? (
          <div className="text-center py-8">
            <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center mx-auto mb-3">
              <File className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="text-sm text-muted-foreground">No files yet</p>
            <Button
              size="sm"
              variant="ghost"
              className="mt-2"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload file
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {files.map((file) => {
              const Icon = getFileIcon(file.mimeType);

              return (
                <div
                  key={file.id}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors group animate-fade-in"
                >
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{file.name}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{formatFileSize(file.size)}</span>
                      <span>•</span>
                      <Avatar className="h-4 w-4">
                        <AvatarImage src={file.uploadedBy.avatar} />
                        <AvatarFallback className="text-[8px]">
                          {getInitials(file.uploadedBy.name)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="truncate">{file.uploadedBy.name}</span>
                    </div>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <a href={file.url} download={file.name} target="_blank" rel="noopener noreferrer">
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </a>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDelete(file.id)}
                        className="text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
