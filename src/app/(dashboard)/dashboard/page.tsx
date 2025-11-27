'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ChevronRight,
  Users,
  CreditCard,
  DollarSign,
  AlertCircle,
  Activity,
  Heart,
  User as UserIcon,
  MessageCircle,
  CheckSquare
} from 'lucide-react';
import { adminService, handleApiError } from '@/lib/api';
import type { DashboardStats, Payment, Escort } from '@/types/api';

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentPayments, setRecentPayments] = useState<Payment[]>([]);
  const [pendingEscorts, setPendingEscorts] = useState<Escort[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch dashboard data
  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setLoading(true);
        setError(null);

        // Fetch dashboard stats
        const dashboardStats = await adminService.getDashboardStats();
        setStats(dashboardStats);

        // Fetch recent payments
        const paymentsResponse = await adminService.getPayments({
          page: 1,
          limit: 5
        });
        if (paymentsResponse.data) {
          setRecentPayments(paymentsResponse.data);
        }

        // Fetch pending escort verifications
        const escortsResponse = await adminService.getEscorts({
          verified: false,
          page: 1,
          limit: 3
        });
        if (escortsResponse.data) {
          setPendingEscorts(escortsResponse.data);
        }
      } catch (err) {
        setError(handleApiError(err));
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
            <h3 className="text-red-800 font-medium">Error Loading Dashboard</h3>
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

  // No data state
  if (!stats) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-600">No dashboard data available</p>
      </div>
    );
  }

  // User type breakdown from API
  const userTypes = [
    { name: 'Dating Users', count: stats.users.datingUsers, icon: Heart, color: 'bg-pink-500' },
    { name: 'Hookup Users', count: stats.users.hookupUsers, icon: MessageCircle, color: 'bg-purple-500' },
    { name: 'Escorts', count: stats.users.escorts, icon: UserIcon, color: 'bg-blue-500' }
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Dashboard</h1>

      {/* Main Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Users */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Users</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{stats.users.total.toLocaleString()}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        {/* Total Revenue */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">KSh {stats.payments.totalRevenue.toLocaleString('en-US')}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        {/* Total Payments */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Payments</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{stats.payments.count.toLocaleString()}</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <CreditCard className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        {/* Pending Actions */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Pending Verifications</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{stats.pending.verifications}</p>
            </div>
            <div className="bg-pink-100 p-3 rounded-lg">
              <CheckSquare className="h-6 w-6 text-pink-600" />
            </div>
          </div>
          <div className="flex items-center text-gray-500 text-sm mt-4">
            <AlertCircle className="h-4 w-4 mr-1" />
            <span>{stats.pending.withdrawals} withdrawals pending</span>
          </div>
        </div>
      </div>

      {/* User Type Breakdown & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User Type Breakdown */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">User Type Breakdown</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {userTypes.map((type, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center">
                  <div className={`${type.color} p-3 rounded-lg mr-4`}>
                    <type.icon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-gray-900">{type.count.toLocaleString()}</p>
                    <p className="text-sm font-medium text-gray-500">{type.name}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* User Activity Graph would go here */}
          <div className="mt-6 h-72 bg-gray-50 rounded-lg flex items-center justify-center">
            <p className="text-gray-500">User Activity Graph</p>
          </div>
        </div>

        {/* Alerts & Notifications */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-lg font-medium text-gray-900">Alerts & Actions</h2>
          </div>

          <div className="p-6 space-y-6">
            {/* Pending Verifications */}
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <CheckSquare className="h-5 w-5 text-blue-600" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">Pending Verifications</h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <p>{stats.pending.verifications} escort verifications pending approval</p>
                  </div>
                  <div className="mt-3">
                    <Link
                      href="/escorts"
                      className="text-sm font-medium text-blue-600 hover:text-blue-500"
                    >
                      Review Verifications <ChevronRight className="inline h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* Pending Withdrawals */}
            <div className="bg-amber-50 border border-amber-100 rounded-lg p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <AlertCircle className="h-5 w-5 text-amber-600" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-amber-800">Pending Withdrawals</h3>
                  <div className="mt-2 text-sm text-amber-700">
                    <p>{stats.pending.withdrawals} withdrawal requests pending</p>
                  </div>
                  <div className="mt-3">
                    <Link
                      href="/referral-program/cashouts"
                      className="text-sm font-medium text-amber-600 hover:text-amber-500"
                    >
                      Process Withdrawals <ChevronRight className="inline h-4 w-4" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>

            {/* System Health */}
            <div className="bg-green-50 border border-green-100 rounded-lg p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <Activity className="h-5 w-5 text-green-600" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800">System Status</h3>
                  <div className="mt-2 text-sm text-green-700">
                    <p>All systems operational</p>
                    <p className="mt-1">{stats.payments.count} total payments</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Payments */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
            <h2 className="text-lg font-medium text-gray-900">Recent Payments</h2>
            <Link href="/dating-payments" className="text-sm text-indigo-600 hover:text-indigo-500">View All</Link>
          </div>

          {recentPayments.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {recentPayments.map((payment) => {
                    const userName = payment.user
                      ? (payment.user.displayName || `${payment.user.firstName} ${payment.user.lastName}`)
                      : payment.phone;

                    return (
                      <tr key={payment.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {userName}
                          </div>
                          {payment.user?.email && (
                            <div className="text-sm text-gray-500">{payment.user.email}</div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {payment.type.replace(/_/g, ' ')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          KSh {payment.amount.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(payment.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            payment.status === 'COMPLETED'
                              ? 'bg-green-100 text-green-800'
                              : payment.status === 'PENDING'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {payment.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-6 text-center text-gray-500">
              No recent payments
            </div>
          )}
        </div>

        {/* Recent Verifications */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-lg font-medium text-gray-900">Recent Verification Requests</h2>
          </div>

          {pendingEscorts.length > 0 ? (
            <>
              <ul className="divide-y divide-gray-100">
                {pendingEscorts.map((escort) => (
                  <li key={escort.id} className="p-4 hover:bg-gray-50">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        {escort.photos && escort.photos.length > 0 ? (
                          <img
                            className="h-10 w-10 rounded-full object-cover"
                            src={escort.photos[0]}
                            alt={escort.name}
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                            <UserIcon className="h-6 w-6 text-gray-600" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{escort.name}</p>
                        <p className="text-sm text-gray-500 truncate">Escort Verification</p>
                      </div>
                      <div className="flex-shrink-0">
                        <div className="text-xs text-gray-500">
                          {new Date(escort.createdAt).toLocaleDateString()}
                        </div>
                        <Link
                          href={`/escorts`}
                          className="text-xs text-indigo-600 hover:text-indigo-500 mt-1 block"
                        >
                          Review
                        </Link>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>

              <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
                <Link href="/escorts" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
                  View All Verifications
                </Link>
              </div>
            </>
          ) : (
            <div className="p-6 text-center text-gray-500">
              No pending verifications
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
