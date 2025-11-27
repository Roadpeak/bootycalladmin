import { api } from './client';
import { API_ENDPOINTS, STORAGE_KEYS } from './config';
import type {
  Admin,
  AdminAuthResponse,
  AdminLoginRequest,
  AdminRegisterRequest,
  RefreshTokenRequest,
} from '@/types/api';

/**
 * Save authentication data to localStorage
 */
function saveAuthData(authData: AdminAuthResponse): void {
  if (typeof window === 'undefined') return;

  localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, authData.accessToken);
  localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, authData.refreshToken);
  localStorage.setItem(STORAGE_KEYS.ADMIN_DATA, JSON.stringify(authData.admin));
}

/**
 * Clear authentication data from localStorage
 */
function clearAuthData(): void {
  if (typeof window === 'undefined') return;

  localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
  localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
  localStorage.removeItem(STORAGE_KEYS.ADMIN_DATA);
}

/**
 * Get stored admin data
 */
export function getStoredAdmin(): Admin | null {
  if (typeof window === 'undefined') return null;

  const adminData = localStorage.getItem(STORAGE_KEYS.ADMIN_DATA);
  if (!adminData) return null;

  try {
    return JSON.parse(adminData) as Admin;
  } catch {
    return null;
  }
}

/**
 * Get stored access token
 */
export function getStoredAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
}

/**
 * Get stored refresh token
 */
export function getStoredRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  return !!getStoredAccessToken();
}

/**
 * Admin authentication service
 */
export const authService = {
  /**
   * Register a new admin
   */
  async register(data: AdminRegisterRequest): Promise<AdminAuthResponse> {
    const response = await api.post<AdminAuthResponse>(
      API_ENDPOINTS.ADMIN_REGISTER,
      data,
      { requiresAuth: false }
    );

    if (response.data) {
      saveAuthData(response.data);
    }

    return response.data!;
  },

  /**
   * Login admin
   */
  async login(data: AdminLoginRequest): Promise<AdminAuthResponse> {
    const response = await api.post<AdminAuthResponse>(
      API_ENDPOINTS.ADMIN_LOGIN,
      data,
      { requiresAuth: false }
    );

    if (response.data) {
      saveAuthData(response.data);
    }

    return response.data!;
  },

  /**
   * Refresh access token
   */
  async refreshToken(): Promise<AdminAuthResponse> {
    const refreshToken = getStoredRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await api.post<AdminAuthResponse>(
      API_ENDPOINTS.ADMIN_REFRESH_TOKEN,
      { refreshToken } as RefreshTokenRequest,
      { requiresAuth: false }
    );

    if (response.data) {
      saveAuthData(response.data);
    }

    return response.data!;
  },

  /**
   * Get admin profile
   */
  async getProfile(): Promise<Admin> {
    const response = await api.get<Admin>(API_ENDPOINTS.ADMIN_PROFILE);

    if (response.data) {
      localStorage.setItem(STORAGE_KEYS.ADMIN_DATA, JSON.stringify(response.data));
    }

    return response.data!;
  },

  /**
   * Logout admin
   */
  logout(): void {
    clearAuthData();
    // Redirect to login page
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  },

  /**
   * Get current admin data
   */
  getCurrentAdmin(): Admin | null {
    return getStoredAdmin();
  },
};
