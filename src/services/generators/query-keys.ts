export const generatorKeys = {
  videoTask: (taskId: string) => ['video-task', taskId] as const,
  script: ['script'] as const,
  music: (projectId: string) => ['music', projectId] as const,
  tts: (sceneId: string) => ['tts', sceneId] as const,
} as const;
