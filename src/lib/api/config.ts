// API Configuration
export const API_CONFIG = {
  // Base URLs - configure based on environment
  BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.lovebiteglobal.com/api/v1',

  // Alternative URLs
  PRODUCTION_DOMAIN: 'https://api.lovebiteglobal.com/api/v1',
  PRODUCTION_IP: 'http://165.227.22.118/api/v1',
  DEVELOPMENT: 'http://localhost:3000/api/v1',

  // Timeout settings
  TIMEOUT: 30000, // 30 seconds

  // Rate limiting info
  RATE_LIMIT: {
    requests: 100,
    window: 15 * 60 * 1000, // 15 minutes
  },
} as const;

// API Endpoints
export const API_ENDPOINTS = {
  // Admin Auth
  ADMIN_REGISTER: '/admin/auth/register',
  ADMIN_LOGIN: '/admin/auth/login',
  ADMIN_REFRESH_TOKEN: '/admin/auth/refresh-token',
  ADMIN_PROFILE: '/admin/auth/profile',

  // Admin Dashboard
  ADMIN_DASHBOARD: '/admin/dashboard',

  // Admin Users Management
  ADMIN_USERS: '/admin/users',
  ADMIN_USER_BY_ID: (id: string) => `/admin/users/${id}`,
  ADMIN_UPDATE_USER_STATUS: (id: string) => `/admin/users/${id}/status`,

  // Admin Escorts Management
  ADMIN_ESCORTS: '/admin/escorts',
  ADMIN_VERIFY_ESCORT: (id: string) => `/admin/escorts/${id}/verify`,

  // Admin Payments
  ADMIN_PAYMENTS: '/admin/payments',

  // Admin Withdrawals
  ADMIN_WITHDRAWALS: '/admin/withdrawals',
  ADMIN_PROCESS_WITHDRAWAL: (id: string) => `/admin/withdrawals/${id}/process`,

  // Admin Referrals
  ADMIN_REFERRALS: '/admin/referrals',
  ADMIN_APPROVE_REFERRAL: (id: string) => `/admin/referrals/${id}/approve`,

  // Admin Reviews
  ADMIN_REVIEWS: '/admin/reviews',
  ADMIN_TOGGLE_REVIEW_VISIBILITY: (id: string) => `/admin/reviews/${id}/visibility`,
} as const;

// Storage keys for tokens
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'admin_access_token',
  REFRESH_TOKEN: 'admin_refresh_token',
  ADMIN_DATA: 'admin_data',
} as const;
