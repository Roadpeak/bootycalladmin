import { API_CONFIG, STORAGE_KEYS } from './config';
import type { ApiResponse, ApiError } from '@/types/api';

// Custom error class for API errors
export class APIError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public errors?: Record<string, string[]>
  ) {
    super(message);
    this.name = 'APIError';
  }
}

// Type for request options
interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
  requiresAuth?: boolean;
}

/**
 * Get access token from localStorage
 */
function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
}

/**
 * Build URL with query parameters
 */
function buildURL(endpoint: string, params?: Record<string, string | number | boolean | undefined>): string {
  // Remove leading slash from endpoint if present to ensure proper concatenation
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;

  // Ensure BASE_URL ends with / for proper joining
  const baseUrl = API_CONFIG.BASE_URL.endsWith('/')
    ? API_CONFIG.BASE_URL
    : `${API_CONFIG.BASE_URL}/`;

  const url = new URL(cleanEndpoint, baseUrl);

  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.append(key, String(value));
      }
    });
  }

  return url.toString();
}

/**
 * Main API client function
 */
export async function apiClient<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<ApiResponse<T>> {
  const { params, requiresAuth = true, headers = {}, ...fetchOptions } = options;

  // Build URL with query parameters
  const url = buildURL(endpoint, params);

  // Build headers
  const requestHeaders: HeadersInit = {
    'Content-Type': 'application/json',
    ...headers,
  };

  // Add authentication token if required
  if (requiresAuth) {
    const token = getAccessToken();
    if (token) {
      requestHeaders['Authorization'] = `Bearer ${token}`;
    }
  }

  // Create abort controller for timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);

  try {
    const response = await fetch(url, {
      ...fetchOptions,
      headers: requestHeaders,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    // Parse response
    const data = await response.json();

    // Handle error responses
    if (!response.ok) {
      const errorData = data as ApiError;
      throw new APIError(
        response.status,
        errorData.message || 'An error occurred',
        errorData.errors
      );
    }

    return data as ApiResponse<T>;
  } catch (error) {
    clearTimeout(timeoutId);

    // Handle abort/timeout
    if (error instanceof Error && error.name === 'AbortError') {
      throw new APIError(408, 'Request timeout');
    }

    // Handle network errors
    if (error instanceof TypeError) {
      throw new APIError(0, 'Network error. Please check your connection.');
    }

    // Re-throw API errors
    if (error instanceof APIError) {
      throw error;
    }

    // Handle unknown errors
    throw new APIError(500, 'An unexpected error occurred');
  }
}

/**
 * Convenience methods for different HTTP methods
 */
export const api = {
  get: <T>(endpoint: string, options?: RequestOptions) =>
    apiClient<T>(endpoint, { ...options, method: 'GET' }),

  post: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    apiClient<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    }),

  put: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    apiClient<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    }),

  patch: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    apiClient<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    }),

  delete: <T>(endpoint: string, options?: RequestOptions) =>
    apiClient<T>(endpoint, { ...options, method: 'DELETE' }),
};

/**
 * Error handler utility
 */
export function handleApiError(error: unknown): string {
  if (error instanceof APIError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'An unexpected error occurred';
}

/**
 * Check if error is authentication error
 */
export function isAuthError(error: unknown): boolean {
  return error instanceof APIError && (error.statusCode === 401 || error.statusCode === 403);
}
