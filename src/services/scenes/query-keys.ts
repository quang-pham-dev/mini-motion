export const sceneKeys = {
  all: (projectId: string) => ['projects', projectId, 'scenes'] as const,
  lists: (projectId: string) => [...sceneKeys.all(projectId), 'list'] as const,
  detail: (projectId: string, sceneId: string) => [...sceneKeys.all(projectId), sceneId] as const,
} as const;
