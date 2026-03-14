import { type User } from '@supabase/supabase-js';
import { useGetAllProjects } from '@/services/projects/queries';

// user parameter kept for API compatibility - TanStack Query handles auth internally
export function useDashboardProjects(user: User | null) {
  void user; // Acknowledge parameter for backward compatibility
  const { data, isLoading, refetch } = useGetAllProjects();

  return {
    projects: data?.projects ?? [],
    projectsLoading: isLoading,
    fetchProjects: refetch,
  };
}
