import { useMutation, useQueryClient } from '@tanstack/react-query';
import { scenesApi } from './api';
import { sceneKeys } from './query-keys';
import { Scene } from '@/types';

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
    },
  });
};
