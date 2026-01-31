'use client';

import { useState, useEffect } from 'react';
import {
  DollarSign,
  TrendingUp,
  Users,
  Heart,
  Wallet,
  ArrowDownRight,
  ArrowUpRight,
  AlertCircle
} from 'lucide-react';
import { adminService, handleApiError } from '@/lib/api';
import type { PlatformEarnings } from '@/types/api';

export default function EarningsPage() {
  const [earnings, setEarnings] = useState<PlatformEarnings | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchEarnings() {
      try {
        setLoading(true);
        setError(null);
        const data = await adminService.getPlatformEarnings();
        setEarnings(data);
      } catch (err) {
        setError(handleApiError(err));
        console.error('Error fetching earnings:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchEarnings();
  }, []);

  const formatCurrency = (amount: number) => {
    return `KSh ${Number(amount).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-700 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading earnings data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
            <h3 className="text-red-800 font-medium">Error Loading Earnings</h3>
          </div>
          <p className="mt-2 text-red-700 text-sm">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!earnings) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">No earnings data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Platform Earnings</h1>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Gross Revenue */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Gross Revenue</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {formatCurrency(earnings.summary.grossRevenue)}
              </p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <DollarSign className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">Total payments received</p>
        </div>

        {/* Total Payouts */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Payouts</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {formatCurrency(earnings.summary.totalPayouts)}
              </p>
            </div>
            <div className="bg-red-100 p-3 rounded-lg">
              <ArrowDownRight className="h-6 w-6 text-red-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">Referrals + Escort earnings</p>
        </div>

        {/* Net Platform Earnings */}
        <div className="bg-white rounded-lg shadow p-6 border-2 border-green-200">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Net Platform Earnings</p>
              <p className="text-2xl font-bold text-green-600 mt-2">
                {formatCurrency(earnings.summary.netPlatformEarnings)}
              </p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">Platform&apos;s share after payouts</p>
        </div>

        {/* Profit Margin */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Profit Margin</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {earnings.summary.grossRevenue > 0
                  ? ((earnings.summary.netPlatformEarnings / earnings.summary.grossRevenue) * 100).toFixed(1)
                  : 0}%
              </p>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <ArrowUpRight className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">Platform earnings ratio</p>
        </div>
      </div>

      {/* Revenue Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue by Type */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Revenue Breakdown</h2>
          <div className="space-y-4">
            {/* Dating Subscriptions */}
            <div className="border border-gray-100 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <div className="bg-red-100 p-2 rounded-lg mr-3">
                    <Heart className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Dating Subscriptions</p>
                    <p className="text-xs text-gray-500">KSh 300/subscription</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900">{formatCurrency(earnings.revenue.dating.total)}</p>
                  <p className="text-xs text-gray-500">{earnings.revenue.dating.count} payments</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-gray-100">
                <div className="bg-green-50 rounded p-2">
                  <p className="text-xs text-green-600">Platform (50%)</p>
                  <p className="font-medium text-green-700">{formatCurrency(earnings.revenue.dating.platformShare)}</p>
                </div>
                <div className="bg-blue-50 rounded p-2">
                  <p className="text-xs text-blue-600">Referrals (50%)</p>
                  <p className="font-medium text-blue-700">{formatCurrency(earnings.revenue.dating.referralShare)}</p>
                </div>
              </div>
            </div>

            {/* VIP Subscriptions */}
            <div className="border border-gray-100 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <div className="bg-amber-100 p-2 rounded-lg mr-3">
                    <Users className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">VIP Subscriptions</p>
                    <p className="text-xs text-gray-500">KSh 3,000/subscription</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900">{formatCurrency(earnings.revenue.vip.total)}</p>
                  <p className="text-xs text-gray-500">{earnings.revenue.vip.count} payments</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-gray-100">
                <div className="bg-green-50 rounded p-2">
                  <p className="text-xs text-green-600">Platform (50%)</p>
                  <p className="font-medium text-green-700">{formatCurrency(earnings.revenue.vip.platformShare)}</p>
                </div>
                <div className="bg-blue-50 rounded p-2">
                  <p className="text-xs text-blue-600">Referrals (50%)</p>
                  <p className="font-medium text-blue-700">{formatCurrency(earnings.revenue.vip.referralShare)}</p>
                </div>
              </div>
            </div>

            {/* Escort Unlocks */}
            <div className="border border-gray-100 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <div className="bg-purple-100 p-2 rounded-lg mr-3">
                    <Wallet className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Escort Unlocks</p>
                    <p className="text-xs text-gray-500">KSh 150/unlock</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900">{formatCurrency(earnings.revenue.unlock.total)}</p>
                  <p className="text-xs text-gray-500">{earnings.revenue.unlock.count} unlocks</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-gray-100">
                <div className="bg-green-50 rounded p-2">
                  <p className="text-xs text-green-600">Platform (10%)</p>
                  <p className="font-medium text-green-700">{formatCurrency(earnings.revenue.unlock.platformShare)}</p>
                </div>
                <div className="bg-orange-50 rounded p-2">
                  <p className="text-xs text-orange-600">Escorts (90%)</p>
                  <p className="font-medium text-orange-700">{formatCurrency(earnings.revenue.unlock.escortShare)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Platform Earnings & Payouts */}
        <div className="space-y-6">
          {/* Platform Earnings Breakdown */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Platform Earnings Sources</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-700">From Dating (50%)</span>
                <span className="font-medium text-gray-900">{formatCurrency(earnings.platformEarnings.fromDating)}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-700">From VIP (50%)</span>
                <span className="font-medium text-gray-900">{formatCurrency(earnings.platformEarnings.fromVip)}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-gray-700">From Unlocks (10%)</span>
                <span className="font-medium text-gray-900">{formatCurrency(earnings.platformEarnings.fromUnlocks)}</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-green-100 rounded-lg border border-green-200">
                <span className="font-medium text-green-800">Total Platform Earnings</span>
                <span className="font-bold text-green-800">{formatCurrency(earnings.platformEarnings.total)}</span>
              </div>
            </div>
          </div>

          {/* Payouts */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Payouts</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <span className="text-gray-700">Referral Payouts</span>
                  <p className="text-xs text-gray-500">{earnings.payouts.referrals.count} transactions</p>
                </div>
                <span className="font-medium text-gray-900">{formatCurrency(earnings.payouts.referrals.total)}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <span className="text-gray-700">Escort Earnings</span>
                  <p className="text-xs text-gray-500">{earnings.payouts.escorts.count} transactions</p>
                </div>
                <span className="font-medium text-gray-900">{formatCurrency(earnings.payouts.escorts.total)}</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200">
                <span className="font-medium text-red-800">Total Payouts</span>
                <span className="font-bold text-red-800">{formatCurrency(earnings.payouts.totalPayouts)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Split Info */}
      <div className="bg-gradient-to-r from-amber-50 to-red-50 rounded-lg shadow p-6 border border-amber-200">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Payment Split Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-2">Dating Subscription (KSh 300)</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>Platform: 50% (KSh 150)</li>
              <li>Referral Pool: 50% (KSh 150)</li>
              <li className="text-xs text-gray-500 pt-1">- Level 1 (Direct): KSh 100</li>
              <li className="text-xs text-gray-500">- Level 2: KSh 50</li>
            </ul>
          </div>
          <div className="bg-white rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-2">VIP Subscription (KSh 3,000)</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>Platform: 50% (KSh 1,500)</li>
              <li>Referral Pool: 50% (KSh 1,500)</li>
              <li className="text-xs text-gray-500 pt-1">- Level 1 (Direct): KSh 1,000</li>
              <li className="text-xs text-gray-500">- Level 2: KSh 500</li>
            </ul>
          </div>
          <div className="bg-white rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-2">Escort Unlock (KSh 150)</h3>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>Platform: 10% (KSh 15)</li>
              <li>Escort: 90% (KSh 135)</li>
              <li className="text-xs text-gray-500 pt-1">No referral rewards</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
