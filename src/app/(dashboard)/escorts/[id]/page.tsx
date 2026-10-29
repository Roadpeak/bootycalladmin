'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, MapPin, Phone, Mail, Eye, Star, Unlock } from 'lucide-react';
import { adminService, handleApiError } from '@/lib/api';
import { getEscortDetail, type EscortDetail } from '@/lib/api/insights';
import {
  StatusBadge, TierBadge, Avatar, ErrorBanner, imageSrc, money, date, dateTime, personName, th, td, TIER_LABEL,
} from '@/components/admin/ui';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-gray-200 bg-white p-5">
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">{title}</h2>
      {children}
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-sm font-medium text-gray-900">{children}</p>
    </div>
  );
}

const PAY_LABEL: Record<string, string> = { ESCORT_SUBSCRIPTION: 'Plan purchase', VIP_SUBSCRIPTION: 'Flat-rate VIP (legacy)' };

export default function EscortDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [escort, setEscort] = useState<EscortDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [reload, setReload] = useState(0);
  const [photo, setPhoto] = useState(0);

  useEffect(() => {
    getEscortDetail(id)
      .then((e) => { setEscort(e); setError(null); })
      .catch((err) => setError(handleApiError(err)));
  }, [id, reload]);

  async function update(change: { verified?: boolean; moderationStatus?: 'APPROVED' | 'REJECTED' | 'SUSPENDED' }) {
    if (!escort) return;
    try {
      setBusy(true);
      await adminService.verifyEscort(escort.id, { verified: change.verified ?? escort.verified, ...(change.moderationStatus ? { moderationStatus: change.moderationStatus } : {}) });
      setReload((n) => n + 1);
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setBusy(false);
    }
  }

  if (!escort) {
    return (
      <div className="space-y-4">
        <Link href="/escorts" className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900"><ArrowLeft className="h-4 w-4" /> Escorts</Link>
        {error ? <ErrorBanner message={error} /> : <div className="h-64 animate-pulse rounded-xl bg-gray-100" />}
      </div>
    );
  }

  const name = escort.displayName || personName(escort.user);
  const services = (escort.services ?? []).map((s) => (typeof s === 'string' ? s : s.name));

  return (
    <div className="space-y-6">
      <Link href="/escorts" className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900"><ArrowLeft className="h-4 w-4" /> Escorts</Link>
      <ErrorBanner message={error} />

      <div className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-5 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <Avatar src={escort.photos?.[0]} name={name} />
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-bold text-gray-900">{name}</h1>
              <TierBadge tier={escort.currentPlan?.tier} />
              <StatusBadge status={escort.moderationStatus} label={escort.moderationStatus === 'PENDING' ? 'Awaiting review' : undefined} />
              {escort.verified && <StatusBadge status="COMPLETED" label="Verified" />}
            </div>
            <p className="mt-1 text-sm text-gray-500">
              {[escort.age ? `${escort.age} yrs` : null, escort.user.gender, [escort.area, escort.city].filter(Boolean).join(', ') || 'Location not set'].filter(Boolean).join(' · ')}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {escort.moderationStatus !== 'APPROVED' && (
            <button type="button" disabled={busy} onClick={() => update({ moderationStatus: 'APPROVED' })} className="rounded-lg bg-green-600 px-3 py-2 text-sm font-medium text-white disabled:opacity-40">Approve profile</button>
          )}
          {escort.moderationStatus === 'APPROVED' && (
            <button type="button" disabled={busy} onClick={() => update({ moderationStatus: 'SUSPENDED' })} className="rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-700 disabled:opacity-40">Suspend</button>
          )}
          {escort.moderationStatus === 'PENDING' && (
            <button type="button" disabled={busy} onClick={() => update({ moderationStatus: 'REJECTED' })} className="rounded-lg border border-red-200 px-3 py-2 text-sm font-medium text-red-700 disabled:opacity-40">Reject</button>
          )}
          <button type="button" disabled={busy} onClick={() => update({ verified: !escort.verified })} className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 disabled:opacity-40">
            {escort.verified ? 'Remove verification' : 'Mark verified'}
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Section title={`Photos (${escort.photos?.length ?? 0})`}>
            {escort.photos?.length ? (
              <div className="space-y-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imageSrc(escort.photos[photo])} alt={`${name} photo ${photo + 1}`} className="max-h-[28rem] w-full rounded-lg bg-gray-50 object-contain" />
                <div className="flex flex-wrap gap-2">
                  {escort.photos.map((src, i) => (
                    <button key={i} type="button" onClick={() => setPhoto(i)} className={`h-16 w-16 overflow-hidden rounded-lg ring-2 ${i === photo ? 'ring-amber-500' : 'ring-transparent'}`}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={imageSrc(src)} alt="" className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            ) : <p className="text-sm text-gray-500">No photos uploaded.</p>}
          </Section>

          <Section title="Plan">
            {escort.currentPlan ? (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <Field label="Current"><TierBadge tier={escort.currentPlan.tier} /></Field>
                <Field label="Started">{date(escort.currentPlan.startsAt)}</Field>
                <Field label="Ends">{date(escort.currentPlan.expiresAt)}</Field>
                <Field label="Paid">{escort.currentPlan.amountPaid ? money(escort.currentPlan.amountPaid) : 'Resumed after upgrade'}</Field>
              </div>
            ) : <p className="text-sm text-gray-600">No plan running. {escort.paidUntil ? '' : 'Contact details need an unlock to view.'}</p>}
            {escort.queuedPlans.length > 0 && (
              <p className="mt-3 text-sm text-gray-600">
                Queued: {escort.queuedPlans.map((q) => `${TIER_LABEL[q.tier]} ${date(q.startsAt)} – ${date(q.expiresAt)}`).join(' · ')}. Paid until {date(escort.paidUntil)}.
              </p>
            )}
            {escort.planHistory.length > 0 && (
              <div className="mt-4 overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-50"><tr><th className={th}>Tier</th><th className={th}>From</th><th className={th}>To</th><th className={th}>Paid</th><th className={th}>Status</th></tr></thead>
                  <tbody className="divide-y divide-gray-100">
                    {escort.planHistory.map((h) => (
                      <tr key={h.id}>
                        <td className={td}><TierBadge tier={h.tier} /></td>
                        <td className={td}>{date(h.startsAt)}</td>
                        <td className={td}>{date(h.expiresAt)}</td>
                        <td className={td}>{h.amountPaid ? money(h.amountPaid) : '—'}</td>
                        <td className={td}><StatusBadge status={h.status === 'ACTIVE' && new Date(h.expiresAt) < new Date() ? 'EXPIRED' : h.status} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Section>

          <Section title="Plan payments">
            {escort.planPayments.length ? (
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-gray-50"><tr><th className={th}>Type</th><th className={th}>Amount</th><th className={th}>Status</th><th className={th}>M-Pesa code</th><th className={th}>Date</th></tr></thead>
                  <tbody className="divide-y divide-gray-100">
                    {escort.planPayments.map((p) => (
                      <tr key={p.id}>
                        <td className={td}>{PAY_LABEL[p.type] ?? p.type}</td>
                        <td className={td}>{money(p.amount)}</td>
                        <td className={td}><StatusBadge status={p.status} /></td>
                        <td className={`${td} font-mono text-xs`}>{p.mpesaTxnId ?? '—'}</td>
                        <td className={td}>{dateTime(p.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : <p className="text-sm text-gray-500">No plan payments yet.</p>}
          </Section>

          <Section title="About">
            <p className="whitespace-pre-line text-sm text-gray-700">{escort.about || 'No description.'}</p>
            {services.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {services.map((s) => <span key={s} className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs text-gray-700">{s}</span>)}
              </div>
            )}
          </Section>
        </div>

        <div className="space-y-6">
          <Section title="Location">
            <div className="flex items-start gap-2 text-sm">
              <MapPin className="mt-0.5 h-4 w-4 text-gray-400" />
              <div>
                <p className="font-medium text-gray-900">{escort.city ?? 'County not set'}</p>
                <p className="text-gray-600">{escort.area ?? 'Area not set'}</p>
                {escort.country && <p className="text-gray-500">{escort.country}</p>}
              </div>
            </div>
          </Section>

          <Section title="Contact & account">
            <div className="space-y-2 text-sm">
              <p className="flex items-center gap-2"><Phone className="h-4 w-4 text-gray-400" /> {escort.contactPhone} <span className="text-xs text-gray-500">(public)</span></p>
              <p className="flex items-center gap-2"><Phone className="h-4 w-4 text-gray-400" /> {escort.user.phone} <span className="text-xs text-gray-500">(account)</span></p>
              <p className="flex items-center gap-2"><Mail className="h-4 w-4 text-gray-400" /> {escort.user.email}</p>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <Field label="Joined">{date(escort.user.createdAt)}</Field>
              <Field label="Last seen">{date(escort.user.lastLogin)}</Field>
              <Field label="Wallet">{money(escort.user.walletBalance)}</Field>
              <Field label="Referral code">{escort.user.referralCode}</Field>
              <Field label="Account">{escort.user.isActive ? 'Active' : 'Deactivated'}</Field>
            </div>
          </Section>

          <Section title="Performance">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Profile views"><span className="inline-flex items-center gap-1"><Eye className="h-3.5 w-3.5 text-gray-400" />{escort.totalViews ?? 0}</span></Field>
              <Field label="Rating"><span className="inline-flex items-center gap-1"><Star className="h-3.5 w-3.5 text-gray-400" />{Number(escort.averageRating ?? 0).toFixed(1)} ({escort.reviewCount ?? 0})</span></Field>
              <Field label="Contact unlocks"><span className="inline-flex items-center gap-1"><Unlock className="h-3.5 w-3.5 text-gray-400" />{escort.unlocks.count}</span></Field>
              <Field label="Unlock revenue">{money(escort.unlocks.revenue)}</Field>
            </div>
          </Section>

          {(escort.pricing?.hourlyRate || escort.availability || escort.languages?.length) && (
            <Section title="Rates & availability">
              <div className="space-y-2 text-sm text-gray-700">
                {escort.pricing?.hourlyRate ? <p>{money(escort.pricing.hourlyRate)} per hour</p> : null}
                {escort.availability?.days?.length ? <p>{escort.availability.days.join(', ')}</p> : null}
                {escort.availability?.hours ? <p>{escort.availability.hours}</p> : null}
                {escort.languages?.length ? <p>Speaks {escort.languages.join(', ')}</p> : null}
              </div>
            </Section>
          )}
        </div>
      </div>
    </div>
  );
}
