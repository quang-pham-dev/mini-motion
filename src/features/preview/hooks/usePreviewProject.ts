import { ERROR_MESSAGES } from '@/constants';
import {
  useGenerateMusic,
  useGenerateTTS,
  useGenerateVideo,
} from '@/services/generators/mutations';
import { useVideoTaskStatus } from '@/services/generators/queries';
import { useUpdateProject } from '@/services/projects/mutations';
import { useGetProject } from '@/services/projects/queries';
import { useUpdateScene } from '@/services/scenes/mutations';
import { Project } from '@/types';
import { type User } from '@supabase/supabase-js';
import { useCallback, useEffect, useState } from 'react';

export function usePreviewProject(projectId: string, user: User | null) {
  const { data, isLoading, error: queryError, refetch } = useGetProject(projectId, !!user);

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

  // Track which taskIds we've already submitted a PATCH for (prevents double-fire)
  // Using React state (NOT refs) so it survives StrictMode correctly
  const [handledTaskIds, setHandledTaskIds] = useState<Set<string>>(new Set());
  // Track if the async save is in-flight to prevent concurrent calls
  const [isSavingResult, setIsSavingResult] = useState(false);

  const project: Project | null = data?.project ?? null;
  const loading = isLoading;
  // queryError = fatal (can't load project), localError = recoverable (mutation failed)
  const fatalError = queryError?.message ?? null;
  const actionError = localError;
  const setError = useCallback((err: string | Error | null) => {
    if (err === null) {
      setLocalError(null);
    } else if (typeof err === 'string') {
      setLocalError(err);
    } else {
      setLocalError(err.message);
    }
  }, []);

  // ═══════════════════════════════════════════════════════════
  // Video Polling: find the first scene that's still processing
  // ═══════════════════════════════════════════════════════════
  const firstProcessingScene = project?.scenes.find(
    s => s.video_status === 'processing' && s.video_task_id
  );

  const activeTaskId = firstProcessingScene?.video_task_id ?? null;

  const { data: videoTaskData } = useVideoTaskStatus(activeTaskId, !!activeTaskId);

  // ═══════════════════════════════════════════════════════════
  // Auto-update scene when MiniMax returns a terminal status.
  //
  // DESIGN:
  // - Deps: activeTaskId + videoTaskData?.taskStatus (stable primitives, not objects)
  // - handledTaskIds (React state) prevents double-fire and survives StrictMode
  // - isSavingResult prevents concurrent async calls
  // - Error recovery: on failure, removes from handledTaskIds so next poll retries
  // ═══════════════════════════════════════════════════════════
  useEffect(() => {
    // Guard: need all required data to proceed
    if (!activeTaskId || !videoTaskData || !firstProcessingScene || !project) return;

    const taskStatus = videoTaskData.taskStatus;
    const isTerminal = taskStatus === 'Success' || taskStatus === 'Fail';

    if (!isTerminal) {
      console.log('[VideoPolling] Status:', taskStatus, 'for task:', activeTaskId);
      return;
    }

    // Already handled or currently saving?
    if (handledTaskIds.has(activeTaskId) || isSavingResult) return;

    // Mark as handled to prevent concurrent duplicates
    setHandledTaskIds(prev => new Set(prev).add(activeTaskId));
    setIsSavingResult(true);

    console.log('[VideoPolling] Terminal status reached:', {
      taskId: activeTaskId,
      status: taskStatus,
      videoUrl: videoTaskData.videoUrl ? '✓ present' : '✗ missing',
    });

    // Use an async IIFE with proper error handling
    const sceneId = firstProcessingScene.id;
    const projectIdForPatch = project.id;
    const videoUrl = videoTaskData.videoUrl;
    const finalStatus = taskStatus === 'Success' ? 'completed' : 'failed';

    (async () => {
      try {
        await updateSceneMutation.mutateAsync({
          projectId: projectIdForPatch,
          sceneId: sceneId,
          data: {
            video_url: videoUrl,
            video_status: finalStatus,
          },
        });
        console.log('[VideoPolling] ✓ Scene updated successfully');
        // Force refetch to guarantee UI sees latest data
        await refetch();
        console.log('[VideoPolling] ✓ Project data refetched');
      } catch (err) {
        console.error('[VideoPolling] ✗ Failed to update scene:', err);
        setLocalError('Video generated but failed to save. Please refresh.');
        // Allow retry by removing from handled set
        setHandledTaskIds(prev => {
          const next = new Set(prev);
          next.delete(activeTaskId);
          return next;
        });
      } finally {
        setIsSavingResult(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTaskId, videoTaskData?.taskStatus]);

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

        // Refetch so polling picks up the new task_id
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
    fatalError,
    actionError,
    setError,
    generatingAsset,
    isDownloading,
    handleGenerateAsset,
    handleDownloadAll,
  };
}
