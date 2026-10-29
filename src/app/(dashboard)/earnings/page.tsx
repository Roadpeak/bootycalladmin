'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, Landmark, Users, Building2, Info } from 'lucide-react';
import { handleApiError } from '@/lib/api';
import { getEarnings, type EarningsRange, type EarningsReport, type Tier } from '@/lib/api/insights';
import { PageHeader, StatCard, Tabs, ErrorBanner, money, th, td, TIER_LABEL } from '@/components/admin/ui';

const BAR = '#e11d48';
const SOURCE_LABEL: Record<string, string> = {
  ESCORT_SUBSCRIPTION: 'Escort plans',
  DATING_SUBSCRIPTION: 'Dating subscriptions',
  UNLOCK_ESCORT: 'Contact unlocks',
  VIP_SUBSCRIPTION: 'Flat-rate VIP (legacy)',
};
const SCOPE_LABEL: Record<string, string> = {
  ESCORT_SUBSCRIPTION: 'Escort plans',
  DATING_SUBSCRIPTION: 'Dating subscription',
  UNLOCK_ESCORT: 'Contact unlock',
};
const RANGE_LABEL: Record<EarningsRange, string> = { today: 'today', '7d': 'in the last 7 days', '30d': 'in the last 30 days', '90d': 'in the last 90 days', all: 'all time' };

const pct = (part: number, whole: number) => (whole > 0 ? `${Math.round((part / whole) * 100)}%` : '—');
const monthLabel = (m: string) => new Date(`${m}-01T00:00:00Z`).toLocaleDateString(undefined, { month: 'short', year: '2-digit', timeZone: 'UTC' });

function MonthTooltip({ active, payload }: { active?: boolean; payload?: { payload: { month: string; revenue: number; platform: number } }[] }) {
  if (!active || !payload?.length) return null;
  const p = payload[0].payload;
  return (
    <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs shadow-sm">
      <p className="font-medium text-gray-900">{monthLabel(p.month)}</p>
      <p className="text-gray-700">Revenue {money(p.revenue)}</p>
      <p className="text-gray-500">Platform kept {money(p.platform)}</p>
    </div>
  );
}

/**
 * Where the money came from and where it went, read from the ledger of
 * shares actually credited on each payment.
 */
export default function EarningsPage() {
  const [range, setRange] = useState<EarningsRange>('30d');
  const [report, setReport] = useState<EarningsReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getEarnings(range)
      .then((r) => { if (!cancelled) { setReport(r); setError(null); } })
      .catch((err) => !cancelled && setError(handleApiError(err)))
      .finally(() => !cancelled && setLoading(false));
    return () => { cancelled = true; };
  }, [range]);

  const s = report?.summary;
  const sources = report?.bySource ?? [];
  const totals = sources.reduce(
    (t, r) => ({
      count: t.count + r.count,
      revenue: t.revenue + r.revenue,
      platform: t.platform + r.shares.platform,
      serviceFee: t.serviceFee + r.shares.serviceFee,
      referrals: t.referrals + r.shares.referralL1 + r.shares.referralL2,
      escort: t.escort + r.shares.escort,
    }),
    { count: 0, revenue: 0, platform: 0, serviceFee: 0, referrals: 0, escort: 0 },
  );
  const tiers = (report?.escortPlansByTier ?? []).filter((t) => t.tier !== 'UNKNOWN' || t.count > 0);
  const maxTier = Math.max(1, ...tiers.map((t) => t.revenue));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Platform Earnings"
        description="Revenue by source and how each shilling was split between the platform, the service fee, referrers and escorts."
        actions={
          <Tabs<EarningsRange>
            value={range}
            onChange={setRange}
            options={[
              { value: 'today', label: 'Today' },
              { value: '7d', label: '7 days' },
              { value: '30d', label: '30 days' },
              { value: '90d', label: '90 days' },
              { value: 'all', label: 'All time' },
            ]}
          />
        }
      />
      <ErrorBanner message={error} />

      <div className={`grid grid-cols-2 gap-4 lg:grid-cols-4 ${loading ? 'opacity-60' : ''}`}>
        <StatCard label="Gross revenue" value={money(s?.grossRevenue)} hint={`${s?.paymentCount ?? 0} payments ${RANGE_LABEL[range]}`} icon={<TrendingUp className="h-5 w-5" />} />
        <StatCard label="Platform earnings" value={money(s?.netPlatformEarnings)} hint={`${pct(s?.netPlatformEarnings ?? 0, s?.grossRevenue ?? 0)} of revenue kept`} icon={<Landmark className="h-5 w-5" />} />
        <StatCard label="Shared with members" value={money(s?.totalPayouts)} hint={`Referrals ${money(report?.earnings.referrals)} · Escorts ${money(report?.earnings.escorts)}`} icon={<Users className="h-5 w-5" />} />
        <StatCard label="Service fee" value={money(s?.serviceFeeOwed)} hint="Owed to the development company" icon={<Building2 className="h-5 w-5" />} href="/withdrawals" />
      </div>

      {(s?.unledgeredRevenue ?? 0) > 0 && (
        <div className="flex gap-2 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <Info className="mt-0.5 h-4 w-4 flex-shrink-0" />
          <p>{money(s?.unledgeredRevenue)} of revenue was paid before splits were recorded, so it has no breakdown below. It is included in gross revenue.</p>
        </div>
      )}

      <section className="rounded-xl border border-gray-200 bg-white">
        <div className="px-5 py-4">
          <h2 className="text-base font-semibold text-gray-900">Revenue by source</h2>
          <p className="text-xs text-gray-500">Split as actually credited on each payment</p>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className={th}>Source</th>
                <th className={`${th} text-right`}>Payments</th>
                <th className={`${th} text-right`}>Revenue</th>
                <th className={`${th} text-right`}>Platform</th>
                <th className={`${th} text-right`}>Service fee</th>
                <th className={`${th} text-right`}>Referrers</th>
                <th className={`${th} text-right`}>Escorts</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading && !report && (
                <tr><td colSpan={7} className="px-4 py-3"><div className="h-6 animate-pulse rounded bg-gray-100" /></td></tr>
              )}
              {sources.map((r) => (
                <tr key={r.type}>
                  <td className={td}>
                    <p className="font-medium text-gray-900">{SOURCE_LABEL[r.type] ?? r.type}</p>
                    {r.unledgered > 0 && <p className="text-xs text-amber-700">{money(r.unledgered)} without a recorded split</p>}
                  </td>
                  <td className={`${td} text-right`}>{r.count}</td>
                  <td className={`${td} text-right font-semibold text-gray-900`}>{money(r.revenue)}</td>
                  <td className={`${td} text-right`}>{money(r.shares.platform)}</td>
                  <td className={`${td} text-right`}>{money(r.shares.serviceFee)}</td>
                  <td className={`${td} text-right`}>
                    {money(r.shares.referralL1 + r.shares.referralL2)}
                    {(r.shares.referralL1 > 0 || r.shares.referralL2 > 0) && (
                      <p className="text-xs text-gray-500">L1 {money(r.shares.referralL1)} · L2 {money(r.shares.referralL2)}</p>
                    )}
                  </td>
                  <td className={`${td} text-right`}>{money(r.shares.escort)}</td>
                </tr>
              ))}
              {sources.length > 0 && (
                <tr className="bg-gray-50 font-semibold">
                  <td className={td}>Total</td>
                  <td className={`${td} text-right`}>{totals.count}</td>
                  <td className={`${td} text-right text-gray-900`}>{money(totals.revenue)}</td>
                  <td className={`${td} text-right`}>{money(totals.platform)}</td>
                  <td className={`${td} text-right`}>{money(totals.serviceFee)}</td>
                  <td className={`${td} text-right`}>{money(totals.referrals)}</td>
                  <td className={`${td} text-right`}>{money(totals.escort)}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="rounded-xl border border-gray-200 bg-white p-5 lg:col-span-2">
          <h2 className="text-base font-semibold text-gray-900">Last 6 months</h2>
          <p className="text-xs text-gray-500">Revenue per month · hover for what the platform kept</p>
          <div className="mt-4 h-60">
            {report && report.months.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={report.months} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                  <CartesianGrid vertical={false} stroke="#f1f1f1" />
                  <XAxis dataKey="month" tickFormatter={monthLabel} tickLine={false} axisLine={{ stroke: '#e5e7eb' }} tick={{ fontSize: 11, fill: '#6b7280' }} />
                  <YAxis tickLine={false} axisLine={false} width={56} tick={{ fontSize: 11, fill: '#6b7280' }} tickFormatter={(v) => (v >= 1000 ? `${Math.round(v / 1000)}k` : `${v}`)} />
                  <Tooltip content={<MonthTooltip />} cursor={{ fill: '#f9fafb' }} />
                  <Bar dataKey="revenue" fill={BAR} radius={[4, 4, 0, 0]} maxBarSize={48} />
                </BarChart>
              </ResponsiveContainer>
            ) : <p className="pt-10 text-center text-sm text-gray-500">No payments in the last 6 months.</p>}
          </div>
        </section>

        <section className="rounded-xl border border-gray-200 bg-white p-5">
          <h2 className="text-base font-semibold text-gray-900">Escort plan revenue</h2>
          <p className="text-xs text-gray-500">By tier, {RANGE_LABEL[range]}</p>
          <ul className="mt-4 space-y-3">
            {tiers.length === 0 && <li className="text-sm text-gray-500">No plan purchases yet.</li>}
            {tiers.map((t) => (
              <li key={t.tier}>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="text-gray-700">{t.tier === 'UNKNOWN' ? 'Other' : TIER_LABEL[t.tier as Tier]} <span className="text-xs text-gray-400">· {t.count}</span></span>
                  <span className="font-medium text-gray-900">{money(t.revenue)}</span>
                </div>
                <div className="h-2 rounded-full bg-gray-100">
                  <div className="h-2 rounded-full" style={{ width: `${(t.revenue / maxTier) * 100}%`, background: BAR }} />
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-gray-200 bg-white p-5">
          <h2 className="text-base font-semibold text-gray-900">Payouts {RANGE_LABEL[range]}</h2>
          <dl className="mt-4 grid grid-cols-2 gap-4 text-sm">
            <div><dt className="text-gray-500">Withdrawals paid</dt><dd className="font-semibold text-gray-900">{money(report?.payouts.withdrawalsPaid)}</dd><dd className="text-xs text-gray-500">{report?.payouts.withdrawalsPaidCount ?? 0} withdrawals</dd></div>
            <div><dt className="text-gray-500">Withdrawals pending</dt><dd className="font-semibold text-gray-900">{money(report?.payouts.withdrawalsPending)}</dd><dd className="text-xs text-gray-500">{report?.payouts.withdrawalsPendingCount ?? 0} waiting</dd></div>
            <div><dt className="text-gray-500">Credited to referrers</dt><dd className="font-semibold text-gray-900">{money(report?.payouts.referralCredits)}</dd></div>
            <div><dt className="text-gray-500">Credited to escorts</dt><dd className="font-semibold text-gray-900">{money(report?.payouts.escortCredits)}</dd></div>
          </dl>
          <Link href="/withdrawals" className="mt-4 inline-block text-sm font-medium text-gray-700 hover:text-gray-900">Open withdrawals →</Link>
        </section>

        <section className="rounded-xl border border-gray-200 bg-white p-5">
          <h2 className="text-base font-semibold text-gray-900">Current split settings</h2>
          <p className="text-xs text-gray-500">Applied to new payments. Past payments keep the split they were credited with.</p>
          <div className="mt-3 overflow-x-auto">
            <table className="min-w-full">
              <thead><tr><th className={th}>Payment</th><th className={`${th} text-right`}>Platform</th><th className={`${th} text-right`}>Fee</th><th className={`${th} text-right`}>L1</th><th className={`${th} text-right`}>L2</th><th className={`${th} text-right`}>Escort</th></tr></thead>
              <tbody className="divide-y divide-gray-100">
                {(report?.splits ?? []).map((sp) => (
                  <tr key={sp.scope}>
                    <td className={td}>{SCOPE_LABEL[sp.scope] ?? sp.scope}</td>
                    <td className={`${td} text-right`}>{sp.platformPercent}%</td>
                    <td className={`${td} text-right`}>{sp.serviceFeePercent}%</td>
                    <td className={`${td} text-right`}>{sp.level1Percent}%</td>
                    <td className={`${td} text-right`}>{sp.level2Percent}%</td>
                    <td className={`${td} text-right`}>{sp.escortPercent}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Link href="/platform-settings" className="mt-4 inline-block text-sm font-medium text-gray-700 hover:text-gray-900">Change splits →</Link>
        </section>
      </div>
    </div>
  );
}
