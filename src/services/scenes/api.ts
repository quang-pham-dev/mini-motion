import { apiClient } from '../api-client';
import { Scene } from '@/types';

export const scenesApi = {
  getAll: (projectId: string) =>
    apiClient<{ scenes: Scene[] }>(`/api/projects/${projectId}/scenes`),

  update: (projectId: string, sceneId: string, data: Partial<Scene>) =>
    apiClient<{ scene: Scene }>(`/api/projects/${projectId}/scenes/${sceneId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
};
