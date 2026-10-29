'use client';

import Link from 'next/link';
import { ChevronLeft, ChevronRight, Search, X } from 'lucide-react';
import { useEffect, useState, type ReactNode } from 'react';
import type { Pagination as PageInfo } from '@/types/api';
import type { Tier } from '@/lib/api/insights';

export const money = (value: number | string | null | undefined) =>
  `KSh ${Math.abs(Number(value ?? 0)).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;

export const date = (value: string | null | undefined) =>
  value ? new Date(value).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

export const dateTime = (value: string | null | undefined) =>
  value
    ? new Date(value).toLocaleString(undefined, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
    : '—';

export const personName = (p?: { displayName?: string | null; firstName?: string; lastName?: string } | null) =>
  p ? p.displayName || [p.firstName, p.lastName].filter(Boolean).join(' ') || '—' : '—';

export const TIER_LABEL: Record<Tier, string> = { VVIP: 'VVIP', VIP: 'VIP', PRIME: 'Prime', REGULAR: 'Regular' };
const TIER_CLASS: Record<Tier, string> = {
  VVIP: 'bg-purple-100 text-purple-800 ring-purple-200',
  VIP: 'bg-blue-100 text-blue-800 ring-blue-200',
  PRIME: 'bg-emerald-100 text-emerald-800 ring-emerald-200',
  REGULAR: 'bg-orange-100 text-orange-800 ring-orange-200',
};

export function TierBadge({ tier }: { tier: Tier | null | undefined }) {
  if (!tier) return <span className="inline-flex rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600 ring-1 ring-gray-200">No plan</span>;
  return <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ${TIER_CLASS[tier]}`}>{TIER_LABEL[tier]}</span>;
}

const STATUS_CLASS: Record<string, string> = {
  COMPLETED: 'bg-green-100 text-green-800',
  APPROVED: 'bg-green-100 text-green-800',
  ACTIVE: 'bg-green-100 text-green-800',
  PENDING: 'bg-yellow-100 text-yellow-800',
  FAILED: 'bg-red-100 text-red-800',
  REJECTED: 'bg-red-100 text-red-800',
  SUSPENDED: 'bg-red-100 text-red-800',
  EXPIRED: 'bg-gray-100 text-gray-700',
  REFUNDED: 'bg-gray-100 text-gray-700',
};

export function StatusBadge({ status, label }: { status: string; label?: string }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_CLASS[status] ?? 'bg-gray-100 text-gray-700'}`}>
      {label ?? status.charAt(0) + status.slice(1).toLowerCase()}
    </span>
  );
}

export function PageHeader({ title, description, actions }: { title: string; description?: string; actions?: ReactNode }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        {description && <p className="mt-1 text-sm text-gray-600">{description}</p>}
      </div>
      {actions}
    </div>
  );
}

export function StatCard({ label, value, hint, icon, href }: { label: string; value: ReactNode; hint?: ReactNode; icon?: ReactNode; href?: string }) {
  const body = (
    <div className="h-full rounded-xl border border-gray-200 bg-white p-5 transition-shadow hover:shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm font-medium text-gray-500">{label}</p>
        {icon && <div className="text-gray-400">{icon}</div>}
      </div>
      <p className="mt-2 text-2xl font-bold text-gray-900">{value}</p>
      {hint && <p className="mt-1 text-xs text-gray-500">{hint}</p>}
    </div>
  );
  return href ? <Link href={href}>{body}</Link> : body;
}

export function Tabs<T extends string>({ value, onChange, options }: { value: T; onChange: (v: T) => void; options: { value: T; label: string; count?: number }[] }) {
  return (
    <div className="flex flex-wrap gap-1 rounded-lg bg-gray-100 p-1">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${value === o.value ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
        >
          {o.label}
          {o.count !== undefined && <span className="ml-1.5 text-xs text-gray-400">{o.count}</span>}
        </button>
      ))}
    </div>
  );
}

export function SearchInput({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <div className="relative w-full sm:w-72">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-8 text-sm focus:border-transparent focus:ring-2 focus:ring-amber-500"
      />
      {value && (
        <button type="button" onClick={() => onChange('')} aria-label="Clear" className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700">
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

export function Pager({ info, onPage }: { info: PageInfo; onPage: (p: number) => void }) {
  if (info.totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3 text-sm text-gray-600">
      <span>
        Page {info.page} of {info.totalPages} · {info.total.toLocaleString()} total
      </span>
      <div className="flex gap-2">
        <button type="button" disabled={info.page <= 1} onClick={() => onPage(info.page - 1)} className="rounded-lg border border-gray-300 p-1.5 disabled:opacity-40" aria-label="Previous page">
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button type="button" disabled={info.page >= info.totalPages} onClick={() => onPage(info.page + 1)} className="rounded-lg border border-gray-300 p-1.5 disabled:opacity-40" aria-label="Next page">
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

export function TableShell({ loading, empty, children, colSpan }: { loading: boolean; empty: boolean; children: ReactNode; colSpan: number }) {
  if (loading) {
    return (
      <tbody>
        {[...Array(5)].map((_, i) => (
          <tr key={i}>
            <td colSpan={colSpan} className="px-4 py-3"><div className="h-6 animate-pulse rounded bg-gray-100" /></td>
          </tr>
        ))}
      </tbody>
    );
  }
  if (empty) {
    return (
      <tbody>
        <tr><td colSpan={colSpan} className="px-4 py-12 text-center text-sm text-gray-500">Nothing to show for these filters.</td></tr>
      </tbody>
    );
  }
  return <tbody className="divide-y divide-gray-100">{children}</tbody>;
}

export const th = 'px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500';
export const td = 'px-4 py-3 text-sm text-gray-700 align-top';

export function Avatar({ src, name }: { src?: string | null; name: string }) {
  return src ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={name} className="h-10 w-10 flex-shrink-0 rounded-full object-cover ring-1 ring-gray-200" />
  ) : (
    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gray-100 text-sm font-semibold text-gray-500">
      {(name || '?').charAt(0).toUpperCase()}
    </div>
  );
}

export function ErrorBanner({ message }: { message: string | null }) {
  if (!message) return null;
  return <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{message}</div>;
}

/** Debounced value, for search boxes that query the API. */
export function useDebounced<T>(value: T, ms = 350): T {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return v;
}
