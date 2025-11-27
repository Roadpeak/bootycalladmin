// Base API Response Types
export interface ApiResponse<T> {
  status: 'success' | 'error';
  data?: T;
  message?: string;
  pagination?: Pagination;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// User Role Types
export type UserRole = 'DATING_USER' | 'ESCORT' | 'HOOKUP_USER' | 'ADMIN';

export type UserStatus = 'ACTIVE' | 'SUSPENDED' | 'BANNED' | 'PENDING';

export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';

export type PaymentType = 'DATING_SUBSCRIPTION' | 'VIP_SUBSCRIPTION' | 'UNLOCK_ESCORT';

export type WithdrawalStatus = 'PENDING' | 'COMPLETED' | 'REJECTED';

export type ReferralStatus = 'PENDING' | 'COMPLETED' | 'REJECTED';

export type ModerationStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';

// Admin Types
export interface Admin {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminLoginRequest {
  email: string;
  password: string;
}

export interface AdminRegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  secretKey: string;
}

export interface AdminAuthResponse {
  admin: Admin;
  accessToken: string;
  refreshToken: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

// Dashboard Types
export interface DashboardStats {
  users: {
    total: number;
    escorts: number;
    datingUsers: number;
    hookupUsers: number;
  };
  payments: {
    count: number;
    totalRevenue: number;
  };
  pending: {
    verifications: number;
    withdrawals: number;
  };
}

// User Types
export interface User {
  id: string;
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  displayName?: string;
  role: UserRole;
  isActive: boolean;
  walletBalance: number;
  referralCode?: string;
  referredBy?: string;
  datingSubscriptionExpiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserListParams {
  page?: number;
  limit?: number;
  role?: UserRole;
  search?: string;
}

export interface UpdateUserStatusRequest {
  isActive: boolean;
}

// Escort Types - Updated to match API
export interface EscortLocation {
  city: string;
  regions: string[];
}

export interface EscortService {
  name: string;
  description?: string;
}

export interface EscortPricingService {
  name: string;
  price: number;
}

export interface EscortPricing {
  hourlyRate: number;
  services?: EscortPricingService[];
}

export interface EscortAvailability {
  days: string[];
  hours: string;
}

export interface Escort {
  id: string;
  userId: string;
  user?: {
    id: string;
    displayName?: string;
    firstName: string;
    lastName?: string;
  };
  name: string;
  age?: number;
  about: string;
  contactPhone: string;
  locations?: EscortLocation | null;
  photos: string[];
  services?: EscortService[];
  pricing?: EscortPricing | null;
  availability?: EscortAvailability | null;
  languages?: string[];
  verified: boolean;
  vipStatus: boolean;
  vipExpiresAt?: string;
  moderationStatus: ModerationStatus;
  unlockPrice: number;
  experienceYears?: number;
  tags?: string[];
  totalViews: number;
  averageRating: number;
  reviewCount: number;
  createdAt: string;
  updatedAt?: string;
  contactHidden?: boolean; // Added by API when contact is hidden
}

export interface EscortListParams {
  page?: number;
  limit?: number;
  verified?: boolean;
  vipStatus?: boolean;
  search?: string;
}

export interface VerifyEscortRequest {
  verified: boolean;
  notes?: string;
}

// Payment Types - Updated to match API
export interface Payment {
  id: string;
  userId?: string; // Optional - can be null for anonymous payments
  user?: User; // Populated user object
  amount: number;
  type: PaymentType;
  status: PaymentStatus;
  phone: string;
  mpesaReceiptNumber?: string;
  mpesaTransactionId?: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt?: string;
}

export interface PaymentListParams {
  page?: number;
  limit?: number;
  type?: PaymentType;
  status?: PaymentStatus;
  search?: string; // Search by phone, email, transaction ID, etc.
}

// Withdrawal Types
export interface Withdrawal {
  id: string;
  userId: string;
  user?: User;
  amount: number;
  status: WithdrawalStatus;
  phone: string;
  mpesaTransactionId?: string;
  notes?: string;
  processedAt?: string;
  processedBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WithdrawalListParams {
  page?: number;
  limit?: number;
  status?: WithdrawalStatus;
  userId?: string;
}

export interface ProcessWithdrawalRequest {
  status: 'COMPLETED' | 'REJECTED';
  mpesaTransactionId?: string;
  notes?: string;
}

// Referral Types - Updated to match API
export interface Referral {
  id: string;
  referrerUserId: string;
  referrer?: User;
  referredUserId: string;
  referred?: User;
  paymentId?: string;
  payment?: Payment;
  codeUsed: string;
  rewardAmount: number;
  level: number;
  status: ReferralStatus;
  approvedAt?: string;
  approvedBy?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface ReferralListParams {
  page?: number;
  limit?: number;
  status?: ReferralStatus;
  referrerUserId?: string;
  level?: number;
}

export interface ApproveReferralRequest {
  approve: boolean;
  notes?: string;
}

// Review Types
export interface Review {
  id: string;
  escortId: string;
  escort?: Escort;
  userId: string;
  user?: User;
  rating: number;
  comment: string;
  visible: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewListParams {
  page?: number;
  limit?: number;
  escortId?: string;
  userId?: string;
  visible?: boolean;
}

export interface ToggleReviewVisibilityRequest {
  visible: boolean;
}

// Error Types
export interface ApiError {
  status: 'error';
  message: string;
  errors?: Record<string, string[]>;
}
