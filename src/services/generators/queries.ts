import { useQuery } from '@tanstack/react-query';
import { generatorKeys } from './query-keys';
import { generatorsApi } from './api';

export const useVideoTaskStatus = (taskId: string | null, enabled: boolean) => {
  return useQuery({
    queryKey: generatorKeys.videoTask(taskId ?? ''),
    queryFn: () => generatorsApi.getVideoTaskStatus(taskId!),
    enabled: !!taskId && enabled,
    staleTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    refetchInterval: query => {
      const status = query.state.data?.taskStatus;
      return !status || status === 'Processing' ? 5000 : false;
    },
    retry: true,
  });
};
