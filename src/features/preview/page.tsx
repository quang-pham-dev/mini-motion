'use client';

import { FullscreenMessage, MainContainer, PageLayout, SignInPrompt } from '@/components/layouts';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PreviewPageSkeleton } from '@/components/ui/skeletons';
import { useAuth } from '@/features/auth';
import { AlertCircle, X } from 'lucide-react';
import Link from 'next/link';

import { MusicCard } from './components/MusicCard';
import { PreviewHeader } from './components/PreviewHeader';
import { SceneCard } from './components/SceneCard';
import { usePreviewPlayback } from './hooks/usePreviewPlayback';
import { usePreviewProject } from './hooks/usePreviewProject';

interface PreviewPageProps {
  projectId: string;
}

export default function PreviewPage({ projectId }: PreviewPageProps) {
  const { user, loading: authLoading, signIn } = useAuth();

  const {
    project,
    loading,
    fatalError,
    actionError,
    setError,
    generatingAsset,
    isDownloading,
    handleGenerateAsset,
    handleDownloadAll,
  } = usePreviewProject(projectId, user);

  const {
    playingScene,
    isMusicMuted,
    videoRef,
    musicRef,
    voiceoverRef,
    stopAllPlayback,
    handlePlayScene,
    handleVoiceoverEnded,
    handleVideoEnded,
    handleToggleMusicMute,
    handleToggleMusicOnly,
  } = usePreviewPlayback(project);

  if (authLoading || loading) {
    return <PreviewPageSkeleton />;
  }

  if (!user) {
    return (
      <SignInPrompt
        onSignIn={signIn}
        title="Sign In Required"
        description="Please sign in to view projects"
      />
    );
  }

  // Only show full-page error for fatal errors (can't load project at all)
  if (fatalError || !project) {
    return (
      <FullscreenMessage>
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Error</CardTitle>
            <CardDescription>{fatalError || 'Project not found'}</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/">
              <Button className="w-full">Go to Dashboard</Button>
            </Link>
          </CardContent>
        </Card>
      </FullscreenMessage>
    );
  }

  const hasMusic = !!project.music_url;

  return (
    <PageLayout>
      {/* Inline dismissible banner for recoverable errors (e.g. asset generation failed) */}
      {actionError && (
        <div className="border-b border-red-200 bg-red-50 px-4 py-3">
          <div className="container mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2 text-red-700">
              <AlertCircle className="h-5 w-5" />
              <span className="text-sm font-medium">{actionError}</span>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setError(null)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <PreviewHeader
        projectTitle={project.title}
        hasMusic={hasMusic}
        playingScene={playingScene}
        isMusicMuted={isMusicMuted}
        isDownloading={isDownloading}
        handleToggleMusicOnly={handleToggleMusicOnly}
        handleToggleMusicMute={handleToggleMusicMute}
        stopAllPlayback={stopAllPlayback}
        handleDownloadAll={handleDownloadAll}
      />

      {/* Hidden audio elements */}
      {project.music_url && <audio ref={musicRef} src={project.music_url} loop preload="auto" />}
      <audio ref={voiceoverRef} onEnded={handleVoiceoverEnded} preload="auto" />

      <MainContainer>
        <div className="space-y-6">
          <MusicCard
            project={project}
            hasMusic={hasMusic}
            generatingAsset={generatingAsset}
            handleToggleMusicOnly={handleToggleMusicOnly}
            handleGenerateAsset={handleGenerateAsset}
          />

          {/* Play all info */}
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
            <p className="text-sm text-blue-800">
              <strong>💡 Combined Playback:</strong> Press ▶ Play on any scene to experience all
              available assets together — video plays with background music at reduced volume, and
              voiceover narration overlaid on top. Generate each asset individually below.
            </p>
          </div>

          <h2 className="text-xl font-semibold">Scenes</h2>

          <div className="grid gap-6">
            {project.scenes.map((scene, index) => (
              <SceneCard
                key={scene.id}
                scene={scene}
                index={index}
                isPlaying={playingScene === index}
                hasMusic={hasMusic}
                videoRef={videoRef}
                generatingAsset={generatingAsset}
                handlePlayScene={handlePlayScene}
                handleVideoEnded={handleVideoEnded}
                handleGenerateAsset={handleGenerateAsset}
              />
            ))}
          </div>
        </div>
      </MainContainer>
    </PageLayout>
  );
}
