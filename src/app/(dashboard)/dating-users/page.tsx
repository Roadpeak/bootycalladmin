'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Heart, Users, UserPlus, UserX, MapPin } from 'lucide-react';
import { adminService, handleApiError } from '@/lib/api';
import { getUsers, type AdminDatingUser, type UserSummary } from '@/lib/api/insights';
import type { Pagination } from '@/types/api';
import {
  PageHeader, StatCard, Tabs, SearchInput, Pager, TableShell, StatusBadge, Avatar, ErrorBanner,
  date, personName, th, td, useDebounced,
} from '@/components/admin/ui';

type SubTab = 'all' | 'active' | 'expired' | 'none';

/** Dating members with their photo, location and subscription state. */
export default function DatingUsersPage() {
  const [sub, setSub] = useState<SubTab>('all');
  const [search, setSearch] = useState('');
  const debounced = useDebounced(search);
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState<AdminDatingUser[]>([]);
  const [summary, setSummary] = useState<UserSummary | null>(null);
  const [info, setInfo] = useState<Pagination>({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [reload, setReload] = useState(0);

  useEffect(() => { setPage(1); }, [sub, debounced]);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getUsers({ page, role: 'DATING_USER', subscription: sub === 'all' ? undefined : sub, search: debounced || undefined })
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
  }, [page, sub, debounced, reload]);

  async function toggleActive(u: AdminDatingUser) {
    try {
      setBusy(u.id);
      await adminService.updateUserStatus(u.id, { isActive: !u.isActive });
      setReload((n) => n + 1);
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Dating Users" description="Members of the dating side, their profile and whether their subscription is active." />
      <ErrorBanner message={error} />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Members" value={summary?.total ?? '—'} hint={`${summary?.inactive ?? 0} deactivated`} icon={<Users className="h-5 w-5" />} />
        <StatCard label="Subscribed" value={summary?.activeSubscribers ?? '—'} hint="Active dating subscription" icon={<Heart className="h-5 w-5" />} />
        <StatCard label="Lapsed" value={summary?.expiredSubscribers ?? '—'} hint="Subscription expired" icon={<UserX className="h-5 w-5" />} />
        <StatCard label="New this week" value={summary?.newThisWeek ?? '—'} hint="Joined in the last 7 days" icon={<UserPlus className="h-5 w-5" />} />
      </div>

      <div className="rounded-xl border border-gray-200 bg-white">
        <div className="flex flex-col gap-3 border-b border-gray-200 p-4 sm:flex-row sm:items-center sm:justify-between">
          <Tabs<SubTab>
            value={sub}
            onChange={setSub}
            options={[
              { value: 'all', label: 'All', count: summary?.total },
              { value: 'active', label: 'Subscribed', count: summary?.activeSubscribers },
              { value: 'expired', label: 'Lapsed', count: summary?.expiredSubscribers },
              { value: 'none', label: 'Never subscribed' },
            ]}
          />
          <SearchInput value={search} onChange={setSearch} placeholder="Name, email or phone" />
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className={th}>Member</th>
                <th className={th}>Location</th>
                <th className={th}>Subscription</th>
                <th className={th}>Contact</th>
                <th className={th}>Joined</th>
                <th className={th}>Account</th>
                <th className={th} />
              </tr>
            </thead>
            <TableShell loading={loading} empty={rows.length === 0} colSpan={7}>
              {rows.map((u) => {
                const name = personName(u);
                return (
                  <tr key={u.id} className="hover:bg-gray-50">
                    <td className={td}>
                      <div className="flex items-center gap-3">
                        <Avatar src={u.photo} name={name} />
                        <div>
                          <p className="font-medium text-gray-900">{name}</p>
                          <p className="text-xs text-gray-500">{[u.age ? `${u.age} yrs` : null, u.gender, `${u.photos.length} photo${u.photos.length === 1 ? '' : 's'}`].filter(Boolean).join(' · ')}</p>
                        </div>
                      </div>
                    </td>
                    <td className={td}>
                      {u.city || u.area ? (
                        <span className="inline-flex items-start gap-1"><MapPin className="mt-0.5 h-3.5 w-3.5 text-gray-400" />{[u.area, u.city].filter(Boolean).join(', ')}</span>
                      ) : <span className="text-gray-400">Not set</span>}
                    </td>
                    <td className={td}>
                      {u.subscriptionActive ? (
                        <><StatusBadge status="ACTIVE" label="Subscribed" /><p className="mt-1 text-xs text-gray-500">until {date(u.datingSubscriptionExpiresAt)}</p></>
                      ) : u.datingSubscriptionExpiresAt ? (
                        <><StatusBadge status="EXPIRED" label="Lapsed" /><p className="mt-1 text-xs text-gray-500">ended {date(u.datingSubscriptionExpiresAt)}</p></>
                      ) : <span className="text-gray-400">Never</span>}
                    </td>
                    <td className={td}>
                      <p className="font-mono text-xs">{u.phone}</p>
                      <p className="text-xs text-gray-500">{u.email}</p>
                    </td>
                    <td className={`${td} whitespace-nowrap`}>
                      <p>{date(u.createdAt)}</p>
                      {u.lastLogin && <p className="text-xs text-gray-500">seen {date(u.lastLogin)}</p>}
                    </td>
                    <td className={td}>{u.isActive ? <StatusBadge status="ACTIVE" label="Active" /> : <StatusBadge status="SUSPENDED" label="Deactivated" />}</td>
                    <td className={`${td} whitespace-nowrap text-right`}>
                      <div className="flex flex-col items-end gap-1.5">
                        <Link href={`/dating-users/${u.id}`} className="text-xs font-medium text-gray-700 hover:text-gray-900">View</Link>
                        <button type="button" disabled={busy === u.id} onClick={() => toggleActive(u)} className={`text-xs font-medium disabled:opacity-40 ${u.isActive ? 'text-red-700' : 'text-green-700'}`}>
                          {u.isActive ? 'Deactivate' : 'Activate'}
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
