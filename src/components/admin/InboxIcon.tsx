import { UserPlus, ShieldCheck, Banknote, AlertTriangle, Wallet, XCircle, Star } from 'lucide-react';
import type { InboxType } from '@/lib/api/inbox';

const STYLE: Record<InboxType, { Icon: typeof Star; tone: string }> = {
  NEW_USER: { Icon: UserPlus, tone: 'bg-sky-50 text-sky-700' },
  ESCORT_PENDING_REVIEW: { Icon: ShieldCheck, tone: 'bg-amber-50 text-amber-700' },
  PAYMENT_RECEIVED: { Icon: Banknote, tone: 'bg-emerald-50 text-emerald-700' },
  PAYMENT_FLAGGED: { Icon: AlertTriangle, tone: 'bg-red-50 text-red-700' },
  WITHDRAWAL_REQUESTED: { Icon: Wallet, tone: 'bg-violet-50 text-violet-700' },
  PAYOUT_FAILED: { Icon: XCircle, tone: 'bg-red-50 text-red-700' },
  NEW_REVIEW: { Icon: Star, tone: 'bg-gray-100 text-gray-700' },
};

export function InboxIcon({ type, size = 'md' }: { type: InboxType; size?: 'sm' | 'md' }) {
  const { Icon, tone } = STYLE[type] ?? STYLE.NEW_REVIEW;
  const box = size === 'sm' ? 'h-8 w-8' : 'h-10 w-10';
  return (
    <span className={`flex ${box} flex-shrink-0 items-center justify-center rounded-full ${tone}`}>
      <Icon className="h-4 w-4" aria-hidden />
    </span>
  );
}
