'use client';

import { useState, useEffect } from 'react';
import {
  AlertCircle, Check, Loader2, Wallet, Send, Building2, RefreshCw,
} from 'lucide-react';
import { adminService, handleApiError } from '@/lib/api';
import type {
  Withdrawal,
  UserBalance,
  ServiceFeeStatus,
} from '@/types/api';

type Tab = 'requests' | 'balances' | 'service-fee';

const money = (value: string | number) =>
  `KSh ${Math.abs(Number(value)).toLocaleString(undefined, { maximumFractionDigits: 2 })}`;

const STATUS_STYLES: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  COMPLETED: 'bg-green-100 text-green-800',
  REJECTED: 'bg-red-100 text-red-800',
};

export default function WithdrawalsPage() {
  const [tab, setTab] = useState<Tab>('requests');
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  function flash(message: string) {
    setNotice(message);
    setTimeout(() => setNotice(null), 3000);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Withdrawals &amp; Balances</h1>
        <p className="mt-1 text-sm text-gray-600">
          Payout requests, what each account is holding, and the service fee owed to
          the development company.
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

      <div className="flex gap-2 border-b border-gray-200">
        <TabButton active={tab === 'requests'} onClick={() => setTab('requests')} label="Requests" />
        <TabButton active={tab === 'balances'} onClick={() => setTab('balances')} label="Balances" />
        <TabButton
          active={tab === 'service-fee'}
          onClick={() => setTab('service-fee')}
          label="Service fee"
        />
      </div>

      {tab === 'requests' && <RequestsTab onError={setError} onDone={flash} />}
      {tab === 'balances' && <BalancesTab onError={setError} />}
      {tab === 'service-fee' && <ServiceFeeTab onError={setError} onDone={flash} />}
    </div>
  );
}

function TabButton({
  active,
  onClick,
  label,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 text-sm font-semibold transition-colors ${
        active
          ? 'border-b-2 border-indigo-600 text-indigo-600'
          : 'text-gray-600 hover:text-gray-900'
      }`}
    >
      {label}
    </button>
  );
}

function RequestsTab({
  onError,
  onDone,
}: {
  onError: (message: string) => void;
  onDone: (message: string) => void;
}) {
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('PENDING');
  const [processing, setProcessing] = useState<string | null>(null);

  useEffect(() => {
    fetchWithdrawals();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  async function fetchWithdrawals() {
    try {
      setLoading(true);
      const res = await adminService.getWithdrawals({
        page: 1,
        limit: 50,
        ...(status ? { status: status as 'PENDING' | 'COMPLETED' | 'REJECTED' } : {}),
      });
      if (res.data) setWithdrawals(res.data);
    } catch (err) {
      onError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  }

  async function process(id: string, decision: 'COMPLETED' | 'REJECTED') {
    try {
      setProcessing(id);
      await adminService.processWithdrawal(id, { status: decision });
      onDone(
        decision === 'COMPLETED'
          ? 'Payout sent. It stays pending until M-Pesa confirms.'
          : 'Request rejected and the amount returned to the wallet.'
      );
      fetchWithdrawals();
    } catch (err) {
      onError(handleApiError(err));
    } finally {
      setProcessing(null);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {['PENDING', 'COMPLETED', 'REJECTED', ''].map((value) => (
          <button
            key={value || 'all'}
            onClick={() => setStatus(value)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
              status === value
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            {value || 'All'}
          </button>
        ))}
      </div>

      {withdrawals.length === 0 ? (
        <p className="rounded-lg bg-white p-10 text-center text-sm text-gray-600 shadow">
          No withdrawal requests here.
        </p>
      ) : (
        <div className="overflow-hidden rounded-lg bg-white shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {['User', 'Phone', 'Amount', 'Requested', 'Status', ''].map((h) => (
                  <th
                    key={h}
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {withdrawals.map((w) => {
                const meta = (w as unknown as { metadata?: { phone?: string } }).metadata;
                return (
                  <tr key={w.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">
                        {w.user?.displayName ||
                          `${w.user?.firstName ?? ''} ${w.user?.lastName ?? ''}`.trim() ||
                          'Unknown'}
                      </p>
                      <p className="text-sm text-gray-500">{w.user?.email}</p>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-700">
                      {meta?.phone || w.phone || '—'}
                    </td>
                    {/* Withdrawals are stored negative; show the magnitude. */}
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {money(w.amount)}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(w.createdAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-semibold ${
                          STATUS_STYLES[w.status] ?? 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {w.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {w.status === 'PENDING' ? (
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => process(w.id, 'COMPLETED')}
                            disabled={processing === w.id}
                            className="inline-flex items-center gap-1 rounded-lg bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-700 disabled:bg-gray-300"
                          >
                            {processing === w.id ? (
                              <Loader2 className="h-3 w-3 animate-spin" />
                            ) : (
                              <Send className="h-3 w-3" />
                            )}
                            Pay
                          </button>
                          <button
                            onClick={() => process(w.id, 'REJECTED')}
                            disabled={processing === w.id}
                            className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700 disabled:bg-gray-300"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function BalancesTab({ onError }: { onError: (message: string) => void }) {
  const [balances, setBalances] = useState<UserBalance[]>([]);
  const [totalOwed, setTotalOwed] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const res = await adminService.getBalances({ page: 1, limit: 50 });
        if (res.data) setBalances(res.data);
        const summary = (res as unknown as { summary?: { totalOwed: number } }).summary;
        if (summary) setTotalOwed(summary.totalOwed);
      } catch (err) {
        onError(handleApiError(err));
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-lg bg-white p-5 shadow">
        <div className="flex items-center gap-2">
          <Wallet className="h-5 w-5 text-indigo-500" />
          <p className="text-sm text-gray-600">Total held in user wallets</p>
        </div>
        <p className="mt-1 text-2xl font-bold text-gray-900">{money(totalOwed)}</p>
        <p className="mt-1 text-xs text-gray-500">
          Money already earned and withdrawable — a liability, not revenue.
        </p>
      </div>

      {balances.length === 0 ? (
        <p className="rounded-lg bg-white p-10 text-center text-sm text-gray-600 shadow">
          No account is holding a balance.
        </p>
      ) : (
        <div className="overflow-hidden rounded-lg bg-white shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {['User', 'Role', 'Phone', 'Balance'].map((h) => (
                  <th
                    key={h}
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {balances.map((u) => (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <p className="font-medium text-gray-900">
                      {u.displayName || `${u.firstName} ${u.lastName}`.trim()}
                    </p>
                    <p className="text-sm text-gray-500">{u.email}</p>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {u.role.replace('_', ' ').toLowerCase()}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{u.phone}</td>
                  <td className="px-6 py-4 font-medium text-gray-900">
                    {money(u.walletBalance)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function ServiceFeeTab({
  onError,
  onDone,
}: {
  onError: (message: string) => void;
  onDone: (message: string) => void;
}) {
  const [status, setStatus] = useState<ServiceFeeStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [settling, setSettling] = useState(false);

  async function load() {
    try {
      setLoading(true);
      const res = await adminService.getServiceFeeStatus({ page: 1, limit: 20 });
      if (res.data) setStatus(res.data);
    } catch (err) {
      onError(handleApiError(err));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function settle() {
    try {
      setSettling(true);
      const result = await adminService.settleServiceFee(true);
      onDone(
        result.settled
          ? `Sending ${money(result.amount)} to the service fee paybill.`
          : result.reason || 'Nothing to settle.'
      );
      load();
    } catch (err) {
      onError(handleApiError(err));
    } finally {
      setSettling(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  const outstanding = status?.outstanding.amount ?? 0;

  return (
    <div className="space-y-4">
      <div className="rounded-lg bg-white p-5 shadow">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-indigo-500" />
              <p className="text-sm text-gray-600">Owed to the development company</p>
            </div>
            <p className="mt-1 text-2xl font-bold text-gray-900">{money(outstanding)}</p>
            <p className="mt-1 text-xs text-gray-500">
              Collected from {status?.outstanding.shareCount ?? 0} payments since the
              last settlement.
            </p>
          </div>

          <button
            onClick={settle}
            disabled={settling || outstanding <= 0 || !status?.payoutsConfigured}
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            {settling ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            Send now
          </button>
        </div>

        {!status?.payoutsConfigured && (
          <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800">
            M-Pesa payout credentials are not set, so nothing can be sent yet. Add
            them to the API environment first.
          </p>
        )}
      </div>

      {status && status.settlements.length > 0 && (
        <div className="overflow-hidden rounded-lg bg-white shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {['Amount', 'Period', 'Status', 'M-Pesa ref', 'Sent'].map((h) => (
                  <th
                    key={h}
                    className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {status.settlements.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-900">{money(s.amount)}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(s.periodStart).toLocaleDateString()} –{' '}
                    {new Date(s.periodEnd).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-semibold ${
                        s.status === 'SETTLED'
                          ? 'bg-green-100 text-green-800'
                          : s.status === 'FAILED'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {s.status}
                    </span>
                    {s.failureReason && (
                      <p className="mt-1 text-xs text-red-600">{s.failureReason}</p>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{s.mpesaTxnId || '—'}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {s.settledAt ? new Date(s.settledAt).toLocaleString() : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
