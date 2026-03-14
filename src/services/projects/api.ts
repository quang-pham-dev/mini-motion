import { apiClient } from '../api-client';
import { Project } from '@/types';

export const projectsApi = {
  getAll: () => apiClient<{ projects: Project[] }>('/api/projects'),

  getById: (id: string) => apiClient<{ project: Project }>(`/api/projects/${id}`),

  update: (id: string, data: Partial<Project>) =>
    apiClient<{ project: Project }>(`/api/projects/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
};
