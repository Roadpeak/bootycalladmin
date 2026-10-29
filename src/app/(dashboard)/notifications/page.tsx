'use client';

import { useEffect, useState } from 'react';
import { Send, Trash2, Loader2 } from 'lucide-react';
import { handleApiError } from '@/lib/api';
import {
  getNotifications, sendNotification, deleteNotification, getUsers,
  type AdminNotification, type Audience, type AdminDatingUser,
} from '@/lib/api/insights';
import type { Pagination } from '@/types/api';
import { PageHeader, Pager, TableShell, ErrorBanner, SearchInput, dateTime, personName, th, td, useDebounced } from '@/components/admin/ui';

const AUDIENCES: { value: Audience; label: string; hint: string }[] = [
  { value: 'ALL', label: 'Everyone', hint: 'All members' },
  { value: 'ESCORTS', label: 'Escorts', hint: 'Every escort account' },
  { value: 'DATING_USERS', label: 'Dating users', hint: 'Every dating member' },
  { value: 'HOOKUP_USERS', label: 'Hookup users', hint: 'Clients who browse escorts' },
  { value: 'USER', label: 'One person', hint: 'Search for a member' },
];
const AUDIENCE_LABEL = Object.fromEntries(AUDIENCES.map((a) => [a.value, a.label])) as Record<Audience, string>;

const LINKS = [
  { value: '', label: 'No link' },
  { value: '/subscription/escort', label: 'Escort plans' },
  { value: '/subscription/dating', label: 'Dating subscription' },
  { value: '/escorts', label: 'Browse escorts' },
  { value: '/dating', label: 'Dating' },
  { value: '/referral', label: 'Referrals' },
  { value: '/wallet', label: 'Wallet' },
];

/**
 * Send in-app notifications. They appear in the bell on the website, live for
 * anyone online, and stay there until read.
 */
export default function NotificationsPage() {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [audience, setAudience] = useState<Audience>('ALL');
  const [link, setLink] = useState('');
  const [recipient, setRecipient] = useState<AdminDatingUser | null>(null);
  const [query, setQuery] = useState('');
  const debounced = useDebounced(query);
  const [matches, setMatches] = useState<AdminDatingUser[]>([]);
  const [sending, setSending] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [rows, setRows] = useState<AdminNotification[]>([]);
  const [info, setInfo] = useState<Pagination>({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [reload, setReload] = useState(0);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getNotifications(page)
      .then((res) => { if (!cancelled) { setRows(res.data); setInfo(res.pagination); } })
      .catch((err) => !cancelled && setError(handleApiError(err)))
      .finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; };
  }, [page, reload]);

  useEffect(() => {
    if (audience !== 'USER' || debounced.trim().length < 2) { setMatches([]); return; }
    let cancelled = false;
    getUsers({ page: 1, limit: 8, search: debounced.trim() })
      .then((res) => !cancelled && setMatches(res.data))
      .catch(() => !cancelled && setMatches([]));
    return () => { cancelled = true; };
  }, [debounced, audience]);

  const canSend = title.trim() && body.trim() && (audience !== 'USER' || recipient) && !sending;

  async function send() {
    if (!canSend) return;
    try {
      setSending(true);
      setError(null);
      await sendNotification({
        title: title.trim(),
        body: body.trim(),
        audience,
        ...(audience === 'USER' && recipient ? { userId: recipient.id } : {}),
        ...(link ? { link } : {}),
      });
      setNotice(`Sent to ${audience === 'USER' && recipient ? personName(recipient) : AUDIENCE_LABEL[audience].toLowerCase()}.`);
      setTimeout(() => setNotice(null), 3000);
      setTitle(''); setBody(''); setLink(''); setRecipient(null); setQuery('');
      setPage(1);
      setReload((n) => n + 1);
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setSending(false);
    }
  }

  async function remove(id: string) {
    try {
      await deleteNotification(id);
      setConfirmDelete(null);
      setReload((n) => n + 1);
    } catch (err) {
      setError(handleApiError(err));
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Send Notifications" description="Messages that appear in members' notification bell on the website. People online see them immediately." />
      <ErrorBanner message={error} />
      {notice && <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">{notice}</div>}

      <section className="rounded-xl border border-gray-200 bg-white p-5">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">New notification</h2>
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="space-y-4">
            <div>
              <label htmlFor="n-title" className="mb-1 block text-sm font-medium text-gray-700">Title</label>
              <input id="n-title" value={title} maxLength={120} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. VVIP plans are 20% off this weekend" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-amber-500" />
            </div>
            <div>
              <label htmlFor="n-body" className="mb-1 block text-sm font-medium text-gray-700">Message</label>
              <textarea id="n-body" value={body} maxLength={2000} rows={5} onChange={(e) => setBody(e.target.value)} placeholder="What do you want members to know?" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-amber-500" />
              <p className="mt-1 text-right text-xs text-gray-400">{body.length}/2000</p>
            </div>
            <div>
              <label htmlFor="n-link" className="mb-1 block text-sm font-medium text-gray-700">Opens</label>
              <select id="n-link" value={link} onChange={(e) => setLink(e.target.value)} className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm">
                {LINKS.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
              </select>
            </div>
          </div>

          <div className="space-y-4">
            <fieldset>
              <legend className="mb-2 text-sm font-medium text-gray-700">Send to</legend>
              <div className="grid grid-cols-2 gap-2">
                {AUDIENCES.map((a) => (
                  <label key={a.value} className={`cursor-pointer rounded-lg border p-3 text-sm ${audience === a.value ? 'border-amber-500 bg-amber-50' : 'border-gray-200 hover:border-gray-300'}`}>
                    <input type="radio" name="audience" value={a.value} checked={audience === a.value} onChange={() => setAudience(a.value)} className="sr-only" />
                    <span className="block font-medium text-gray-900">{a.label}</span>
                    <span className="block text-xs text-gray-500">{a.hint}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            {audience === 'USER' && (
              <div>
                {recipient ? (
                  <div className="flex items-center justify-between rounded-lg border border-gray-200 px-3 py-2 text-sm">
                    <span><span className="font-medium">{personName(recipient)}</span> <span className="text-gray-500">· {recipient.email}</span></span>
                    <button type="button" onClick={() => setRecipient(null)} className="text-xs text-gray-500 hover:text-gray-900">Change</button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <SearchInput value={query} onChange={setQuery} placeholder="Search name, email or phone" />
                    {matches.length > 0 && (
                      <ul className="divide-y divide-gray-100 rounded-lg border border-gray-200">
                        {matches.map((m) => (
                          <li key={m.id}>
                            <button type="button" onClick={() => setRecipient(m)} className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50">
                              <span className="font-medium">{personName(m)}</span> <span className="text-gray-500">· {m.role.replace('_USER', '').toLowerCase()} · {m.email}</span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>
            )}

            <div className="rounded-lg border border-dashed border-gray-300 p-3">
              <p className="text-xs font-medium uppercase tracking-wide text-gray-400">Preview</p>
              <p className="mt-1 text-sm font-semibold text-gray-900">{title || 'Title'}</p>
              <p className="text-sm text-gray-600">{body || 'Your message'}</p>
            </div>

            <button type="button" disabled={!canSend} onClick={send} className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-gray-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-40">
              {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              Send notification
            </button>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-gray-200 bg-white">
        <h2 className="border-b border-gray-200 px-5 py-4 text-lg font-semibold text-gray-900">Sent</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr><th className={th}>Notification</th><th className={th}>Audience</th><th className={th}>Read</th><th className={th}>Sent</th><th className={th} /></tr>
            </thead>
            <TableShell loading={loading} empty={rows.length === 0} colSpan={5}>
              {rows.map((n) => (
                <tr key={n.id} className="hover:bg-gray-50">
                  <td className={`${td} max-w-md`}>
                    <p className="font-medium text-gray-900">{n.title}</p>
                    <p className="line-clamp-2 text-xs text-gray-500">{n.body}</p>
                    {n.link && <p className="mt-1 font-mono text-xs text-gray-400">{n.link}</p>}
                  </td>
                  <td className={td}>{n.audience === 'USER' && n.user ? personName(n.user) : AUDIENCE_LABEL[n.audience]}</td>
                  <td className={`${td} whitespace-nowrap`}>{n.readCount} of {n.recipientCount}</td>
                  <td className={`${td} whitespace-nowrap`}>{dateTime(n.createdAt)}</td>
                  <td className={`${td} whitespace-nowrap text-right`}>
                    {confirmDelete === n.id ? (
                      <span className="inline-flex items-center gap-2">
                        <button type="button" onClick={() => remove(n.id)} className="rounded-lg bg-red-600 px-2.5 py-1 text-xs font-medium text-white">Delete</button>
                        <button type="button" onClick={() => setConfirmDelete(null)} className="text-xs text-gray-500">Keep</button>
                      </span>
                    ) : (
                      <button type="button" onClick={() => setConfirmDelete(n.id)} aria-label="Delete notification" className="text-gray-400 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>
                    )}
                  </td>
                </tr>
              ))}
            </TableShell>
          </table>
        </div>
        <Pager info={info} onPage={setPage} />
      </section>
    </div>
  );
}
