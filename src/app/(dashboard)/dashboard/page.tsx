'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, Wallet, Users, Crown, Heart, AlertTriangle, ShieldAlert, ArrowRight } from 'lucide-react';
import { handleApiError } from '@/lib/api';
import { getDashboard, type DashboardInsights, type Tier } from '@/lib/api/insights';
import { StatCard, StatusBadge, ErrorBanner, money, dateTime, th, td, TIER_LABEL } from '@/components/admin/ui';

const BAR = '#e11d48';
const TYPE_LABEL: Record<string, string> = {
  DATING_SUBSCRIPTION: 'Dating subscriptions',
  ESCORT_SUBSCRIPTION: 'Escort plans',
  VIP_SUBSCRIPTION: 'Flat-rate VIP (legacy)',
  UNLOCK_ESCORT: 'Contact unlocks',
  REFUND: 'Refunds',
};
const ROLE_LABEL: Record<string, string> = { DATING_USER: 'Dating', ESCORT: 'Escort', HOOKUP_USER: 'Hookup' };

function RevenueTooltip({ active, payload }: { active?: boolean; payload?: { payload: DashboardInsights['series'][number] }[] }) {
  if (!active || !payload?.length) return null;
  const p = payload[0].payload;
  return (
    <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs shadow-sm">
      <p className="font-medium text-gray-900">{new Date(`${p.date}T00:00:00Z`).toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short', timeZone: 'UTC' })}</p>
      <p className="text-gray-700">{money(p.revenue)} · {p.payments} payment{p.payments === 1 ? '' : 's'}</p>
      <p className="text-gray-500">{p.signups} new member{p.signups === 1 ? '' : 's'}</p>
    </div>
  );
}

export default function DashboardPage() {
  const [d, setD] = useState<DashboardInsights | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getDashboard().then(setD).catch((err) => setError(handleApiError(err)));
  }, []);

  if (!d) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        {error ? <ErrorBanner message={error} /> : (
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">{[...Array(8)].map((_, i) => <div key={i} className="h-28 animate-pulse rounded-xl bg-gray-100" />)}</div>
        )}
      </div>
    );
  }

  const onPlans = Object.values(d.subscriptions.escortsByTier).reduce((a, b) => a + b, 0);
  const maxTier = Math.max(1, ...Object.values(d.subscriptions.escortsByTier), d.subscriptions.escortsWithoutPlan);
  const tierRows: { label: string; value: number }[] = [
    ...(['VVIP', 'VIP', 'PRIME', 'REGULAR'] as Tier[]).map((t) => ({ label: TIER_LABEL[t], value: d.subscriptions.escortsByTier[t] ?? 0 })),
    { label: 'No plan', value: d.subscriptions.escortsWithoutPlan },
  ];
  const revenueByType = [...d.payments.byType].sort((a, b) => b.amount - a.amount);
  const totalByType = revenueByType.reduce((s, r) => s + r.amount, 0) || 1;
  const chartData = d.series.map((p) => ({ ...p, label: new Date(`${p.date}T00:00:00Z`).toLocaleDateString(undefined, { day: 'numeric', month: 'short', timeZone: 'UTC' }) }));
  const attention = d.pending.verifications + d.pending.withdrawals + d.pending.failedPayouts;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-600">Revenue, plans and what needs attention today.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Revenue today" value={money(d.payments.today)} hint="Completed since midnight" icon={<TrendingUp className="h-5 w-5" />} />
        <StatCard label="Last 30 days" value={money(d.payments.last30Days)} hint={`${money(d.payments.totalRevenue)} all time`} icon={<TrendingUp className="h-5 w-5" />} />
        <StatCard label="Escorts on a plan" value={`${onPlans} of ${d.users.escorts}`} hint={`${d.subscriptions.escortsByTier.VVIP} VVIP · ${d.subscriptions.escortsByTier.VIP} VIP`} icon={<Crown className="h-5 w-5" />} href="/escorts" />
        <StatCard label="Dating subscribers" value={d.subscriptions.datingSubscribers} hint={`of ${d.users.datingUsers} dating members`} icon={<Heart className="h-5 w-5" />} href="/dating-users" />
        <StatCard label="Members" value={d.users.total} hint={`+${d.users.newLast7Days.total} this week`} icon={<Users className="h-5 w-5" />} />
        <StatCard label="Pending withdrawals" value={d.pending.withdrawals} hint={`${money(d.pending.withdrawalAmount)} waiting`} icon={<Wallet className="h-5 w-5" />} href="/withdrawals" />
        <StatCard label="Failed payouts" value={d.pending.failedPayouts} hint="M-Pesa refused, needs a retry" icon={<AlertTriangle className="h-5 w-5" />} href="/withdrawals" />
        <StatCard label="Profiles to review" value={d.pending.verifications} hint="Escorts awaiting approval" icon={<ShieldAlert className="h-5 w-5" />} href="/escorts" />
      </div>

      {attention > 0 && (
        <div className="flex flex-col gap-2 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 sm:flex-row sm:items-center sm:justify-between">
          <p>
            <AlertTriangle className="mr-1 inline h-4 w-4" />
            {[
              d.pending.verifications ? `${d.pending.verifications} profile${d.pending.verifications === 1 ? '' : 's'} to review` : null,
              d.pending.withdrawals ? `${d.pending.withdrawals} withdrawal${d.pending.withdrawals === 1 ? '' : 's'} pending` : null,
              d.pending.failedPayouts ? `${d.pending.failedPayouts} failed payout${d.pending.failedPayouts === 1 ? '' : 's'}` : null,
            ].filter(Boolean).join(' · ')}
          </p>
          <div className="flex gap-3">
            {d.pending.verifications > 0 && <Link href="/escorts" className="font-medium underline">Review profiles</Link>}
            {(d.pending.withdrawals > 0 || d.pending.failedPayouts > 0) && <Link href="/withdrawals" className="font-medium underline">Open withdrawals</Link>}
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="rounded-xl border border-gray-200 bg-white p-5 lg:col-span-2">
          <h2 className="text-base font-semibold text-gray-900">Revenue, last 14 days</h2>
          <p className="text-xs text-gray-500">Completed payments per day</p>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} barCategoryGap={2} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                <CartesianGrid vertical={false} stroke="#f1f1f1" />
                <XAxis dataKey="label" tickLine={false} axisLine={{ stroke: '#e5e7eb' }} tick={{ fontSize: 11, fill: '#6b7280' }} interval="preserveStartEnd" />
                <YAxis tickLine={false} axisLine={false} width={56} tick={{ fontSize: 11, fill: '#6b7280' }} tickFormatter={(v) => (v >= 1000 ? `${Math.round(v / 1000)}k` : `${v}`)} />
                <Tooltip content={<RevenueTooltip />} cursor={{ fill: '#f9fafb' }} />
                <Bar dataKey="revenue" fill={BAR} radius={[4, 4, 0, 0]} maxBarSize={28} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="rounded-xl border border-gray-200 bg-white p-5">
          <h2 className="text-base font-semibold text-gray-900">Escorts by plan</h2>
          <p className="text-xs text-gray-500">Plan running right now</p>
          <ul className="mt-4 space-y-3">
            {tierRows.map((r) => (
              <li key={r.label}>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="text-gray-700">{r.label}</span>
                  <span className="font-medium text-gray-900">{r.value}</span>
                </div>
                <div className="h-2 rounded-full bg-gray-100">
                  <div className="h-2 rounded-full" style={{ width: `${(r.value / maxTier) * 100}%`, background: BAR }} />
                </div>
              </li>
            ))}
          </ul>
          <Link href="/escorts" className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-gray-700 hover:text-gray-900">All escorts <ArrowRight className="h-4 w-4" /></Link>
        </section>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="rounded-xl border border-gray-200 bg-white p-5">
          <h2 className="text-base font-semibold text-gray-900">Revenue by source</h2>
          <p className="text-xs text-gray-500">All time, completed payments</p>
          <ul className="mt-4 space-y-3">
            {revenueByType.length === 0 && <li className="text-sm text-gray-500">No payments yet.</li>}
            {revenueByType.map((r) => (
              <li key={r.type}>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="text-gray-700">{TYPE_LABEL[r.type] ?? r.type}</span>
                  <span className="font-medium text-gray-900">{money(r.amount)}</span>
                </div>
                <div className="h-2 rounded-full bg-gray-100">
                  <div className="h-2 rounded-full" style={{ width: `${(r.amount / totalByType) * 100}%`, background: BAR }} />
                </div>
                <p className="mt-0.5 text-xs text-gray-500">{r.count} payment{r.count === 1 ? '' : 's'}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-xl border border-gray-200 bg-white lg:col-span-2">
          <div className="flex items-center justify-between px-5 py-4">
            <h2 className="text-base font-semibold text-gray-900">Recent payments</h2>
            <div className="flex gap-3 text-sm">
              <Link href="/escort-payments" className="text-gray-600 hover:text-gray-900">Escort</Link>
              <Link href="/dating-payments" className="text-gray-600 hover:text-gray-900">Dating</Link>
              <Link href="/hookup-payments" className="text-gray-600 hover:text-gray-900">Hookup</Link>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50"><tr><th className={th}>Payer</th><th className={th}>For</th><th className={th}>Amount</th><th className={th}>Status</th><th className={th}>When</th></tr></thead>
              <tbody className="divide-y divide-gray-100">
                {d.recentPayments.length === 0 && <tr><td colSpan={5} className="px-4 py-8 text-center text-sm text-gray-500">No payments yet.</td></tr>}
                {d.recentPayments.map((p) => (
                  <tr key={p.id}>
                    <td className={td}>
                      <p className="font-medium text-gray-900">{p.payer.name}</p>
                      {p.payer.role && <p className="text-xs text-gray-500">{ROLE_LABEL[p.payer.role] ?? p.payer.role}</p>}
                    </td>
                    <td className={td}>{TYPE_LABEL[p.type] ?? p.type}</td>
                    <td className={`${td} font-semibold text-gray-900`}>{money(p.amount)}</td>
                    <td className={td}><StatusBadge status={p.status} /></td>
                    <td className={`${td} whitespace-nowrap`}>{dateTime(p.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
