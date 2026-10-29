'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ChevronRight, Heart, Crown, Gift, Clock } from 'lucide-react';
import { adminService, handleApiError } from '@/lib/api';
import { getReferrals, type AdminReferral, type ScopeSummary } from '@/lib/api/insights';
import type { Pagination } from '@/types/api';
import {
  PageHeader, StatCard, Tabs, Pager, TableShell, StatusBadge, ErrorBanner,
  money, dateTime, personName, th, td,
} from '@/components/admin/ui';

type Scope = 'all' | 'dating' | 'escort';
type Status = 'all' | 'PENDING' | 'COMPLETED' | 'REJECTED';

const SCOPE_BADGE: Record<AdminReferral['scope'], { label: string; cls: string }> = {
  dating: { label: 'Dating', cls: 'bg-pink-100 text-pink-800' },
  escort: { label: 'Escort', cls: 'bg-purple-100 text-purple-800' },
  other: { label: 'Other', cls: 'bg-gray-100 text-gray-700' },
};

const PAYMENT_LABEL: Record<string, string> = {
  DATING_SUBSCRIPTION: 'Dating subscription',
  ESCORT_SUBSCRIPTION: 'Escort plan',
  VIP_SUBSCRIPTION: 'Flat-rate VIP',
  UNLOCK_ESCORT: 'Contact unlock',
};

const ROLE_LABEL: Record<string, string> = {
  DATING_USER: 'Dating', ESCORT: 'Escort', HOOKUP_USER: 'Hookup',
};

/**
 * Referral rewards, split by what earned them: a dating subscription or an
 * escort plan. Each side has its own totals.
 */
export default function ReferralProgramPage() {
  const [scope, setScope] = useState<Scope>('all');
  const [status, setStatus] = useState<Status>('all');
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState<AdminReferral[]>([]);
  const [summary, setSummary] = useState<{ dating: ScopeSummary; escort: ScopeSummary } | null>(null);
  const [info, setInfo] = useState<Pagination>({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reload, setReload] = useState(0);

  useEffect(() => { setPage(1); }, [scope, status]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getReferrals({ page, scope: scope === 'all' ? undefined : scope, status: status === 'all' ? undefined : status })
      .then((res) => {
        if (cancelled) return;
        setRows(res.data);
        setSummary(res.summary);
        setInfo(res.pagination);
        setError(null);
      })
      .catch((err) => !cancelled && setError(handleApiError(err)))
      .finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; };
  }, [page, scope, status, reload]);

  async function decide(id: string, approve: boolean) {
    try {
      await adminService.approveReferral(id, { approve });
      setReload((n) => n + 1);
    } catch (err) {
      setError(handleApiError(err));
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Referral Program"
        description="Rewards earned when someone you referred pays. Split by whether the payment was a dating subscription or an escort plan."
        actions={
          <Link href="/referral-program/cashouts" className="inline-flex items-center rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800">
            Referral cashouts <ChevronRight className="ml-1 h-4 w-4" />
          </Link>
        }
      />
      <ErrorBanner message={error} />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Dating referrals" value={summary?.dating.count ?? '—'} hint={`${summary?.dating.pending ?? 0} pending`} icon={<Heart className="h-5 w-5" />} />
        <StatCard label="Dating rewards" value={money(summary?.dating.rewards)} hint="From dating subscriptions" icon={<Gift className="h-5 w-5" />} />
        <StatCard label="Escort referrals" value={summary?.escort.count ?? '—'} hint={`${summary?.escort.pending ?? 0} pending`} icon={<Crown className="h-5 w-5" />} />
        <StatCard label="Escort rewards" value={money(summary?.escort.rewards)} hint="From escort plans" icon={<Clock className="h-5 w-5" />} />
      </div>

      <div className="rounded-xl border border-gray-200 bg-white">
        <div className="flex flex-col gap-3 border-b border-gray-200 p-4 lg:flex-row lg:items-center lg:justify-between">
          <Tabs<Scope>
            value={scope}
            onChange={setScope}
            options={[
              { value: 'all', label: 'All' },
              { value: 'dating', label: 'Dating', count: summary?.dating.count },
              { value: 'escort', label: 'Escort', count: summary?.escort.count },
            ]}
          />
          <Tabs<Status>
            value={status}
            onChange={setStatus}
            options={[
              { value: 'all', label: 'Any status' },
              { value: 'PENDING', label: 'Pending' },
              { value: 'COMPLETED', label: 'Completed' },
              { value: 'REJECTED', label: 'Rejected' },
            ]}
          />
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className={th}>Referrer</th>
                <th className={th}>Referred</th>
                <th className={th}>Side</th>
                <th className={th}>Payment</th>
                <th className={th}>Reward</th>
                <th className={th}>Status</th>
                <th className={th}>Date</th>
                <th className={th} />
              </tr>
            </thead>
            <TableShell loading={loading} empty={rows.length === 0} colSpan={8}>
              {rows.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className={td}>
                    <p className="font-medium text-gray-900">{personName(r.referrer)}</p>
                    <p className="text-xs text-gray-500">{ROLE_LABEL[r.referrer.role] ?? r.referrer.role} · {r.referrer.email}</p>
                  </td>
                  <td className={td}>
                    {r.referred ? (
                      <>
                        <p className="font-medium text-gray-900">{personName(r.referred)}</p>
                        <p className="text-xs text-gray-500">{ROLE_LABEL[r.referred.role] ?? r.referred.role}</p>
                      </>
                    ) : '—'}
                  </td>
                  <td className={td}>
                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${SCOPE_BADGE[r.scope].cls}`}>{SCOPE_BADGE[r.scope].label}</span>
                  </td>
                  <td className={td}>
                    {r.payment ? (
                      <>
                        <p>{PAYMENT_LABEL[r.payment.type] ?? r.payment.type}</p>
                        <p className="text-xs text-gray-500">{money(r.payment.amount)}</p>
                      </>
                    ) : '—'}
                  </td>
                  <td className={`${td} font-semibold text-gray-900`}>{money(r.rewardAmount)}</td>
                  <td className={td}><StatusBadge status={r.status} /></td>
                  <td className={`${td} whitespace-nowrap`}>{dateTime(r.createdAt)}</td>
                  <td className={`${td} whitespace-nowrap text-right`}>
                    {r.status === 'PENDING' && (
                      <div className="flex justify-end gap-2">
                        <button type="button" onClick={() => decide(r.id, true)} className="rounded-lg bg-green-600 px-3 py-1 text-xs font-medium text-white hover:bg-green-700">Approve</button>
                        <button type="button" onClick={() => decide(r.id, false)} className="rounded-lg border border-gray-300 px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50">Reject</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </TableShell>
          </table>
        </div>
        <Pager info={info} onPage={setPage} />
      </div>
    </div>
  );
}
