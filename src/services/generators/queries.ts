import { useQuery } from '@tanstack/react-query';
import { generatorsApi } from './api';
import { generatorKeys } from './query-keys';

export const useVideoTaskStatus = (taskId: string | null, enabled: boolean) => {
  return useQuery({
    queryKey: generatorKeys.videoTask(taskId ?? ''),
    queryFn: () => generatorsApi.getVideoTaskStatus(taskId!),
    enabled: !!taskId && enabled,
    staleTime: 0,
    gcTime: 0, // Don't cache old task results — each taskId is unique
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    refetchInterval: query => {
      const status = query.state.data?.taskStatus;
      // MiniMax statuses: Queueing → Preparing → Processing → Success/Fail
      // Only stop polling on terminal statuses
      const isTerminal = status === 'Success' || status === 'Fail' || status === 'Unknown';
      return isTerminal ? false : 5000;
    },
    retry: 3,
  });
};
