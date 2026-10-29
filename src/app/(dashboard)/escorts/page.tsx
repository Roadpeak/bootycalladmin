'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Crown, ShieldCheck, Clock, Users, MapPin, Eye } from 'lucide-react';
import { adminService, handleApiError } from '@/lib/api';
import { getEscorts, type AdminEscort, type EscortSummary } from '@/lib/api/insights';
import type { Pagination } from '@/types/api';
import {
  PageHeader, StatCard, Tabs, SearchInput, Pager, TableShell, StatusBadge, TierBadge, Avatar, ErrorBanner,
  date, personName, th, td, useDebounced, TIER_LABEL,
} from '@/components/admin/ui';

type TierTab = 'all' | 'VVIP' | 'VIP' | 'PRIME' | 'REGULAR' | 'NONE';

/**
 * Escorts with what matters for running the listing: their plan (and what is
 * queued after it), where they are, their photos, and verification state.
 */
export default function EscortsPage() {
  const [tier, setTier] = useState<TierTab>('all');
  const [verified, setVerified] = useState('');
  const [moderation, setModeration] = useState('');
  const [search, setSearch] = useState('');
  const debounced = useDebounced(search);
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState<AdminEscort[]>([]);
  const [summary, setSummary] = useState<EscortSummary | null>(null);
  const [info, setInfo] = useState<Pagination>({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [reload, setReload] = useState(0);

  useEffect(() => { setPage(1); }, [tier, verified, moderation, debounced]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getEscorts({
      page,
      tier: tier === 'all' ? undefined : tier,
      verified: verified || undefined,
      status: moderation || undefined,
      search: debounced || undefined,
    })
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
  }, [page, tier, verified, moderation, debounced, reload]);

  async function update(escort: AdminEscort, change: { verified?: boolean; moderationStatus?: 'APPROVED' | 'REJECTED' }) {
    try {
      setBusy(escort.id);
      await adminService.verifyEscort(escort.id, {
        verified: change.verified ?? escort.verified,
        ...(change.moderationStatus ? { moderationStatus: change.moderationStatus } : {}),
      });
      setReload((n) => n + 1);
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setBusy(null);
    }
  }

  const onPlans = summary ? summary.total - summary.withoutPlan : undefined;

  return (
    <div className="space-y-6">
      <PageHeader title="Escorts" description="Plans, locations, photos and verification for every escort profile." />
      <ErrorBanner message={error} />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Escorts" value={summary?.total ?? '—'} hint={`${onPlans ?? '—'} on a plan now`} icon={<Users className="h-5 w-5" />} />
        <StatCard label="VVIP & VIP" value={summary ? summary.byTier.VVIP + summary.byTier.VIP : '—'} hint={`${summary?.byTier.PRIME ?? 0} Prime · ${summary?.byTier.REGULAR ?? 0} Regular`} icon={<Crown className="h-5 w-5" />} />
        <StatCard label="Verified" value={summary?.verified ?? '—'} hint="Identity checked" icon={<ShieldCheck className="h-5 w-5" />} />
        <StatCard label="Awaiting review" value={summary?.pendingModeration ?? '—'} hint="Profiles not yet approved" icon={<Clock className="h-5 w-5" />} />
      </div>

      <div className="rounded-xl border border-gray-200 bg-white">
        <div className="space-y-3 border-b border-gray-200 p-4">
          <Tabs<TierTab>
            value={tier}
            onChange={setTier}
            options={[
              { value: 'all', label: 'All', count: summary?.total },
              ...(['VVIP', 'VIP', 'PRIME', 'REGULAR'] as const).map((t) => ({ value: t, label: TIER_LABEL[t], count: summary?.byTier[t] })),
              { value: 'NONE', label: 'No plan', count: summary?.withoutPlan },
            ]}
          />
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <SearchInput value={search} onChange={setSearch} placeholder="Name, phone, email, city or area" />
            <select value={verified} onChange={(e) => setVerified(e.target.value)} aria-label="Verification" className="rounded-lg border border-gray-300 px-3 py-2 text-sm">
              <option value="">Verified or not</option>
              <option value="true">Verified</option>
              <option value="false">Not verified</option>
            </select>
            <select value={moderation} onChange={(e) => setModeration(e.target.value)} aria-label="Review status" className="rounded-lg border border-gray-300 px-3 py-2 text-sm">
              <option value="">Any review status</option>
              <option value="PENDING">Awaiting review</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
              <option value="SUSPENDED">Suspended</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className={th}>Escort</th>
                <th className={th}>Location</th>
                <th className={th}>Plan</th>
                <th className={th}>Contact</th>
                <th className={th}>Status</th>
                <th className={th}>Joined</th>
                <th className={th} />
              </tr>
            </thead>
            <TableShell loading={loading} empty={rows.length === 0} colSpan={7}>
              {rows.map((e) => {
                const name = e.displayName || personName(e.user);
                return (
                  <tr key={e.id} className="hover:bg-gray-50">
                    <td className={td}>
                      <div className="flex items-center gap-3">
                        <Avatar src={e.photos?.[0]} name={name} />
                        <div>
                          <p className="font-medium text-gray-900">{name}</p>
                          <p className="text-xs text-gray-500">
                            {[e.age ? `${e.age} yrs` : null, e.user.gender, `${e.photos?.length ?? 0} photo${e.photos?.length === 1 ? '' : 's'}`].filter(Boolean).join(' · ')}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className={td}>
                      {e.city || e.area ? (
                        <div className="flex items-start gap-1">
                          <MapPin className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-gray-400" />
                          <div>
                            <p>{e.city ?? '—'}</p>
                            {e.area && <p className="text-xs text-gray-500">{e.area}</p>}
                          </div>
                        </div>
                      ) : <span className="text-gray-400">Not set</span>}
                    </td>
                    <td className={td}>
                      <TierBadge tier={e.currentPlan?.tier} />
                      {e.currentPlan && <p className="mt-1 text-xs text-gray-500">until {date(e.currentPlan.expiresAt)}</p>}
                      {e.queuedPlans.length > 0 && (
                        <p className="text-xs text-gray-500">then {e.queuedPlans.map((q) => TIER_LABEL[q.tier]).join(', ')} · paid to {date(e.paidUntil)}</p>
                      )}
                    </td>
                    <td className={td}>
                      <p className="font-mono text-xs">{e.contactPhone}</p>
                      <p className="text-xs text-gray-500">{e.user.email}</p>
                    </td>
                    <td className={td}>
                      <div className="flex flex-col items-start gap-1">
                        <StatusBadge status={e.moderationStatus} label={e.moderationStatus === 'PENDING' ? 'Awaiting review' : undefined} />
                        {e.verified ? <StatusBadge status="COMPLETED" label="Verified" /> : <StatusBadge status="EXPIRED" label="Not verified" />}
                        {!e.user.isActive && <StatusBadge status="SUSPENDED" label="Account off" />}
                      </div>
                    </td>
                    <td className={`${td} whitespace-nowrap`}>
                      <p>{date(e.createdAt)}</p>
                      {e.user.lastLogin && <p className="text-xs text-gray-500">seen {date(e.user.lastLogin)}</p>}
                    </td>
                    <td className={`${td} whitespace-nowrap`}>
                      <div className="flex flex-col items-end gap-1.5">
                        <Link href={`/escorts/${e.id}`} className="inline-flex items-center gap-1 text-xs font-medium text-gray-700 hover:text-gray-900">
                          <Eye className="h-3.5 w-3.5" /> View
                        </Link>
                        {e.moderationStatus === 'PENDING' && (
                          <div className="flex gap-1.5">
                            <button type="button" disabled={busy === e.id} onClick={() => update(e, { moderationStatus: 'APPROVED' })} className="rounded-lg bg-green-600 px-2.5 py-1 text-xs font-medium text-white disabled:opacity-40">Approve</button>
                            <button type="button" disabled={busy === e.id} onClick={() => update(e, { moderationStatus: 'REJECTED' })} className="rounded-lg border border-red-200 px-2.5 py-1 text-xs font-medium text-red-700 disabled:opacity-40">Reject</button>
                          </div>
                        )}
                        <button type="button" disabled={busy === e.id} onClick={() => update(e, { verified: !e.verified })} className="text-xs font-medium text-amber-700 hover:text-amber-900 disabled:opacity-40">
                          {e.verified ? 'Remove verification' : 'Mark verified'}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </TableShell>
          </table>
        </div>
        <Pager info={info} onPage={setPage} />
      </div>
    </div>
  );
}
