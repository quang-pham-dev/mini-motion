import { apiClient } from '../api-client';

export const generatorsApi = {
  generateVideo: (prompt: string) =>
    apiClient<{ taskId: string }>('/api/generate-video', {
      method: 'POST',
      body: JSON.stringify({ prompt }),
    }),

  getVideoTaskStatus: (taskId: string) =>
    apiClient<{ taskStatus: string; videoUrl?: string }>(`/api/generate-video?taskId=${taskId}`),

  generateMusic: (prompt: string) =>
    apiClient<{ url: string }>('/api/generate-music', {
      method: 'POST',
      body: JSON.stringify({ prompt }),
    }),

  generateTTS: (text: string) =>
    apiClient<{ url: string }>('/api/generate-tts', {
      method: 'POST',
      body: JSON.stringify({ text }),
    }),

  generateScript: (prompt: string) =>
    apiClient<{ script: unknown }>('/api/generate-script', {
      method: 'POST',
      body: JSON.stringify({ prompt }),
    }),
};
