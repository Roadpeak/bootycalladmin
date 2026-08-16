'use client';

import { useState, useEffect, useMemo } from 'react';
import { AlertCircle, Check, Loader2, Save } from 'lucide-react';
import { adminService, handleApiError } from '@/lib/api';
import type {
  PlatformSetting,
  RevenueSplit,
  RevenueScope,
  SubscriptionPlan,
  EscortTier,
} from '@/types/api';

/** Highest tier first, matching the order escorts are listed in. */
const TIER_ORDER: EscortTier[] = ['VVIP', 'VIP', 'PRIME', 'REGULAR'];

const TIER_STYLES: Record<EscortTier, string> = {
  VVIP: 'bg-purple-100 text-purple-800',
  VIP: 'bg-blue-100 text-blue-800',
  PRIME: 'bg-emerald-100 text-emerald-800',
  REGULAR: 'bg-orange-100 text-orange-800',
};

const SCOPE_LABELS: Record<RevenueScope, { title: string; description: string }> = {
  ESCORT_SUBSCRIPTION: {
    title: 'Escort subscriptions',
    description: 'Applies to every escort plan purchase and renewal.',
  },
  DATING_SUBSCRIPTION: {
    title: 'Dating subscriptions',
    description: 'Applies to dating user subscription payments.',
  },
  UNLOCK_ESCORT: {
    title: 'Escort unlocks',
    description: "Applies when a client pays to see an escort's contact details.",
  },
};

const SPLIT_FIELDS = [
  { key: 'platformPercent', label: 'Platform', hint: 'Kept by LoveBite' },
  { key: 'serviceFeePercent', label: 'Service fee', hint: "Dev company's paybill" },
  { key: 'level1Percent', label: 'Direct referrer', hint: 'Who invited the payer' },
  { key: 'level2Percent', label: 'Upline referrer', hint: 'Who invited the referrer' },
  { key: 'escortPercent', label: 'Escort', hint: 'Unlocks only' },
] as const;

type SplitFieldKey = (typeof SPLIT_FIELDS)[number]['key'];
type SplitDraft = Record<SplitFieldKey, string>;

const toDraft = (split: RevenueSplit): SplitDraft => ({
  platformPercent: String(Number(split.platformPercent)),
  serviceFeePercent: String(Number(split.serviceFeePercent)),
  level1Percent: String(Number(split.level1Percent)),
  level2Percent: String(Number(split.level2Percent)),
  escortPercent: String(Number(split.escortPercent)),
});

export default function PlatformSettingsPage() {
  const [settings, setSettings] = useState<PlatformSetting[]>([]);
  const [splits, setSplits] = useState<RevenueSplit[]>([]);
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    fetchAll();
  }, []);

  async function fetchAll() {
    try {
      setLoading(true);
      setError(null);

      const [settingsRes, splitsRes, plansRes] = await Promise.all([
        adminService.getSettings(),
        adminService.getRevenueSplits(),
        adminService.getSubscriptionPlans(),
      ]);

      if (settingsRes.data) setSettings(settingsRes.data);
      if (splitsRes.data) setSplits(splitsRes.data);
      if (plansRes.data) setPlans(plansRes.data);
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  }

  function flashNotice(message: string) {
    setNotice(message);
    setTimeout(() => setNotice(null), 3000);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Platform Settings</h1>
        <p className="mt-1 text-sm text-gray-600">
          Pricing, revenue splits and platform behaviour. Changes take effect on the
          next payment — no deploy needed.
        </p>
      </div>

      {error && (
        <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-4">
          <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-500" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {notice && (
        <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-4">
          <Check className="h-5 w-5 text-green-600" />
          <p className="text-sm text-green-800">{notice}</p>
        </div>
      )}

      <RevenueSplitsSection
        splits={splits}
        onSaved={(saved) => {
          setSplits((prev) => prev.map((s) => (s.scope === saved.scope ? saved : s)));
          flashNotice(`${SCOPE_LABELS[saved.scope]?.title ?? saved.scope} split saved.`);
        }}
      />

      <PlansSection
        plans={plans}
        onSaved={(saved) => {
          setPlans((prev) => prev.map((p) => (p.id === saved.id ? saved : p)));
          flashNotice('Plan updated.');
        }}
      />

      <SettingsSection
        settings={settings}
        onSaved={(saved) => {
          setSettings((prev) => prev.map((s) => (s.key === saved.key ? saved : s)));
          flashNotice(`${saved.key} updated.`);
        }}
      />
    </div>
  );
}

function RevenueSplitsSection({
  splits,
  onSaved,
}: {
  splits: RevenueSplit[];
  onSaved: (split: RevenueSplit) => void;
}) {
  return (
    <section className="rounded-lg bg-white shadow">
      <header className="border-b border-gray-200 px-6 py-4">
        <h2 className="font-semibold text-gray-900">Revenue splits</h2>
        <p className="mt-1 text-sm text-gray-600">
          How each payment is divided. Every split must total exactly 100% — the
          server rejects anything else, so no money is left unallocated.
        </p>
      </header>

      <div className="divide-y divide-gray-200">
        {splits.map((split) => (
          <SplitEditor key={split.id} split={split} onSaved={onSaved} />
        ))}
      </div>
    </section>
  );
}

function SplitEditor({
  split,
  onSaved,
}: {
  split: RevenueSplit;
  onSaved: (split: RevenueSplit) => void;
}) {
  const [draft, setDraft] = useState<SplitDraft>(() => toDraft(split));
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Sum shown live so the total is obvious before an attempted save.
  const total = useMemo(
    () =>
      SPLIT_FIELDS.reduce((sum, field) => {
        const value = Number(draft[field.key]);
        return sum + (Number.isFinite(value) ? value : 0);
      }, 0),
    [draft]
  );

  const rounded = Number(total.toFixed(3));
  const balances = rounded === 100;
  const isDirty = useMemo(
    () =>
      SPLIT_FIELDS.some(
        (field) => Number(draft[field.key]) !== Number(split[field.key])
      ),
    [draft, split]
  );

  const meta = SCOPE_LABELS[split.scope] ?? {
    title: split.scope,
    description: '',
  };

  async function handleSave() {
    try {
      setSaving(true);
      setSaveError(null);

      const saved = await adminService.updateRevenueSplit(split.scope, {
        platformPercent: Number(draft.platformPercent),
        serviceFeePercent: Number(draft.serviceFeePercent),
        level1Percent: Number(draft.level1Percent),
        level2Percent: Number(draft.level2Percent),
        escortPercent: Number(draft.escortPercent),
      });

      onSaved(saved);
    } catch (err) {
      setSaveError(handleApiError(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="px-6 py-5">
      <div className="mb-4">
        <h3 className="font-medium text-gray-900">{meta.title}</h3>
        <p className="text-sm text-gray-500">{meta.description}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {SPLIT_FIELDS.map((field) => (
          <div key={field.key}>
            <label
              htmlFor={`${split.scope}-${field.key}`}
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              {field.label}
            </label>
            <div className="relative">
              <input
                id={`${split.scope}-${field.key}`}
                type="number"
                step="0.001"
                min="0"
                max="100"
                value={draft[field.key]}
                onChange={(e) =>
                  setDraft((prev) => ({ ...prev, [field.key]: e.target.value }))
                }
                className="w-full rounded-lg border border-gray-300 py-2 pl-3 pr-7 focus:border-indigo-500 focus:ring-indigo-500"
              />
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">
                %
              </span>
            </div>
            <p className="mt-1 text-xs text-gray-500">{field.hint}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <p
          className={`text-sm font-medium ${
            balances ? 'text-green-700' : 'text-red-700'
          }`}
        >
          Total: {rounded}%
          {!balances && (
            <span className="ml-2 font-normal">
              {rounded < 100
                ? `— ${Number((100 - rounded).toFixed(3))}% unallocated`
                : `— ${Number((rounded - 100).toFixed(3))}% over`}
            </span>
          )}
        </p>

        <button
          onClick={handleSave}
          disabled={!balances || !isDirty || saving}
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-gray-300"
        >
          {saving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          Save split
        </button>
      </div>

      {saveError && (
        <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
          {saveError}
        </p>
      )}
    </div>
  );
}

function PlansSection({
  plans,
  onSaved,
}: {
  plans: SubscriptionPlan[];
  onSaved: (plan: SubscriptionPlan) => void;
}) {
  const grouped = useMemo(() => {
    const map = new Map<EscortTier, SubscriptionPlan[]>();
    for (const tier of TIER_ORDER) {
      const forTier = plans
        .filter((plan) => plan.tier === tier)
        .sort((a, b) => a.durationDays - b.durationDays);
      if (forTier.length) map.set(tier, forTier);
    }
    return map;
  }, [plans]);

  return (
    <section className="rounded-lg bg-white shadow">
      <header className="border-b border-gray-200 px-6 py-4">
        <h2 className="font-semibold text-gray-900">Subscription plans</h2>
        <p className="mt-1 text-sm text-gray-600">
          Prices escorts pay per tier and duration. A new price applies to the next
          purchase; it does not change plans already bought.
        </p>
      </header>

      <div className="divide-y divide-gray-200">
        {[...grouped.entries()].map(([tier, tierPlans]) => (
          <div key={tier} className="px-6 py-5">
            <span
              className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${TIER_STYLES[tier]}`}
            >
              {tier}
            </span>

            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {tierPlans.map((plan) => (
                <PlanEditor key={plan.id} plan={plan} onSaved={onSaved} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function PlanEditor({
  plan,
  onSaved,
}: {
  plan: SubscriptionPlan;
  onSaved: (plan: SubscriptionPlan) => void;
}) {
  const [price, setPrice] = useState(String(Number(plan.price)));
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const parsed = Number(price);
  const isValid = Number.isFinite(parsed) && parsed > 0;
  const isDirty = parsed !== Number(plan.price);

  async function handleSave() {
    try {
      setSaving(true);
      setSaveError(null);
      onSaved(await adminService.updateSubscriptionPlan(plan.id, { price: parsed }));
    } catch (err) {
      setSaveError(handleApiError(err));
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive() {
    try {
      setSaving(true);
      setSaveError(null);
      onSaved(
        await adminService.updateSubscriptionPlan(plan.id, { isActive: !plan.isActive })
      );
    } catch (err) {
      setSaveError(handleApiError(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-lg border border-gray-200 p-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-700">
          {plan.durationDays} day{plan.durationDays === 1 ? '' : 's'}
        </p>
        <button
          onClick={toggleActive}
          disabled={saving}
          className={`text-xs font-medium ${
            plan.isActive
              ? 'text-gray-500 hover:text-gray-700'
              : 'text-red-600 hover:text-red-700'
          }`}
        >
          {plan.isActive ? 'Active' : 'Hidden'}
        </button>
      </div>

      <div className="mt-2 flex items-center gap-2">
        <span className="text-sm text-gray-500">KSh</span>
        <input
          type="number"
          min="1"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          aria-label={`${plan.tier} ${plan.durationDays} day price`}
          className="w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
      </div>

      <button
        onClick={handleSave}
        disabled={!isValid || !isDirty || saving}
        className="mt-3 w-full rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400"
      >
        {saving ? 'Saving…' : 'Save price'}
      </button>

      {saveError && <p className="mt-2 text-xs text-red-600">{saveError}</p>}
    </div>
  );
}

function SettingsSection({
  settings,
  onSaved,
}: {
  settings: PlatformSetting[];
  onSaved: (setting: PlatformSetting) => void;
}) {
  const byCategory = useMemo(() => {
    const map = new Map<string, PlatformSetting[]>();
    for (const setting of settings) {
      const list = map.get(setting.category) ?? [];
      list.push(setting);
      map.set(setting.category, list);
    }
    return map;
  }, [settings]);

  return (
    <section className="rounded-lg bg-white shadow">
      <header className="border-b border-gray-200 px-6 py-4">
        <h2 className="font-semibold text-gray-900">Platform behaviour</h2>
        <p className="mt-1 text-sm text-gray-600">
          Withdrawal limits, dating pricing, and feature toggles.
        </p>
      </header>

      <div className="divide-y divide-gray-200">
        {[...byCategory.entries()].map(([category, items]) => (
          <div key={category} className="px-6 py-5">
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
              {category.replace(/_/g, ' ')}
            </h3>
            <div className="space-y-4">
              {items.map((setting) => (
                <SettingEditor key={setting.id} setting={setting} onSaved={onSaved} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function SettingEditor({
  setting,
  onSaved,
}: {
  setting: PlatformSetting;
  onSaved: (setting: PlatformSetting) => void;
}) {
  const [value, setValue] = useState(setting.value);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const isDirty = value !== setting.value;

  async function save(nextValue: string) {
    try {
      setSaving(true);
      setSaveError(null);
      onSaved(await adminService.updateSetting(setting.key, nextValue));
    } catch (err) {
      setSaveError(handleApiError(err));
      setValue(setting.value); // Put the control back to the stored value.
    } finally {
      setSaving(false);
    }
  }

  // A toggle saves on click; free-text needs an explicit Save.
  if (setting.valueType === 'BOOLEAN') {
    const enabled = value === 'true';
    return (
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-gray-900">
            {setting.key.replace(/_/g, ' ').toLowerCase()}
          </p>
          {setting.description && (
            <p className="mt-0.5 text-xs text-gray-500">{setting.description}</p>
          )}
          {saveError && <p className="mt-1 text-xs text-red-600">{saveError}</p>}
        </div>

        <button
          role="switch"
          aria-checked={enabled}
          aria-label={setting.key}
          disabled={saving}
          onClick={() => {
            const next = enabled ? 'false' : 'true';
            setValue(next);
            save(next);
          }}
          className={`relative h-6 w-11 flex-shrink-0 rounded-full transition-colors disabled:opacity-50 ${
            enabled ? 'bg-indigo-600' : 'bg-gray-300'
          }`}
        >
          <span
            className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
              enabled ? 'translate-x-5' : 'translate-x-0.5'
            }`}
          />
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="min-w-0 flex-1">
        <label
          htmlFor={setting.key}
          className="block text-sm font-medium text-gray-900"
        >
          {setting.key.replace(/_/g, ' ').toLowerCase()}
        </label>
        {setting.description && (
          <p className="mb-1 mt-0.5 text-xs text-gray-500">{setting.description}</p>
        )}
        <input
          id={setting.key}
          type={setting.valueType === 'NUMBER' ? 'number' : 'text'}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500"
        />
        {saveError && <p className="mt-1 text-xs text-red-600">{saveError}</p>}
      </div>

      <button
        onClick={() => save(value)}
        disabled={!isDirty || saving}
        className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400"
      >
        {saving ? 'Saving…' : 'Save'}
      </button>
    </div>
  );
}
