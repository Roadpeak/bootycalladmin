import { api } from './client';
import type { Pagination } from '@/types/api';

/** The admin inbox: platform events behind the top-bar bell. */

export type InboxType =
  | 'NEW_USER'
  | 'ESCORT_PENDING_REVIEW'
  | 'PAYMENT_RECEIVED'
  | 'PAYMENT_FLAGGED'
  | 'WITHDRAWAL_REQUESTED'
  | 'PAYOUT_FAILED'
  | 'NEW_REVIEW';

export interface InboxItem {
  id: string;
  type: InboxType;
  title: string;
  body: string;
  link: string | null;
  createdAt: string;
  isRead: boolean;
  readAt: string | null;
}

export interface InboxPage {
  data: InboxItem[];
  unread: number;
  pagination: Pagination;
}

/** Fired after anything changes read state, so the bell and the page stay in step. */
export const INBOX_CHANGED = 'admin-inbox-changed';
export const announceInboxChange = () => window.dispatchEvent(new Event(INBOX_CHANGED));

export async function getInbox(params: { page?: number; limit?: number; unread?: boolean; type?: InboxType | '' } = {}): Promise<InboxPage> {
  const res = (await api.get<InboxItem[]>('/admin/inbox', {
    params: {
      page: params.page ?? 1,
      limit: params.limit ?? 20,
      ...(params.unread ? { unread: 'true' } : {}),
      ...(params.type ? { type: params.type } : {}),
    },
  })) as any;
  return {
    data: res.data ?? [],
    unread: res.unread ?? 0,
    pagination: res.pagination ?? { page: 1, limit: 20, total: 0, totalPages: 0 },
  };
}

export async function getInboxUnread(): Promise<number> {
  const res = (await api.get<{ unread: number }>('/admin/inbox/unread-count')) as any;
  return res.data?.unread ?? 0;
}

export async function markInboxRead(id: string) {
  await api.post(`/admin/inbox/${id}/read`);
  announceInboxChange();
}

export async function markInboxAllRead() {
  await api.post('/admin/inbox/read-all');
  announceInboxChange();
}

export const INBOX_TYPE_LABEL: Record<InboxType, string> = {
  NEW_USER: 'New signups',
  ESCORT_PENDING_REVIEW: 'Escorts to review',
  PAYMENT_RECEIVED: 'Payments',
  PAYMENT_FLAGGED: 'Flagged payments',
  WITHDRAWAL_REQUESTED: 'Withdrawals',
  PAYOUT_FAILED: 'Failed payouts',
  NEW_REVIEW: 'Reviews',
};

export function timeAgo(iso: string): string {
  const s = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  if (s < 60) return 'just now';
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return new Date(iso).toLocaleDateString('en-KE', { day: 'numeric', month: 'short' });
}
