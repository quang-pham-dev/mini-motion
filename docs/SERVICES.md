# Services Layer Documentation

Comprehensive guide to using TanStack Query v5 services layer in Mini Motion.

## Overview

The services layer provides a clean abstraction over API calls, handling:

- Data fetching with caching
- Background refetching
- Cache invalidation
- Optimistic updates
- Polling for async operations

## Directory Structure

```
src/services/
├── api-client.ts              # Base client with error handling
├── projects/
│   ├── api.ts                # Raw API fetch functions
│   ├── query-keys.ts         # Query key factory
│   ├── queries.ts            # useQuery hooks
│   ├── mutations.ts          # useMutation hooks
│   └── index.ts              # Barrel exports
├── scenes/
│   ├── api.ts
│   ├── query-keys.ts
│   ├── queries.ts
│   ├── mutations.ts
│   └── index.ts
└── generators/
    ├── api.ts
    ├── query-keys.ts
    ├── queries.ts
    ├── mutations.ts
    └── index.ts
```

## Quick Start

### Using Queries

```typescript
import { useGetAllProjects, useGetProject } from '@/services/projects';

// Get all projects
const { data, isLoading, error } = useGetAllProjects();

// Get single project
const { data } = useGetProject('proj_abc123');
```

### Using Mutations

```typescript
import { useUpdateProject } from '@/services/projects';

const mutation = useUpdateProject();

await mutation.mutateAsync({
  id: 'proj_abc123',
  data: { title: 'New Title' },
});
```

## API Client

The base API client handles errors and provides consistent fetch behavior:

```typescript
import { apiClient, ApiError } from '@/services/api-client';

const result = await apiClient<{ projects: Project[] }>('/api/projects');

// ApiError provides access to status code
try {
  await apiClient('/api/projects');
} catch (error) {
  if (error instanceof ApiError) {
    console.log(error.status); // 400, 401, 404, 500
    console.log(error.message);
  }
}
```

## Query Keys Factory

Query keys are organized hierarchically for precise cache control:

```typescript
// src/services/projects/query-keys.ts
export const projectKeys = {
  // Base key for all projects
  all: ['projects'] as const,

  // All project lists
  lists: () => [...projectKeys.all, 'list'] as const,

  // Filtered project lists
  list: (filters: Record<string, string>) => [...projectKeys.lists(), filters] as const,

  // All project details
  details: () => [...projectKeys.all, 'detail'] as const,

  // Single project
  detail: (id: string) => [...projectKeys.details(), id] as const,
};
```

**Key Benefits:**

- Type-safe keys
- Easy to invalidate specific subsets
- IDE autocomplete support

## Queries

### Basic Query

```typescript
// src/services/projects/queries.ts
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
    enabled: !!id && enabled, // Only fetch when id exists
  });
};
```

### Conditional Queries

```typescript
// Only fetch when user is logged in
const { data } = useGetProject(id, !!user);
```

### Query Options

| Option                 | Default | Description             |
| ---------------------- | ------- | ----------------------- |
| `staleTime`            | 60000   | Data freshness (1 min)  |
| `gcTime`               | 300000  | Cache retention (5 min) |
| `retry`                | 1       | Retry failed requests   |
| `refetchOnWindowFocus` | false   | Refetch on tab switch   |

## Mutations

### Basic Mutation

```typescript
// src/services/projects/mutations.ts
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { projectsApi } from './api';
import { projectKeys } from './query-keys';

export const useUpdateProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Project> }) =>
      projectsApi.update(id, data),

    // Invalidate and refetch after success
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: projectKeys.all });
      queryClient.invalidateQueries({ queryKey: projectKeys.detail(id) });
    },
  });
};
```

### Using Mutations

```typescript
const updateProject = useUpdateProject();

// Simple usage
updateProject.mutate({ id: 'abc', data: { title: 'New' } });

// With async/await and error handling
try {
  await updateProject.mutateAsync({ id: 'abc', data: { title: 'New' } });
  // Success!
} catch (error) {
  // Handle error
}
```

### Mutation Callbacks

```typescript
const mutation = useUpdateProject({
  onMutate: async newData => {
    // Cancel outgoing refetches
    await queryClient.cancelQueries({ queryKey: projectKeys.all });

    // Snapshot previous value
    const previous = queryClient.getQueryData(projectKeys.all);

    // Optimistically update
    queryClient.setQueryData(projectKeys.all, old => [...old, newData]);

    return { previous };
  },
  onError: (err, newData, context) => {
    // Rollback on error
    queryClient.setQueryData(projectKeys.all, context.previous);
  },
  onSettled: () => {
    // Always refetch after error or success
    queryClient.invalidateQueries({ queryKey: projectKeys.all });
  },
});
```

## Polling Pattern

For async operations like video generation:

### Video Task Status Query

```typescript
// src/services/generators/queries.ts
import { useQuery } from '@tanstack/react-query';
import { generatorKeys } from './query-keys';
import { generatorsApi } from './api';

export const useVideoTaskStatus = (taskId: string | null, enabled: boolean) => {
  return useQuery({
    queryKey: generatorKeys.videoTask(taskId ?? ''),
    queryFn: () => generatorsApi.getVideoTaskStatus(taskId!),
    enabled: !!taskId && enabled,
    staleTime: 0,

    // Poll while processing
    refetchInterval: query => {
      const status = query.state.data?.taskStatus;
      return status === 'Pending' || status === 'Processing' ? 5000 : false;
    },

    // Retry on failure
    retry: true,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};
```

### Using Polling in Components

```typescript
import { useVideoTaskStatus } from '@/services/generators';

function VideoGenerator({ taskId }) {
  const { data } = useVideoTaskStatus(taskId, !!taskId);

  if (data?.taskStatus === 'Success') {
    return <VideoPlayer url={data.videoUrl} />;
  }

  return <Processing status={data?.taskStatus} />;
}
```

## SSR Integration

### Server-Side Prefetching

```typescript
// src/app/projects/[id]/page.tsx (Server Component)
import { getQueryClient } from '@/lib/query-client';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { projectsApi } from '@/services/projects/api';
import { projectKeys } from '@/services/projects/query-keys';
import ProjectClient from './ProjectClient';

export default async function ProjectPage({ params }: { params: { id: string } }) {
  const queryClient = getQueryClient();

  await queryClient.prefetchQuery({
    queryKey: projectKeys.detail(params.id),
    queryFn: () => projectsApi.getById(params.id),
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ProjectClient projectId={params.id} />
    </HydrationBoundary>
  );
}
```

### Client Component

```typescript
// ProjectClient.tsx (Client Component)
'use client';

import { useGetProject } from '@/services/projects/queries';

export function ProjectClient({ projectId }: { projectId: string }) {
  // Data is already available from SSR hydration
  const { data } = useGetProject(projectId);

  return <div>{data.project.title}</div>;
}
```

## Advanced Patterns

### Parallel Queries

```typescript
import { useGetProject } from '@/services/projects';
import { useGetScenes } from '@/services/scenes';

function ProjectPage({ projectId }) {
  // Fetch in parallel
  const projectQuery = useGetProject(projectId);
  const scenesQuery = useGetScenes(projectId);

  const isLoading = projectQuery.isLoading || scenesQuery.isLoading;
}
```

### Dependent Queries

```typescript
// Only fetch scenes after project loads
const { data: project } = useGetProject(projectId);
const { data: scenes } = useGetScenes(projectId, !!project);
```

### Selectors

```typescript
// Only extract specific data
const { data: projectTitles } = useQuery({
  queryKey: projectKeys.lists(),
  queryFn: projectsApi.getAll,
  select: data => data.projects.map(p => p.title),
});
```

## Error Handling

```typescript
const { error, isError } = useGetProject(id);

if (isError) {
  return <Error message={error.message} />;
}
```

## Best Practices

1. **Use query keys consistently** - Same key = same data
2. **Enable conditional queries** - Use `enabled` option
3. **Invalidate on mutations** - Keep cache in sync
4. **Handle loading/error states** - Show appropriate UI
5. **Use optimistic updates** - For better UX
6. **Set appropriate staleTime** - Balance freshness vs. performance

## Migration from Fetch

| Before                    | After                            |
| ------------------------- | -------------------------------- |
| `useState` for data       | `useQuery.data`                  |
| `useState` for loading    | `useQuery.isLoading`             |
| `useState` for error      | `useQuery.error`                 |
| Manual fetch in useEffect | `useQuery` handles automatically |
| Manual cache management   | TanStack Query handles it        |

## File Reference

| File                          | Purpose                   |
| ----------------------------- | ------------------------- |
| `src/app/providers.tsx`       | QueryClientProvider setup |
| `src/lib/query-client.ts`     | SSR query client          |
| `src/services/api-client.ts`  | Base fetch client         |
| `src/services/*/queries.ts`   | Query hooks               |
| `src/services/*/mutations.ts` | Mutation hooks            |
