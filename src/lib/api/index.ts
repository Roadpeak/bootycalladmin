// Export all API services
export { api, apiClient, APIError, handleApiError, isAuthError } from './client';
export { authService, isAuthenticated, getStoredAdmin, getStoredAccessToken } from './auth';
export { adminService } from './admin';
export { API_CONFIG, API_ENDPOINTS, STORAGE_KEYS } from './config';

// Re-export types
export type * from '@/types/api';
