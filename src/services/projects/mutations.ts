import { useMutation, useQueryClient } from '@tanstack/react-query';
import { projectsApi } from './api';
import { projectKeys } from './query-keys';
import { Project } from '@/types';

export const useUpdateProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Project> }) =>
      projectsApi.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: projectKeys.all });
      queryClient.invalidateQueries({ queryKey: projectKeys.detail(id) });
    },
  });
};
