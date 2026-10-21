// ============================================
// API CLIENT
// ============================================

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface ApiOptions {
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
}

export async function api<T = unknown>(
  endpoint: string,
  options: ApiOptions = {}
): Promise<T> {
  const { method = 'GET', body, headers = {} } = options;

  const config: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  const response = await fetch(`${API_URL}${endpoint}`, config);

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Request failed' }));
    throw new Error(error.error?.message || error.message || 'Request failed');
  }

  return response.json();
}

// API helpers
export const apiClient = {
  get: <T = unknown>(endpoint: string, options?: ApiOptions) =>
    api<T>(endpoint, { ...options, method: 'GET' }),

  post: <T = unknown>(endpoint: string, body: unknown, options?: ApiOptions) =>
    api<T>(endpoint, { ...options, method: 'POST', body }),

  put: <T = unknown>(endpoint: string, body: unknown, options?: ApiOptions) =>
    api<T>(endpoint, { ...options, method: 'PUT', body }),

  patch: <T = unknown>(endpoint: string, body: unknown, options?: ApiOptions) =>
    api<T>(endpoint, { ...options, method: 'PATCH', body }),

  delete: <T = unknown>(endpoint: string, options?: ApiOptions) =>
    api<T>(endpoint, { ...options, method: 'DELETE' }),
};
