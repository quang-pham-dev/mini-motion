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

  let response: Response;

  try {
    response = await fetch(url.toString(), {
      headers: {
        'Content-Type': 'application/json',
        ...init.headers,
      },
      ...init,
    });
  } catch (networkError) {
    // Network-level errors (ERR_HTTP2_PROTOCOL_ERROR, ERR_CONNECTION_RESET, etc.)
    // These happen before we can check response.ok
    const message =
      networkError instanceof Error ? networkError.message : ERROR_MESSAGES.UNKNOWN_ERROR;
    throw new ApiError(
      0,
      message.includes('ERR_HTTP2_PROTOCOL_ERROR') || message === 'Failed to fetch'
        ? 'Request failed — the server may have timed out or the response was too large. Please try again.'
        : message
    );
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: ERROR_MESSAGES.UNKNOWN_ERROR }));
    throw new ApiError(
      response.status,
      (error as { error: string }).error || ERROR_MESSAGES.REQUEST_FAILED
    );
  }

  return response.json();
}
