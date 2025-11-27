import { api } from './client';
import { API_ENDPOINTS } from './config';
import type {
  DashboardStats,
  User,
  UserListParams,
  UpdateUserStatusRequest,
  Escort,
  EscortListParams,
  VerifyEscortRequest,
  Payment,
  PaymentListParams,
  Withdrawal,
  WithdrawalListParams,
  ProcessWithdrawalRequest,
  Referral,
  ReferralListParams,
  ApproveReferralRequest,
  Review,
  ReviewListParams,
  ToggleReviewVisibilityRequest,
  ApiResponse,
} from '@/types/api';

/**
 * Admin API Service
 * Handles all admin-related API calls
 */
export const adminService = {
  // ==================== Dashboard ====================
  /**
   * Get dashboard statistics
   */
  async getDashboardStats(): Promise<DashboardStats> {
    const response = await api.get<DashboardStats>(API_ENDPOINTS.ADMIN_DASHBOARD);
    return response.data!;
  },

  // ==================== Users Management ====================
  /**
   * List all users with pagination and filters
   */
  async getUsers(params?: UserListParams): Promise<ApiResponse<User[]>> {
    return await api.get<User[]>(API_ENDPOINTS.ADMIN_USERS, { params });
  },

  /**
   * Get user by ID
   */
  async getUserById(id: string): Promise<User> {
    const response = await api.get<User>(API_ENDPOINTS.ADMIN_USER_BY_ID(id));
    return response.data!;
  },

  /**
   * Update user status (ACTIVE, SUSPENDED, BANNED, etc.)
   */
  async updateUserStatus(id: string, data: UpdateUserStatusRequest): Promise<User> {
    const response = await api.patch<User>(
      API_ENDPOINTS.ADMIN_UPDATE_USER_STATUS(id),
      data
    );
    return response.data!;
  },

  // ==================== Escorts Management ====================
  /**
   * List escorts for verification with pagination and filters
   */
  async getEscorts(params?: EscortListParams): Promise<ApiResponse<Escort[]>> {
    return await api.get<Escort[]>(API_ENDPOINTS.ADMIN_ESCORTS, { params });
  },

  /**
   * Verify an escort
   */
  async verifyEscort(id: string, data: VerifyEscortRequest): Promise<Escort> {
    const response = await api.post<Escort>(
      API_ENDPOINTS.ADMIN_VERIFY_ESCORT(id),
      data
    );
    return response.data!;
  },

  // ==================== Payments Management ====================
  /**
   * List all payments with pagination and filters
   */
  async getPayments(params?: PaymentListParams): Promise<ApiResponse<Payment[]>> {
    return await api.get<Payment[]>(API_ENDPOINTS.ADMIN_PAYMENTS, { params });
  },

  // ==================== Withdrawals Management ====================
  /**
   * List all withdrawals with pagination and filters
   */
  async getWithdrawals(params?: WithdrawalListParams): Promise<ApiResponse<Withdrawal[]>> {
    return await api.get<Withdrawal[]>(API_ENDPOINTS.ADMIN_WITHDRAWALS, { params });
  },

  /**
   * Process a withdrawal (approve or reject)
   */
  async processWithdrawal(id: string, data: ProcessWithdrawalRequest): Promise<Withdrawal> {
    const response = await api.post<Withdrawal>(
      API_ENDPOINTS.ADMIN_PROCESS_WITHDRAWAL(id),
      data
    );
    return response.data!;
  },

  // ==================== Referrals Management ====================
  /**
   * List all referrals with pagination and filters
   */
  async getReferrals(params?: ReferralListParams): Promise<ApiResponse<Referral[]>> {
    return await api.get<Referral[]>(API_ENDPOINTS.ADMIN_REFERRALS, { params });
  },

  /**
   * Approve a referral
   */
  async approveReferral(id: string, data: ApproveReferralRequest): Promise<Referral> {
    const response = await api.post<Referral>(
      API_ENDPOINTS.ADMIN_APPROVE_REFERRAL(id),
      data
    );
    return response.data!;
  },

  // ==================== Reviews Management ====================
  /**
   * List all reviews with pagination and filters
   */
  async getReviews(params?: ReviewListParams): Promise<ApiResponse<Review[]>> {
    return await api.get<Review[]>(API_ENDPOINTS.ADMIN_REVIEWS, { params });
  },

  /**
   * Toggle review visibility
   */
  async toggleReviewVisibility(id: string, data: ToggleReviewVisibilityRequest): Promise<Review> {
    const response = await api.put<Review>(
      API_ENDPOINTS.ADMIN_TOGGLE_REVIEW_VISIBILITY(id),
      data
    );
    return response.data!;
  },
};
