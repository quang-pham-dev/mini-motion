import { Scene } from '@/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { projectKeys } from '../projects/query-keys';
import { scenesApi } from './api';
import { sceneKeys } from './query-keys';

export const useUpdateScene = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      projectId,
      sceneId,
      data,
    }: {
      projectId: string;
      sceneId: string;
      data: Partial<Scene>;
    }) => scenesApi.update(projectId, sceneId, data),
    onSuccess: (_, { projectId }) => {
      queryClient.invalidateQueries({ queryKey: sceneKeys.all(projectId) });
      // Also invalidate the project detail query since scenes are embedded in project response
      queryClient.invalidateQueries({ queryKey: projectKeys.detail(projectId) });
    },
  });
};
