import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Project } from '@/types';
import { Loader2, Play } from 'lucide-react';
import Link from 'next/link';
import { StatusBadge } from './StatusBadge';

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Card className="flex h-48 flex-col transition-shadow hover:shadow-md">
      <CardHeader className="flex-none pb-3">
        <div className="flex items-start justify-between gap-4">
          <CardTitle className="line-clamp-2 text-lg" title={project.title}>
            {project.title}
          </CardTitle>
          <div className="flex-shrink-0">
            <StatusBadge status={project.status} />
          </div>
        </div>
        <CardDescription>{new Date(project.created_at).toLocaleDateString()}</CardDescription>
      </CardHeader>
      <CardContent className="mt-auto">
        {project.status === 'completed' ? (
          <Link href={`/preview/${project.id}`}>
            <Button variant="outline" className="w-full">
              <Play className="mr-2 h-4 w-4" />
              View Preview
            </Button>
          </Link>
        ) : project.status === 'processing' ? (
          <Button variant="outline" className="w-full" disabled>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Generating...
          </Button>
        ) : (
          <Link href={`/editor?id=${project.id}`}>
            <Button variant="outline" className="w-full">
              Continue Editing
            </Button>
          </Link>
        )}
      </CardContent>
    </Card>
  );
}
