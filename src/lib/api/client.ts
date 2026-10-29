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

/**
 * Ends the session once the API has rejected the stored token.
 *
 * An expired or revoked token cannot recover, so instead of surfacing
 * "Invalid token" on every screen, clear it and send the admin to sign in
 * again. Guarded so a page firing several requests at once redirects once.
 */
let sessionEndHandled = false;
export function endExpiredSession(): void {
  if (typeof window === 'undefined' || sessionEndHandled) return;
  sessionEndHandled = true;
  localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
  localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
  localStorage.removeItem(STORAGE_KEYS.ADMIN_DATA);
  window.location.replace('/login?expired=1');
}

/**
 * Whether a JWT's `exp` claim has passed. Reads the payload only; the API
 * still verifies the signature. Unreadable tokens count as not expired and
 * are left for the API to reject.
 */
export function isTokenExpired(token: string): boolean {
  try {
    const payload = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const { exp } = JSON.parse(atob(payload)) as { exp?: number };
    return typeof exp === 'number' && exp * 1000 <= Date.now();
  } catch {
    return false;
  }
}

const SESSION_EXPIRED_MESSAGE = 'Your session has expired. Please sign in again.';

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
  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(headers as Record<string, string>),
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

    // A rejected token on an authenticated call means the session is over.
    // Login itself sends no token, so a wrong password still shows its error.
    if (response.status === 401 && requestHeaders['Authorization']) {
      endExpiredSession();
      throw new APIError(401, SESSION_EXPIRED_MESSAGE);
    }

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

/**
 * Uploads a file as multipart/form-data.
 *
 * Kept separate from `apiClient` because that helper always sets
 * `Content-Type: application/json`. For a FormData body the browser must set
 * the header itself so it can include the multipart boundary — setting it
 * manually produces a request the server cannot parse.
 */
export async function uploadFile<T>(
  endpoint: string,
  file: File,
  fields: Record<string, string> = {}
): Promise<ApiResponse<T>> {
  const formData = new FormData();
  formData.append('image', file);
  for (const [key, value] of Object.entries(fields)) {
    formData.append(key, value);
  }

  const token = getAccessToken();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);

  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      body: formData,
      signal: controller.signal,
    });

    if (response.status === 401 && token) {
      endExpiredSession();
      throw new APIError(401, SESSION_EXPIRED_MESSAGE);
    }

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new APIError(
        response.status,
        (data as { message?: string })?.message || 'Upload failed'
      );
    }

    return data as ApiResponse<T>;
  } finally {
    clearTimeout(timeout);
  }
}
