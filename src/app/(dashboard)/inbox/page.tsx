'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCheck, ChevronRight } from 'lucide-react';
import { PageHeader, Pager, ErrorBanner, Tabs, dateTime } from '@/components/admin/ui';
import { InboxIcon } from '@/components/admin/InboxIcon';
import {
  getInbox,
  markInboxAllRead,
  markInboxRead,
  timeAgo,
  INBOX_CHANGED,
  INBOX_TYPE_LABEL,
  type InboxItem,
  type InboxPage,
  type InboxType,
} from '@/lib/api/inbox';
import { handleApiError } from '@/lib/api';

type View = 'all' | 'unread';

export default function InboxPage() {
  const router = useRouter();
  const [view, setView] = useState<View>('all');
  const [type, setType] = useState<InboxType | ''>('');
  const [page, setPage] = useState(1);
  const [result, setResult] = useState<InboxPage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setResult(await getInbox({ page, limit: 25, unread: view === 'unread', type }));
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  }, [page, view, type]);

  useEffect(() => {
    load();
  }, [load]);

  // Stay in step with the bell, and pick up new alerts while the page is open
  useEffect(() => {
    const timer = setInterval(load, 30_000);
    window.addEventListener(INBOX_CHANGED, load);
    return () => {
      clearInterval(timer);
      window.removeEventListener(INBOX_CHANGED, load);
    };
  }, [load]);

  async function open(item: InboxItem) {
    if (!item.isRead) await markInboxRead(item.id).catch(() => undefined);
    if (item.link) router.push(item.link);
  }

  async function markOne(item: InboxItem) {
    await markInboxRead(item.id).catch((err) => setError(handleApiError(err)));
  }

  const unread = result?.unread ?? 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifications"
        description="Platform events for admins: new signups, escorts to review, payments, withdrawals, failed payouts and reviews."
        actions={
          unread > 0 ? (
            <button
              type="button"
              onClick={() => markInboxAllRead().catch((err) => setError(handleApiError(err)))}
              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <CheckCheck className="h-4 w-4" /> Mark all as read
            </button>
          ) : undefined
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Tabs<View>
          value={view}
          onChange={(v) => {
            setView(v);
            setPage(1);
          }}
          options={[
            { value: 'all', label: 'All' },
            { value: 'unread', label: 'Unread', count: unread },
          ]}
        />
        <select
          value={type}
          onChange={(e) => {
            setType(e.target.value as InboxType | '');
            setPage(1);
          }}
          className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700"
          aria-label="Filter by type"
        >
          <option value="">All types</option>
          {(Object.keys(INBOX_TYPE_LABEL) as InboxType[]).map((t) => (
            <option key={t} value={t}>
              {INBOX_TYPE_LABEL[t]}
            </option>
          ))}
        </select>
      </div>

      <ErrorBanner message={error} />

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        {loading && !result ? (
          <ul className="divide-y divide-gray-100">
            {[...Array(6)].map((_, i) => (
              <li key={i} className="flex gap-4 px-5 py-4">
                <div className="h-10 w-10 animate-pulse rounded-full bg-gray-100" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-1/3 animate-pulse rounded bg-gray-100" />
                  <div className="h-3 w-2/3 animate-pulse rounded bg-gray-100" />
                </div>
              </li>
            ))}
          </ul>
        ) : !result || result.data.length === 0 ? (
          <div className="px-5 py-16 text-center">
            <p className="text-sm font-medium text-gray-900">{view === 'unread' ? 'No unread notifications' : 'No notifications yet'}</p>
            <p className="mt-1 text-sm text-gray-500">New signups, payments and withdrawal requests will appear here.</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {result.data.map((item) => (
              <li key={item.id} className={`group flex items-start gap-4 px-5 py-4 ${item.isRead ? '' : 'bg-red-50/40'}`}>
                <InboxIcon type={item.type} />
                <button type="button" onClick={() => open(item)} className="min-w-0 flex-1 text-left">
                  <span className="flex flex-wrap items-center gap-x-2">
                    <span className={`text-sm ${item.isRead ? 'text-gray-800' : 'font-semibold text-gray-900'}`}>{item.title}</span>
                    <span className="text-xs text-gray-400" title={dateTime(item.createdAt)}>
                      {timeAgo(item.createdAt)}
                    </span>
                  </span>
                  <span className="mt-0.5 block text-sm text-gray-600">{item.body}</span>
                  <span className="mt-1 block text-xs text-gray-400">{INBOX_TYPE_LABEL[item.type]}</span>
                </button>
                <div className="flex flex-shrink-0 items-center gap-2">
                  {!item.isRead && (
                    <button type="button" onClick={() => markOne(item)} className="text-xs font-medium text-gray-500 hover:text-red-700">
                      Mark read
                    </button>
                  )}
                  {item.link && <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-gray-500" aria-hidden />}
                </div>
              </li>
            ))}
          </ul>
        )}
        {result && <Pager info={result.pagination} onPage={setPage} />}
      </div>
    </div>
  );
}
