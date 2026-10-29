'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Bell, CheckCheck } from 'lucide-react';
import {
  getInbox,
  getInboxUnread,
  markInboxAllRead,
  markInboxRead,
  timeAgo,
  INBOX_CHANGED,
  type InboxItem,
} from '@/lib/api/inbox';
import { InboxIcon } from './InboxIcon';

const POLL_MS = 30_000;

/** Top-bar bell: unread count, a dropdown of the latest alerts, link to the inbox. */
export default function NotificationBell() {
  const router = useRouter();
  const [unread, setUnread] = useState(0);
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<InboxItem[]>([]);
  const [loading, setLoading] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  const refreshCount = useCallback(async () => {
    try {
      setUnread(await getInboxUnread());
    } catch {
      // keep the last known count; the next poll retries
    }
  }, []);

  const loadLatest = useCallback(async () => {
    setLoading(true);
    try {
      const page = await getInbox({ limit: 8 });
      setItems(page.data);
      setUnread(page.unread);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshCount();
    const timer = setInterval(refreshCount, POLL_MS);
    const onFocus = () => refreshCount();
    const onChange = () => (open ? loadLatest() : refreshCount());
    window.addEventListener('focus', onFocus);
    window.addEventListener(INBOX_CHANGED, onChange);
    return () => {
      clearInterval(timer);
      window.removeEventListener('focus', onFocus);
      window.removeEventListener(INBOX_CHANGED, onChange);
    };
  }, [refreshCount, loadLatest, open]);

  useEffect(() => {
    if (!open) return;
    loadLatest();
    const onDown = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open, loadLatest]);

  async function openItem(item: InboxItem) {
    setOpen(false);
    if (!item.isRead) {
      setItems((list) => list.map((i) => (i.id === item.id ? { ...i, isRead: true } : i)));
      setUnread((n) => Math.max(0, n - 1));
      markInboxRead(item.id).catch(() => undefined);
    }
    if (item.link) router.push(item.link);
  }

  async function markAll() {
    setItems((list) => list.map((i) => ({ ...i, isRead: true })));
    setUnread(0);
    await markInboxAllRead().catch(() => undefined);
  }

  return (
    <div className="relative" ref={boxRef}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={unread ? `Notifications, ${unread} unread` : 'Notifications'}
        aria-expanded={open}
        className="relative rounded-lg p-2 text-gray-500 transition-colors hover:bg-red-50 hover:text-red-700"
      >
        <Bell className="h-5 w-5" />
        {unread > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-semibold leading-none text-white">
            {unread > 99 ? '99+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-50 mt-2 w-[22rem] max-w-[calc(100vw-1.5rem)] overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg">
          <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-gray-900">Notifications</p>
              <p className="text-xs text-gray-500">{unread ? `${unread} unread` : 'All caught up'}</p>
            </div>
            {unread > 0 && (
              <button type="button" onClick={markAll} className="flex items-center gap-1 text-xs font-medium text-red-700 hover:text-red-800">
                <CheckCheck className="h-3.5 w-3.5" /> Mark all read
              </button>
            )}
          </div>

          <ul className="max-h-[26rem] divide-y divide-gray-100 overflow-y-auto">
            {loading && items.length === 0 ? (
              [...Array(4)].map((_, i) => (
                <li key={i} className="flex gap-3 px-4 py-3">
                  <div className="h-8 w-8 animate-pulse rounded-full bg-gray-100" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-2/3 animate-pulse rounded bg-gray-100" />
                    <div className="h-3 w-1/2 animate-pulse rounded bg-gray-100" />
                  </div>
                </li>
              ))
            ) : items.length === 0 ? (
              <li className="px-4 py-10 text-center text-sm text-gray-500">No notifications yet.</li>
            ) : (
              items.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    onClick={() => openItem(item)}
                    className={`flex w-full gap-3 px-4 py-3 text-left transition-colors hover:bg-gray-50 ${item.isRead ? '' : 'bg-red-50/40'}`}
                  >
                    <InboxIcon type={item.type} size="sm" />
                    <span className="min-w-0 flex-1">
                      <span className="flex items-start justify-between gap-2">
                        <span className={`truncate text-sm ${item.isRead ? 'text-gray-700' : 'font-semibold text-gray-900'}`}>{item.title}</span>
                        <span className="flex-shrink-0 text-[11px] text-gray-400">{timeAgo(item.createdAt)}</span>
                      </span>
                      <span className="mt-0.5 line-clamp-2 block text-xs text-gray-500">{item.body}</span>
                    </span>
                    {!item.isRead && <span className="mt-1.5 h-2 w-2 flex-shrink-0 rounded-full bg-red-600" aria-label="Unread" />}
                  </button>
                </li>
              ))
            )}
          </ul>

          <Link
            href="/inbox"
            onClick={() => setOpen(false)}
            className="block border-t border-gray-100 px-4 py-2.5 text-center text-sm font-medium text-red-700 hover:bg-gray-50"
          >
            View all notifications
          </Link>
        </div>
      )}
    </div>
  );
}
