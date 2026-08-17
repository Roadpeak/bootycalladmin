'use client';

import { useState, useEffect, useRef } from 'react';
import {
  AlertCircle, Check, Loader2, Plus, Trash2, Pencil, ExternalLink,
  MessageCircle, Phone, MousePointerClick, Eye, X, Upload,
} from 'lucide-react';
import { adminService, handleApiError } from '@/lib/api';
import type {
  Advertisement,
  AdActionType,
  AdInputRequest,
  AdAnalytics,
} from '@/types/api';

const ACTION_META: Record<
  AdActionType,
  { label: string; button: string; hint: string; placeholder: string }
> = {
  LINK: {
    label: 'Open a link',
    button: 'Click Now',
    hint: 'Where the button sends people.',
    placeholder: 'https://example.com/offer',
  },
  WHATSAPP: {
    label: 'Chat on WhatsApp',
    button: 'Chat on WhatsApp',
    hint: 'Kenyan number that receives the chat.',
    placeholder: '0712345678',
  },
  CALL: {
    label: 'Call a number',
    button: 'Call Now',
    hint: 'Kenyan number people will dial.',
    placeholder: '0712345678',
  },
};

const ACTION_ICON: Record<AdActionType, typeof ExternalLink> = {
  LINK: ExternalLink,
  WHATSAPP: MessageCircle,
  CALL: Phone,
};

const emptyForm: AdInputRequest = {
  name: '',
  detail: '',
  imageUrl: '',
  actionType: 'LINK',
  actionValue: '',
  actionLabel: '',
  isActive: true,
  sortOrder: 0,
};

export default function AdvertisementsPage() {
  const [ads, setAds] = useState<Advertisement[]>([]);
  const [analytics, setAnalytics] = useState<AdAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Advertisement | null>(null);
  const [deleting, setDeleting] = useState<Advertisement | null>(null);

  useEffect(() => {
    fetchAll();
  }, []);

  async function fetchAll() {
    try {
      setLoading(true);
      setError(null);

      const [adsRes, analyticsRes] = await Promise.all([
        adminService.getAds(),
        adminService.getAdAnalytics(30).catch(() => null),
      ]);

      if (adsRes.data) setAds(adsRes.data);
      if (analyticsRes?.data) setAnalytics(analyticsRes.data);
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  }

  function flash(message: string) {
    setNotice(message);
    setTimeout(() => setNotice(null), 3000);
  }

  async function handleDelete() {
    if (!deleting) return;
    try {
      await adminService.deleteAd(deleting.id);
      setDeleting(null);
      flash('Advertisement deleted.');
      fetchAll();
    } catch (err) {
      setError(handleApiError(err));
      setDeleting(null);
    }
  }

  async function toggleActive(ad: Advertisement) {
    try {
      await adminService.updateAd(ad.id, { isActive: !ad.isActive });
      fetchAll();
    } catch (err) {
      setError(handleApiError(err));
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Advertisements</h1>
          <p className="mt-1 text-sm text-gray-600">
            Sliding cards shown under the locations row on the escort browsing page.
          </p>
        </div>

        <button
          onClick={() => {
            setEditing(null);
            setShowModal(true);
          }}
          className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          <Plus className="h-4 w-4" />
          New advertisement
        </button>
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

      {analytics && <AnalyticsSummary analytics={analytics} />}

      {ads.length === 0 ? (
        <div className="rounded-lg bg-white p-12 text-center shadow">
          <p className="text-gray-600">No advertisements yet.</p>
          <p className="mt-1 text-sm text-gray-500">
            The carousel stays hidden on the browsing page until you add one.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg bg-white shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Advertisement
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Action
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Performance
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {ads.map((ad) => {
                const Icon = ACTION_ICON[ad.actionType];
                const ctr =
                  ad.impressions > 0
                    ? ((ad.clickCount / ad.impressions) * 100).toFixed(1)
                    : '0.0';

                return (
                  <tr key={ad.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={ad.imageUrl}
                          alt=""
                          className="h-12 w-16 flex-shrink-0 rounded object-cover"
                        />
                        <div className="min-w-0">
                          <p className="truncate font-medium text-gray-900">{ad.name}</p>
                          {ad.detail && (
                            <p className="truncate text-sm text-gray-500">{ad.detail}</p>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <Icon className="h-4 w-4 text-gray-400" />
                        <span className="max-w-[200px] truncate">{ad.actionValue}</span>
                      </div>
                    </td>

                    <td className="whitespace-nowrap px-6 py-4 text-sm">
                      <div className="flex items-center gap-3 text-gray-600">
                        <span className="inline-flex items-center gap-1">
                          <Eye className="h-3.5 w-3.5" />
                          {ad.impressions.toLocaleString()}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <MousePointerClick className="h-3.5 w-3.5" />
                          {ad.clickCount.toLocaleString()}
                        </span>
                      </div>
                      <p className="mt-0.5 text-xs text-gray-500">{ctr}% clicked</p>
                    </td>

                    <td className="whitespace-nowrap px-6 py-4">
                      <button
                        onClick={() => toggleActive(ad)}
                        className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                          ad.isActive
                            ? 'bg-green-100 text-green-800 hover:bg-green-200'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {ad.isActive ? 'Live' : 'Hidden'}
                      </button>
                    </td>

                    <td className="whitespace-nowrap px-6 py-4 text-right">
                      <button
                        onClick={() => {
                          setEditing(ad);
                          setShowModal(true);
                        }}
                        className="mr-3 text-indigo-600 hover:text-indigo-800"
                        aria-label={`Edit ${ad.name}`}
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setDeleting(ad)}
                        className="text-red-600 hover:text-red-800"
                        aria-label={`Delete ${ad.name}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <AdFormModal
          ad={editing}
          onClose={() => setShowModal(false)}
          onSaved={() => {
            setShowModal(false);
            flash(editing ? 'Advertisement updated.' : 'Advertisement created.');
            fetchAll();
          }}
        />
      )}

      {deleting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-lg bg-white p-6">
            <h2 className="text-lg font-semibold text-gray-900">
              Delete this advertisement?
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              &ldquo;{deleting.name}&rdquo; will be removed from the site, along with
              its click history. This cannot be undone.
            </p>
            <div className="mt-5 flex justify-end gap-3">
              <button
                onClick={() => setDeleting(null)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AnalyticsSummary({ analytics }: { analytics: AdAnalytics }) {
  const cards = [
    { label: 'Impressions', value: analytics.totals.impressions.toLocaleString() },
    { label: 'Clicks', value: analytics.totals.clicks.toLocaleString() },
    { label: 'Click-through rate', value: `${analytics.totals.clickThroughRate}%` },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {cards.map((card) => (
        <div key={card.label} className="rounded-lg bg-white p-5 shadow">
          <p className="text-sm text-gray-600">{card.label}</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{card.value}</p>
        </div>
      ))}
    </div>
  );
}

function AdFormModal({
  ad,
  onClose,
  onSaved,
}: {
  ad: Advertisement | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState<AdInputRequest>(() =>
    ad
      ? {
          name: ad.name,
          detail: ad.detail ?? '',
          imageUrl: ad.imageUrl,
          actionType: ad.actionType,
          actionValue: ad.actionValue,
          actionLabel: ad.actionLabel ?? '',
          isActive: ad.isActive,
          sortOrder: ad.sortOrder,
        }
      : { ...emptyForm }
  );
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const meta = ACTION_META[form.actionType];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      setSaving(true);
      setSaveError(null);

      if (ad) {
        await adminService.updateAd(ad.id, form);
      } else {
        await adminService.createAd(form);
      }
      onSaved();
    } catch (err) {
      // The server validates the destination per action type, so its message
      // is more specific than anything worth duplicating here.
      setSaveError(handleApiError(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4">
      <form
        onSubmit={handleSubmit}
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-lg bg-white p-6"
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            {ad ? 'Edit advertisement' : 'New advertisement'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 text-gray-400 hover:bg-gray-100"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          <Field label="Name" htmlFor="ad-name">
            <input
              id="ad-name"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Weekend special"
              className={inputClass}
            />
          </Field>

          <Field label="Detail" htmlFor="ad-detail" optional>
            <input
              id="ad-detail"
              value={form.detail ?? ''}
              onChange={(e) => setForm({ ...form, detail: e.target.value })}
              placeholder="Short line shown under the name"
              className={inputClass}
            />
          </Field>

          <ImageField
            value={form.imageUrl}
            onChange={(url) => setForm({ ...form, imageUrl: url })}
          />

          <Field label="Button action" htmlFor="ad-action">
            <select
              id="ad-action"
              value={form.actionType}
              onChange={(e) =>
                setForm({ ...form, actionType: e.target.value as AdActionType })
              }
              className={inputClass}
            >
              {(Object.keys(ACTION_META) as AdActionType[]).map((type) => (
                <option key={type} value={type}>
                  {ACTION_META[type].label}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Destination" htmlFor="ad-value" hint={meta.hint}>
            <input
              id="ad-value"
              required
              value={form.actionValue}
              onChange={(e) => setForm({ ...form, actionValue: e.target.value })}
              placeholder={meta.placeholder}
              className={inputClass}
            />
          </Field>

          <Field label="Button text" htmlFor="ad-label" optional>
            <input
              id="ad-label"
              value={form.actionLabel ?? ''}
              onChange={(e) => setForm({ ...form, actionLabel: e.target.value })}
              placeholder={meta.button}
              className={inputClass}
            />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Order" htmlFor="ad-order" hint="Lower shows first.">
              <input
                id="ad-order"
                type="number"
                value={form.sortOrder ?? 0}
                onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })}
                className={inputClass}
              />
            </Field>

            <div className="flex items-end pb-2">
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={form.isActive ?? true}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                  className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                />
                Show on the site
              </label>
            </div>
          </div>
        </div>

        {saveError && (
          <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
            {saveError}
          </p>
        )}

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:bg-gray-300"
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            {ad ? 'Save changes' : 'Create'}
          </button>
        </div>
      </form>
    </div>
  );
}

/**
 * Image picker for an ad.
 *
 * Uploads the chosen file and stores the hosted URL, so an admin never has to
 * find a URL for an image themselves. Type and size are checked here to fail
 * fast with a clear message rather than after a slow upload.
 */
function ImageField({
  value,
  onChange,
}: {
  value: string;
  onChange: (url: string) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(file: File | undefined) {
    if (!file) return;

    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      setError('Choose a JPG, PNG, WebP or GIF image.');
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setError(`That image is ${(file.size / 1024 / 1024).toFixed(1)}MB. The limit is 5MB.`);
      return;
    }

    try {
      setUploading(true);
      setError(null);
      const { url } = await adminService.uploadImage(file);
      onChange(url);
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-gray-700">Image</label>

      {value ? (
        <div className="relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="" className="h-32 w-full rounded-lg object-cover" />
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute right-2 top-2 rounded-full bg-black/60 p-1 text-white hover:bg-black/80"
            aria-label="Remove image"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="flex h-32 w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 text-sm text-gray-500 transition-colors hover:border-indigo-400 hover:text-indigo-600 disabled:opacity-60"
        >
          {uploading ? (
            <>
              <Loader2 className="h-6 w-6 animate-spin" />
              Uploading…
            </>
          ) : (
            <>
              <Upload className="h-6 w-6" />
              Choose an image
              <span className="text-xs text-gray-400">JPG, PNG, WebP or GIF, up to 5MB</span>
            </>
          )}
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_IMAGE_TYPES.join(',')}
        onChange={(e) => handleFile(e.target.files?.[0])}
        className="hidden"
      />

      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
/** Matches the server's MAX_FILE_SIZE default. */
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

const inputClass =
  'w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500';

function Field({
  label,
  htmlFor,
  hint,
  optional,
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  optional?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1 block text-sm font-medium text-gray-700">
        {label}
        {optional && <span className="ml-1 text-xs text-gray-400">(optional)</span>}
      </label>
      {children}
      {hint && <p className="mt-1 text-xs text-gray-500">{hint}</p>}
    </div>
  );
}
