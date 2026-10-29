import { api } from './client';
import type { Pagination } from '@/types/api';

/**
 * Typed calls for the admin listings that return totals alongside the page
 * (payments, withdrawals, referrals, escorts, dating users), the dashboard,
 * and notifications.
 */

export type Tier = 'VVIP' | 'VIP' | 'PRIME' | 'REGULAR';

export interface Paged<T, S = undefined> {
  data: T[];
  summary: S;
  pagination: Pagination;
}

type Query = Record<string, string | number | boolean | undefined>;

async function paged<T, S>(endpoint: string, params: Query): Promise<Paged<T, S>> {
  const res = (await api.get<T[]>(endpoint, { params })) as any;
  return {
    data: res.data ?? [],
    summary: res.summary,
    pagination: res.pagination ?? { page: 1, limit: 20, total: 0, totalPages: 0 },
  };
}

// ---------- payments ----------
export type PaymentGroup = 'dating' | 'escort' | 'hookup';
export interface AdminPayment {
  id: string;
  type: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED' | string;
  amount: number;
  payerPhone: string;
  mpesaTxnId: string | null;
  createdAt: string;
  metadata?: Record<string, any> | null;
  user: { id: string; email: string; phone: string; firstName: string; lastName: string; displayName: string | null; role: string } | null;
  plan: { tier: Tier; durationDays: number; label: string | null } | null;
  escortName: string | null;
}
export interface PaymentSummary {
  total: number; completed: number; pending: number; failed: number; revenue: number; revenueToday: number;
}
export const getPayments = (params: { group: PaymentGroup; page: number; status?: string; search?: string }) =>
  paged<AdminPayment, PaymentSummary>('/admin/payments', { limit: 20, ...params });

// ---------- withdrawals ----------
export interface AdminWithdrawal {
  id: string;
  amount: number;
  status: 'PENDING' | 'COMPLETED' | 'REJECTED';
  createdAt: string;
  user: { id: string; email: string; phone: string; firstName: string; lastName: string; displayName: string | null; role: string; walletBalance: string };
  payout: {
    phone: string | null; method: 'B2C' | 'MANUAL' | null; conversationId: string | null; mpesaTxnId: string | null;
    requestedAt: string | null; completedAt: string | null; failureReason: string | null; lastAttemptAt: string | null;
  };
}
export interface WithdrawalSummary {
  pending: number; pendingAmount: number; completed: number; completedAmount: number; rejected: number;
}
export const getWithdrawals = (params: { page: number; status?: string; role?: string; search?: string }) =>
  paged<AdminWithdrawal, WithdrawalSummary>('/admin/withdrawals', { limit: 20, ...params });

// ---------- referrals ----------
export interface Person { id: string; email: string; firstName: string; lastName: string; displayName: string | null; role: string }
export interface AdminReferral {
  id: string;
  status: 'PENDING' | 'COMPLETED' | 'REJECTED' | string;
  rewardAmount: number;
  createdAt: string;
  codeUsed: string | null;
  scope: 'dating' | 'escort' | 'other';
  referrer: Person;
  referred: Person | null;
  payment: { id: string; type: string; amount: number; createdAt: string } | null;
}
export interface ScopeSummary { count: number; rewards: number; pending: number }
export const getReferrals = (params: { page: number; status?: string; scope?: string }) =>
  paged<AdminReferral, { dating: ScopeSummary; escort: ScopeSummary }>('/admin/referrals', { limit: 20, ...params });

// ---------- escorts ----------
export interface PlanSpan { tier: Tier; startsAt: string; expiresAt: string }
export interface AdminEscort {
  id: string;
  photos: string[];
  contactPhone: string;
  about: string | null;
  verified: boolean;
  moderationStatus: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED' | string;
  createdAt: string;
  displayName: string | null;
  age: number | null;
  city: string | null;
  area: string | null;
  currentPlan: (PlanSpan & { amountPaid: number }) | null;
  queuedPlans: PlanSpan[];
  paidUntil: string | null;
  totalViews?: number;
  user: { id: string; email: string; phone: string; firstName: string; lastName: string; displayName: string | null; gender: string | null; isActive: boolean; lastLogin: string | null };
}
export interface EscortSummary {
  total: number; byTier: Record<Tier, number>; withoutPlan: number; pendingModeration: number; verified: number;
}
export const getEscorts = (params: { page: number; tier?: string; verified?: string; status?: string; search?: string }) =>
  paged<AdminEscort, EscortSummary>('/admin/escorts', { limit: 20, ...params });

// ---------- dating users ----------
export interface AdminDatingUser {
  id: string; email: string; phone: string; firstName: string; lastName: string; displayName: string | null;
  role: string; isActive: boolean; createdAt: string; lastLogin: string | null; walletBalance: string;
  datingSubscriptionExpiresAt: string | null; subscriptionActive: boolean;
  photo: string | null; photos: string[]; city: string | null; area: string | null; age: number | null;
  gender: string | null; interests: string[];
}
export interface UserSummary { total: number; activeSubscribers: number; expiredSubscribers: number; newThisWeek: number; inactive: number }
export const getUsers = (params: { page: number; role?: string; subscription?: string; search?: string; limit?: number }) =>
  paged<AdminDatingUser, UserSummary>('/admin/users', { limit: 20, ...params });

// ---------- dashboard ----------
export interface DashboardInsights {
  users: {
    total: number; escorts: number; datingUsers: number; hookupUsers: number;
    newLast7Days: { total: number; escorts: number; datingUsers: number; hookupUsers: number };
  };
  payments: {
    count: number; totalRevenue: number; last30Days: number; today: number;
    byType: { type: string; amount: number; count: number }[];
  };
  subscriptions: { escortsByTier: Record<Tier, number>; escortsWithoutPlan: number; datingSubscribers: number };
  pending: { verifications: number; withdrawals: number; withdrawalAmount: number; failedPayouts: number };
  series: { date: string; revenue: number; payments: number; signups: number }[];
  recentPayments: { id: string; type: string; status: string; amount: number; createdAt: string; payer: { id: string | null; name: string; role: string | null } }[];
}
export async function getDashboard(): Promise<DashboardInsights> {
  const res = (await api.get<DashboardInsights>('/admin/dashboard')) as any;
  return res.data;
}

// ---------- notifications ----------
export type Audience = 'ALL' | 'DATING_USERS' | 'ESCORTS' | 'HOOKUP_USERS' | 'USER';
export interface AdminNotification {
  id: string; title: string; body: string; audience: Audience; link: string | null; createdAt: string;
  user: { id: string; displayName: string | null; firstName: string; email: string } | null;
  readCount: number; recipientCount: number;
}
export const getNotifications = (page: number) =>
  paged<AdminNotification, undefined>('/admin/notifications', { page, limit: 20 });
export async function sendNotification(input: { title: string; body: string; audience: Audience; userId?: string; link?: string }) {
  const res = (await api.post<AdminNotification>('/admin/notifications', input)) as any;
  return res.data as AdminNotification;
}
export async function deleteNotification(id: string) {
  await api.delete(`/admin/notifications/${id}`);
}

// ---------- escort detail ----------
export interface EscortDetail extends Omit<AdminEscort, 'queuedPlans'> {
  country: string | null;
  languages: string[];
  services: (string | { name: string })[] | null;
  pricing: { hourlyRate?: number; [k: string]: unknown } | null;
  availability: { days?: string[]; hours?: string } | null;
  unlockPrice: number | string;
  averageRating: number | string;
  reviewCount: number;
  totalViews: number;
  queuedPlans: (PlanSpan & { id: string })[];
  planHistory: { id: string; tier: Tier; status: string; startsAt: string; expiresAt: string; amountPaid: number; createdAt: string }[];
  planPayments: { id: string; type: string; status: string; amount: number; mpesaTxnId: string | null; createdAt: string }[];
  unlocks: { count: number; revenue: number };
  user: AdminEscort['user'] & { createdAt: string; walletBalance: string; referralCode: string; dateOfBirth: string | null };
}
export async function getEscortDetail(id: string): Promise<EscortDetail> {
  const res = (await api.get<EscortDetail>(`/admin/escorts/${id}`)) as any;
  return res.data;
}

// ---------- earnings ----------
export type EarningsRange = 'today' | '7d' | '30d' | '90d' | 'all';
export interface EarningsShares { platform: number; serviceFee: number; referralL1: number; referralL2: number; escort: number }
export interface EarningsReport {
  range: EarningsRange;
  from: string | null;
  summary: { grossRevenue: number; netPlatformEarnings: number; serviceFeeOwed: number; totalPayouts: number; unledgeredRevenue: number; paymentCount: number };
  bySource: { type: string; revenue: number; count: number; shares: EarningsShares; unledgered: number }[];
  escortPlansByTier: { tier: Tier | 'UNKNOWN'; revenue: number; count: number }[];
  earnings: { platform: number; serviceFee: number; referrals: number; escorts: number };
  payouts: { withdrawalsPaid: number; withdrawalsPaidCount: number; withdrawalsPending: number; withdrawalsPendingCount: number; referralCredits: number; escortCredits: number };
  splits: { scope: string; platformPercent: number; serviceFeePercent: number; level1Percent: number; level2Percent: number; escortPercent: number }[];
  months: { month: string; revenue: number; platform: number }[];
}
export async function getEarnings(range: EarningsRange): Promise<EarningsReport> {
  const res = (await api.get<EarningsReport>('/admin/earnings', { params: { range } })) as any;
  return res.data;
}
