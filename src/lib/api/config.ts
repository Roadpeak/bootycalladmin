// API Configuration
export const API_CONFIG = {
  // Base URLs - configure based on environment
  BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000/api/v1',

  // Alternative URLs
  PRODUCTION_DOMAIN: 'https://api.lovebiteglobal.com/api/v1',
  PRODUCTION_IP: 'http://165.227.22.118/api/v1',
  DEVELOPMENT: 'http://localhost:4000/api/v1',

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
  ADMIN_EARNINGS: '/admin/earnings',

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

  // Platform Settings
  ADMIN_SETTINGS: '/admin/settings',
  ADMIN_UPDATE_SETTING: (key: string) => `/admin/settings/${key}`,
  ADMIN_REVENUE_SPLITS: '/admin/settings/revenue-splits/all',
  ADMIN_UPDATE_REVENUE_SPLIT: (scope: string) =>
    `/admin/settings/revenue-splits/${scope}`,
  ADMIN_SUBSCRIPTION_PLANS: '/admin/settings/plans/all',
  ADMIN_CREATE_PLAN: '/admin/settings/plans',
  ADMIN_UPDATE_PLAN: (id: string) => `/admin/settings/plans/${id}`,

  // Advertisements
  ADMIN_ADS: '/admin/ads',
  ADMIN_AD_BY_ID: (id: string) => `/admin/ads/${id}`,
  ADMIN_AD_ANALYTICS: '/admin/ads/analytics',
} as const;

// Storage keys for tokens
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'admin_access_token',
  REFRESH_TOKEN: 'admin_refresh_token',
  ADMIN_DATA: 'admin_data',
} as const;
