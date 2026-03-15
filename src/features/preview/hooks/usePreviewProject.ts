import { ERROR_MESSAGES } from '@/constants';
import {
  useGenerateMusic,
  useGenerateTTS,
  useGenerateVideo,
} from '@/services/generators/mutations';
import { useVideoTaskStatus } from '@/services/generators/queries';
import { useGetProject } from '@/services/projects/queries';
import { useUpdateProject } from '@/services/projects/mutations';
import { useUpdateScene } from '@/services/scenes/mutations';
import { Project } from '@/types';
import { type User } from '@supabase/supabase-js';
import { useEffect, useRef, useState } from 'react';

export function usePreviewProject(projectId: string | string[], user: User | null) {
  const id = Array.isArray(projectId) ? projectId[0] : projectId;
  const { data, isLoading, error, refetch } = useGetProject(id, !!user);

  const updateSceneMutation = useUpdateScene();
  const updateProjectMutation = useUpdateProject();
  const videoMutation = useGenerateVideo();
  const musicMutation = useGenerateMusic();
  const ttsMutation = useGenerateTTS();

  const [generatingAsset, setGeneratingAsset] = useState<{
    type: string;
    index: number;
  } | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const project: Project | null = data?.project ?? null;
  const loading = isLoading;
  const errorMessage = error?.message ?? localError;
  const setError = (err: string | Error | null) => {
    if (err === null) {
      setLocalError(null);
    } else if (typeof err === 'string') {
      setLocalError(err);
    } else {
      setLocalError(err.message);
    }
  };

  // Polling for video generation tasks
  const processingScenes = project?.scenes.filter(
    s => s.video_status === 'processing' && s.video_task_id
  );

  const firstProcessingScene = processingScenes?.[0];
  const { data: videoTaskData } = useVideoTaskStatus(
    firstProcessingScene?.video_task_id ?? null,
    !!firstProcessingScene
  );

  // Debug logging
  if (firstProcessingScene) {
    console.log('[VideoPolling] Processing scene detected:', {
      sceneId: firstProcessingScene.id,
      taskId: firstProcessingScene.video_task_id,
      taskStatus: videoTaskData?.taskStatus,
    });
  }

  // Use refs to access latest values without adding them as effect dependencies
  const updateSceneMutationRef = useRef(updateSceneMutation);
  updateSceneMutationRef.current = updateSceneMutation;
  const refetchRef = useRef(refetch);
  refetchRef.current = refetch;
  const projectRef = useRef(project);
  projectRef.current = project;

  // Track which task ID we've already triggered a mutation for to prevent re-firing
  const handledTaskIdRef = useRef<string | null>(null);

  // Auto-update scene when video task completes
  useEffect(() => {
    const currentProject = projectRef.current;
    const taskId = firstProcessingScene?.video_task_id ?? null;

    if (
      videoTaskData &&
      firstProcessingScene &&
      currentProject &&
      taskId &&
      (videoTaskData.taskStatus === 'Success' || videoTaskData.taskStatus === 'Fail') &&
      handledTaskIdRef.current !== taskId
    ) {
      // Mark this task as handled so we don't fire the mutation again
      handledTaskIdRef.current = taskId;

      updateSceneMutationRef.current.mutate(
        {
          projectId: currentProject.id,
          sceneId: firstProcessingScene.id,
          data: {
            video_url: videoTaskData.videoUrl,
            video_status: videoTaskData.taskStatus === 'Success' ? 'completed' : 'failed',
          },
        },
        {
          onSuccess: () => refetchRef.current(),
        }
      );
    }
  }, [videoTaskData, firstProcessingScene]);

  const handleGenerateAsset = async (type: 'video' | 'audio' | 'music', sceneIndex?: number) => {
    if (!project) return;

    setGeneratingAsset({ type, index: sceneIndex ?? 0 });

    try {
      if (type === 'video' && sceneIndex !== undefined) {
        const scene = project.scenes[sceneIndex];

        const result = await videoMutation.mutateAsync(scene.visual_prompt);

        await updateSceneMutation.mutateAsync({
          projectId: project.id,
          sceneId: scene.id,
          data: {
            video_task_id: result.taskId,
            video_status: 'processing',
          },
        });

        await refetch();
      }

      if (type === 'music') {
        const result = await musicMutation.mutateAsync(project.music_vibe || 'calm ambient music');

        await updateProjectMutation.mutateAsync({
          id: project.id,
          data: {
            music_url: result.url,
          },
        });

        await refetch();
      }

      if (type === 'audio' && sceneIndex !== undefined) {
        const scene = project.scenes[sceneIndex];

        const result = await ttsMutation.mutateAsync(scene.script_text);

        await updateSceneMutation.mutateAsync({
          projectId: project.id,
          sceneId: scene.id,
          data: {
            audio_url: result.url,
            audio_status: 'completed',
          },
        });

        await refetch();
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to generate asset';
      setError(errorMsg);
    } finally {
      setGeneratingAsset(null);
    }
  };

  const downloadFile = async (url: string, filename: string) => {
    try {
      try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(ERROR_MESSAGES.FETCH_NOT_OK);
        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        await new Promise(resolve => setTimeout(resolve, 500));
        URL.revokeObjectURL(blobUrl);
        return;
      } catch (fetchErr) {
        console.warn(
          `Fetch download failed for ${filename} (CORS or expired blob). Falling back to direct link...`,
          fetchErr
        );
      }

      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (err) {
      console.error(`Failed to download ${filename}:`, err);
    }
  };

  const handleDownloadAll = async () => {
    if (!project) return;

    setIsDownloading(true);
    const projectSlug = project.title.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase();

    try {
      if (project.music_url) {
        await downloadFile(project.music_url, `${projectSlug}-background-music.mp3`);
      }

      for (const scene of project.scenes) {
        const sceneNum = scene.scene_number;

        if (scene.video_status === 'completed' && scene.video_url) {
          await downloadFile(scene.video_url, `${projectSlug}-scene-${sceneNum}-video.mp4`);
        }

        if (scene.audio_status === 'completed' && scene.audio_url) {
          await downloadFile(scene.audio_url, `${projectSlug}-scene-${sceneNum}-voiceover.mp3`);
        }
      }
    } catch (err) {
      console.error('Download all error:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  return {
    project,
    loading,
    error: errorMessage,
    setError,
    generatingAsset,
    isDownloading,
    handleGenerateAsset,
    handleDownloadAll,
  };
}
