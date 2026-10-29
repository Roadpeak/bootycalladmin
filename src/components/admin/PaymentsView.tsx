'use client';

import { useEffect, useState } from 'react';
import { CreditCard, TrendingUp, Clock, XCircle } from 'lucide-react';
import { handleApiError } from '@/lib/api';
import { getPayments, type AdminPayment, type PaymentGroup, type PaymentSummary } from '@/lib/api/insights';
import type { Pagination } from '@/types/api';
import {
  PageHeader, StatCard, Tabs, SearchInput, Pager, TableShell, StatusBadge, TierBadge, ErrorBanner,
  money, dateTime, personName, th, td, useDebounced,
} from './ui';

type StatusTab = 'all' | 'COMPLETED' | 'PENDING' | 'FAILED';

const TYPE_LABEL: Record<string, string> = {
  DATING_SUBSCRIPTION: 'Dating subscription',
  ESCORT_SUBSCRIPTION: 'Escort plan',
  VIP_SUBSCRIPTION: 'Flat-rate VIP (legacy)',
  UNLOCK_ESCORT: 'Contact unlock',
  REFUND: 'Refund',
};

/**
 * One payments page per audience. The API groups payment types, so each page
 * shows exactly its own payments and totals cover every page, not just this one.
 */
export default function PaymentsView({ group, title, description }: { group: PaymentGroup; title: string; description: string }) {
  const [status, setStatus] = useState<StatusTab>('all');
  const [search, setSearch] = useState('');
  const debounced = useDebounced(search);
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState<AdminPayment[]>([]);
  const [summary, setSummary] = useState<PaymentSummary | null>(null);
  const [info, setInfo] = useState<Pagination>({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { setPage(1); }, [status, debounced]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getPayments({ group, page, status: status === 'all' ? undefined : status, search: debounced || undefined })
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
  }, [group, page, status, debounced]);

  const showPlan = group === 'escort';
  const showEscort = group === 'hookup';
  const cols = 6 + (showPlan ? 1 : 0) + (showEscort ? 1 : 0);

  return (
    <div className="space-y-6">
      <PageHeader title={title} description={description} />
      <ErrorBanner message={error} />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Revenue" value={money(summary?.revenue)} hint="Completed payments" icon={<TrendingUp className="h-5 w-5" />} />
        <StatCard label="Today" value={money(summary?.revenueToday)} hint="Completed since midnight" icon={<CreditCard className="h-5 w-5" />} />
        <StatCard label="Pending" value={summary?.pending ?? '—'} hint="Waiting for M-Pesa" icon={<Clock className="h-5 w-5" />} />
        <StatCard label="Failed" value={summary?.failed ?? '—'} hint={`${summary?.total ?? 0} payments in total`} icon={<XCircle className="h-5 w-5" />} />
      </div>

      <div className="rounded-xl border border-gray-200 bg-white">
        <div className="flex flex-col gap-3 border-b border-gray-200 p-4 sm:flex-row sm:items-center sm:justify-between">
          <Tabs<StatusTab>
            value={status}
            onChange={setStatus}
            options={[
              { value: 'all', label: 'All', count: summary?.total },
              { value: 'COMPLETED', label: 'Completed', count: summary?.completed },
              { value: 'PENDING', label: 'Pending', count: summary?.pending },
              { value: 'FAILED', label: 'Failed', count: summary?.failed },
            ]}
          />
          <SearchInput value={search} onChange={setSearch} placeholder="Phone, name, email or M-Pesa code" />
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className={th}>Payer</th>
                <th className={th}>Type</th>
                {showPlan && <th className={th}>Plan</th>}
                {showEscort && <th className={th}>Escort unlocked</th>}
                <th className={th}>Amount</th>
                <th className={th}>Status</th>
                <th className={th}>M-Pesa code</th>
                <th className={th}>Date</th>
              </tr>
            </thead>
            <TableShell loading={loading} empty={rows.length === 0} colSpan={cols}>
              {rows.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className={td}>
                    <p className="font-medium text-gray-900">{p.user ? personName(p.user) : 'Guest'}</p>
                    <p className="text-xs text-gray-500">{p.payerPhone}</p>
                  </td>
                  <td className={td}>{TYPE_LABEL[p.type] ?? p.type}</td>
                  {showPlan && (
                    <td className={td}>
                      {p.plan ? (
                        <div className="flex items-center gap-2">
                          <TierBadge tier={p.plan.tier} />
                          <span className="text-xs text-gray-500">{p.plan.durationDays} days</span>
                        </div>
                      ) : '—'}
                    </td>
                  )}
                  {showEscort && <td className={td}>{p.escortName ?? '—'}</td>}
                  <td className={`${td} font-semibold text-gray-900`}>{money(p.amount)}</td>
                  <td className={td}><StatusBadge status={p.status} /></td>
                  <td className={`${td} font-mono text-xs`}>{p.mpesaTxnId ?? '—'}</td>
                  <td className={`${td} whitespace-nowrap`}>{dateTime(p.createdAt)}</td>
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
