import { useQuery } from '@tanstack/react-query';
import { scenesApi } from './api';
import { sceneKeys } from './query-keys';

export const useGetScenes = (projectId: string, enabled = true) => {
  return useQuery({
    queryKey: sceneKeys.lists(projectId),
    queryFn: () => scenesApi.getAll(projectId),
    enabled: !!projectId && enabled,
  });
};
