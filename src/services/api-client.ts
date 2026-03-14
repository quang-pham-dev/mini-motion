type FetchOptions = RequestInit & {
  params?: Record<string, string>;
};

import { ERROR_MESSAGES } from '@/constants';

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function apiClient<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const { params, ...init } = options;

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';

  const url = new URL(endpoint, baseUrl);
  if (params) {
    Object.entries(params).forEach(([key, value]) => url.searchParams.append(key, value));
  }

  const response = await fetch(url.toString(), {
    headers: {
      'Content-Type': 'application/json',
      ...init.headers,
    },
    ...init,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: ERROR_MESSAGES.UNKNOWN_ERROR }));
    throw new ApiError(
      response.status,
      (error as { error: string }).error || ERROR_MESSAGES.REQUEST_FAILED
    );
  }

  return response.json();
}
