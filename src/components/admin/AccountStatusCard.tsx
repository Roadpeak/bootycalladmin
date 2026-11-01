'use client';

import { useState } from 'react';
import { adminService } from '@/lib/api/admin';
import { handleApiError } from '@/lib/api';
import type { AccountStatus } from '@/types/api';
import { StatusBadge, dateTime, money } from './ui';

const STATUS_LABEL: Record<AccountStatus, string> = {
  ACTIVE: 'Active',
  DEACTIVATED: 'Deactivated by member',
  SUSPENDED: 'Suspended',
  DELETED: 'Deleted',
};

const STATUS_HELP: Record<AccountStatus, string> = {
  ACTIVE: 'The member can log in and is visible on the site.',
  DEACTIVATED: 'The member paused their account. It is hidden; they can bring it back by logging in.',
  SUSPENDED: 'Hidden from the site and blocked from logging in until an admin reactivates it.',
  DELETED: 'Personal data has been erased. Payment records are kept.',
};

type Dialog = 'suspend' | 'delete' | null;

/**
 * Account status for one member, with suspend / reactivate / delete.
 * Used on the escort, dating-user and hookup-user detail pages.
 */
export default function AccountStatusCard({
  userId,
  status = 'ACTIVE',
  reason,
  changedAt,
  walletBalance,
  onChanged,
  onDeleted,
}: {
  userId: string;
  status?: AccountStatus;
  reason?: string | null;
  changedAt?: string | null;
  walletBalance?: number | string | null;
  onChanged: () => void;
  onDeleted: () => void;
}) {
  const [dialog, setDialog] = useState<Dialog>(null);
  const [note, setNote] = useState('');
  const [confirmText, setConfirmText] = useState('');
  const [forfeit, setForfeit] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const balance = Number(walletBalance ?? 0);

  const open = (next: Dialog) => {
    setDialog(next);
    setNote('');
    setConfirmText('');
    setForfeit(false);
    setError(null);
  };

  const run = async (action: () => Promise<unknown>, after: () => void) => {
    setBusy(true);
    setError(null);
    try {
      await action();
      setDialog(null);
      after();
    } catch (err) {
      setError(handleApiError(err));
    } finally {
      setBusy(false);
    }
  };

  const canDelete = confirmText.trim().toUpperCase() === 'DELETE' && (balance <= 0 || forfeit);

  return (
    <div className="rounded-lg bg-white p-6 shadow">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Account status</h3>
          <div className="mt-1 flex items-center gap-2">
            <StatusBadge status={status} label={STATUS_LABEL[status]} />
            {changedAt && <span className="text-xs text-gray-500">since {dateTime(changedAt)}</span>}
          </div>
        </div>
        {status !== 'DELETED' && (
          <div className="flex flex-wrap gap-2">
            {status === 'ACTIVE' ? (
              <button
                type="button"
                onClick={() => open('suspend')}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Suspend
              </button>
            ) : (
              <button
                type="button"
                disabled={busy}
                onClick={() => run(() => adminService.reactivateUser(userId), onChanged)}
                className="rounded-lg bg-green-600 px-3 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
              >
                {busy ? 'Reactivating…' : 'Reactivate'}
              </button>
            )}
            <button
              type="button"
              onClick={() => open('delete')}
              className="rounded-lg border border-red-300 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
            >
              Delete account
            </button>
          </div>
        )}
      </div>
      <p className="mt-3 text-sm text-gray-600">{STATUS_HELP[status]}</p>
      {reason && status !== 'ACTIVE' && (
        <p className="mt-2 text-sm text-gray-700">
          <span className="font-medium">Reason:</span> {reason}
        </p>
      )}
      {error && !dialog && <p className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      {dialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => !busy && setDialog(null)}>
          <div
            role="dialog"
            aria-modal="true"
            className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-lg font-semibold text-gray-900">
              {dialog === 'suspend' ? 'Suspend this account?' : 'Delete this account?'}
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              {dialog === 'suspend'
                ? 'They are logged out at once, hidden from the site, and cannot log in until you reactivate them.'
                : 'Their name, contacts, photos, profile, likes and notifications are erased and cannot be recovered. Payments, wallet history and referrals are kept. Their email and phone become free to sign up again.'}
            </p>

            {dialog === 'delete' && balance > 0 && (
              <label className="mt-3 flex items-start gap-2 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
                <input type="checkbox" checked={forfeit} onChange={(e) => setForfeit(e.target.checked)} className="mt-0.5" />
                <span>
                  They have <strong>{money(balance)}</strong> in their wallet. Pay it out first, or tick to confirm it is forfeited.
                </span>
              </label>
            )}

            <label className="mt-4 block text-sm font-medium text-gray-700" htmlFor="account-note">
              Reason {dialog === 'suspend' ? '(shown to other admins)' : '(kept on record)'}
            </label>
            <textarea
              id="account-note"
              rows={2}
              maxLength={500}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />

            {dialog === 'delete' && (
              <>
                <label className="mt-3 block text-sm font-medium text-gray-700" htmlFor="account-confirm">
                  Type <strong>DELETE</strong> to confirm
                </label>
                <input
                  id="account-confirm"
                  autoComplete="off"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                />
              </>
            )}

            {error && <p className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                disabled={busy}
                onClick={() => setDialog(null)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              {dialog === 'suspend' ? (
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => run(() => adminService.suspendUser(userId, note.trim() || undefined), onChanged)}
                  className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
                >
                  {busy ? 'Suspending…' : 'Suspend'}
                </button>
              ) : (
                <button
                  type="button"
                  disabled={busy || !canDelete}
                  onClick={() =>
                    run(() => adminService.deleteUser(userId, { reason: note.trim() || undefined, forfeitBalance: forfeit }), onDeleted)
                  }
                  className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
                >
                  {busy ? 'Deleting…' : 'Delete account'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
