import { Project } from '@/types';
import { useCallback, useEffect, useRef, useState } from 'react';

export function usePreviewPlayback(project: Project | null) {
  const [playingScene, setPlayingScene] = useState<number | null>(null);
  const [musicVolume] = useState(0.3);
  const [isMusicMuted, setIsMusicMuted] = useState(false);

  // Audio/Video refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const musicRef = useRef<HTMLAudioElement>(null);
  const voiceoverRef = useRef<HTMLAudioElement>(null);

  const stopAllPlayback = useCallback(() => {
    setPlayingScene(null);

    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }

    if (musicRef.current) {
      musicRef.current.pause();
      musicRef.current.currentTime = 0;
    }

    if (voiceoverRef.current) {
      voiceoverRef.current.pause();
      voiceoverRef.current.currentTime = 0;
    }
  }, []);

  const handlePlayScene = useCallback(
    (index: number) => {
      if (!project) return;

      if (playingScene === index) {
        stopAllPlayback();
        return;
      }

      const scene = project.scenes[index];
      setPlayingScene(index);

      if (project.music_url && musicRef.current) {
        musicRef.current.volume = isMusicMuted ? 0 : musicVolume;
        musicRef.current.play().catch(() => {});
      }

      if (scene.audio_url && scene.audio_status === 'completed') {
        if (voiceoverRef.current) {
          voiceoverRef.current.src = scene.audio_url;
          voiceoverRef.current.volume = 1.0;
          voiceoverRef.current.play().catch(() => {});
        }

        if (musicRef.current && !isMusicMuted) {
          musicRef.current.volume = musicVolume * 0.4;
        }
      }
    },
    [project, playingScene, musicVolume, isMusicMuted, stopAllPlayback]
  );

  useEffect(() => {
    if (playingScene !== null && project?.scenes[playingScene]?.video_url && videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  }, [playingScene, project?.scenes]);

  const handleVoiceoverEnded = useCallback(() => {
    if (musicRef.current && !isMusicMuted) {
      musicRef.current.volume = musicVolume;
    }
  }, [musicVolume, isMusicMuted]);

  const handleVideoEnded = useCallback(() => {
    stopAllPlayback();
  }, [stopAllPlayback]);

  const handleToggleMusicMute = useCallback(() => {
    setIsMusicMuted(prev => {
      const newMuted = !prev;
      if (musicRef.current) {
        musicRef.current.volume = newMuted ? 0 : musicVolume;
      }
      return newMuted;
    });
  }, [musicVolume]);

  const handleToggleMusicOnly = useCallback(() => {
    if (!musicRef.current || !project?.music_url) return;

    if (musicRef.current.paused) {
      musicRef.current.volume = isMusicMuted ? 0 : musicVolume;
      musicRef.current.play().catch(() => {});
    } else {
      musicRef.current.pause();
    }
  }, [project?.music_url, musicVolume, isMusicMuted]);

  return {
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
  };
}
