import { useQuery } from '@tanstack/react-query';
import { projectsApi } from './api';
import { projectKeys } from './query-keys';

export const useGetAllProjects = () => {
  return useQuery({
    queryKey: projectKeys.lists(),
    queryFn: projectsApi.getAll,
  });
};

export const useGetProject = (id: string, enabled = true) => {
  return useQuery({
    queryKey: projectKeys.detail(id),
    queryFn: () => projectsApi.getById(id),
    enabled: !!id && enabled,
  });
};
