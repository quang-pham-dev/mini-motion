'use client';

import { FullscreenLoader, MainContainer, PageLayout, SignInPrompt } from '@/components/layouts';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ProjectCardSkeleton } from '@/components/ui/skeletons';
import { useAuth } from '@/features/auth';
import { Plus } from 'lucide-react';
import Link from 'next/link';

import { DashboardHeader } from './components/DashboardHeader';
import { ProjectCard } from './components/ProjectCard';
import { useDashboardProjects } from './hooks/useDashboardProjects';

export default function Dashboard() {
  const { user, loading, signIn, signOut } = useAuth();
  const { projects, projectsLoading } = useDashboardProjects(user);

  if (loading) {
    return <FullscreenLoader />;
  }

  if (!user) {
    return <SignInPrompt onSignIn={signIn} />;
  }

  return (
    <PageLayout>
      <DashboardHeader user={user} onSignOut={signOut} />

      <MainContainer>
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Your Projects</h2>
          <Link href="/editor">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Project
            </Button>
          </Link>
        </div>

        {projectsLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <ProjectCardSkeleton key={i} />
            ))}
          </div>
        ) : projects.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="mb-4 text-gray-500">No projects yet</p>
              <Link href="/editor">
                <Button variant="outline">Create your first project</Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {projects.map(project => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}
      </MainContainer>
    </PageLayout>
  );
}
