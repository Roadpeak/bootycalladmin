'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Search,
  Filter,
  Download,
  Calendar,
  CreditCard,
  TrendingUp,
  Phone,
  Info,
  ChevronDown,
  User as UserIcon,
  AlertCircle
} from 'lucide-react';
import { adminService, handleApiError } from '@/lib/api';
import type { Payment } from '@/types/api';

export default function HookupPaymentsPage() {
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedPayment, setExpandedPayment] = useState<string | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  // Fetch payments from API
  useEffect(() => {
    fetchPayments();
  }, [currentPage, activeTab, searchQuery]);

  async function fetchPayments() {
    try {
      setLoading(true);
      setError(null);

      const params: any = {
        page: currentPage,
        limit: 20,
        type: 'VIP_SUBSCRIPTION', // Only VIP subscription payments
        search: searchQuery || undefined
      };

      if (activeTab === 'completed') params.status = 'COMPLETED';
      if (activeTab === 'pending') params.status = 'PENDING';
      if (activeTab === 'failed') params.status = 'FAILED';

      const response = await adminService.getPayments(params);
      setPayments(response.data || []);
      setTotalPages(response.pagination?.totalPages || 1);
      setTotal(response.pagination?.total || 0);
    } catch (err) {
      setError(handleApiError(err));
      console.error('Error fetching payments:', err);
    } finally {
      setLoading(false);
    }
  }

  const togglePaymentDetails = (id: string) => {
    setExpandedPayment(expandedPayment === id ? null : id);
  };

  // Loading state
  if (loading && payments.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading payments...</p>
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
            <h3 className="text-red-800 font-medium">Error Loading Payments</h3>
          </div>
          <p className="mt-2 text-red-700 text-sm">{error}</p>
          <button
            onClick={() => fetchPayments()}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Calculate stats from payments
  const stats = {
    totalRevenue: payments.reduce((sum, p) => sum + p.amount, 0),
    todayRevenue: payments
      .filter(p => new Date(p.createdAt).toDateString() === new Date().toDateString())
      .reduce((sum, p) => sum + p.amount, 0),
    todayPayments: payments.filter(p =>
      new Date(p.createdAt).toDateString() === new Date().toDateString()
    ).length,
    completedPayments: payments.filter(p => p.status === 'COMPLETED').length
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">VIP Subscription Payments</h1>
        <div className="flex gap-3">
          <button className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
            <Filter className="h-4 w-4 mr-1" />
            <span>Filter</span>
          </button>
          <button className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
            <Download className="h-4 w-4 mr-1" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">KSh {stats.totalRevenue.toLocaleString('en-US')}</p>
              <p className="text-xs text-gray-500 mt-1">{total.toLocaleString()} total payments</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <CreditCard className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Today&apos;s Revenue</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">KSh {stats.todayRevenue.toLocaleString('en-US')}</p>
              <div className="flex items-center text-green-500 text-xs mt-1">
                <TrendingUp className="h-3 w-3 mr-1" />
                <span>VIP subscriptions</span>
              </div>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <Calendar className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Payments Today</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{stats.todayPayments}</p>
              <p className="text-xs text-gray-500 mt-1">VIP subscriptions</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <Phone className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Completed</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{stats.completedPayments}</p>
              <p className="text-xs text-gray-500 mt-1">Successful payments</p>
            </div>
            <div className="bg-amber-100 p-3 rounded-lg">
              <TrendingUp className="h-6 w-6 text-amber-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Payments List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <h2 className="text-lg font-medium text-gray-900">VIP Subscription Payments</h2>

          {/* Search */}
          <div className="relative max-w-xs w-full">
            <input
              type="text"
              placeholder="Search phone, email, transaction..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-100 overflow-x-auto">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-6 py-3 text-sm font-medium whitespace-nowrap ${
              activeTab === 'all'
                ? 'text-indigo-600 border-b-2 border-indigo-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            All Payments
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`px-6 py-3 text-sm font-medium whitespace-nowrap ${
              activeTab === 'completed'
                ? 'text-indigo-600 border-b-2 border-indigo-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Completed
          </button>
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-6 py-3 text-sm font-medium whitespace-nowrap ${
              activeTab === 'pending'
                ? 'text-indigo-600 border-b-2 border-indigo-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Pending
          </button>
          <button
            onClick={() => setActiveTab('failed')}
            className={`px-6 py-3 text-sm font-medium whitespace-nowrap ${
              activeTab === 'failed'
                ? 'text-indigo-600 border-b-2 border-indigo-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Failed
          </button>
        </div>

        {/* Payments */}
        <div className="divide-y divide-gray-100">
          {payments.map((payment) => {
            const userName = payment.user
              ? (payment.user.displayName || `${payment.user.firstName} ${payment.user.lastName}`)
              : payment.phone;

            return (
              <div key={payment.id} className="hover:bg-gray-50">
                <div
                  className="p-4 sm:px-6 cursor-pointer"
                  onClick={() => togglePaymentDetails(payment.id)}
                >
                  <div className="flex flex-col sm:flex-row justify-between">
                    <div className="flex items-center">
                      {/* User Avatar */}
                      <div className="flex-shrink-0 mr-4">
                        <div className="relative">
                          {payment.user ? (
                            <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                              <UserIcon className="h-6 w-6 text-indigo-600" />
                            </div>
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                              <UserIcon className="h-6 w-6 text-gray-600" />
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Payment Details */}
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {userName}
                        </div>
                        <div className="text-sm text-gray-500 mt-0.5">
                          {payment.user?.email || payment.phone}
                        </div>
                        <div className="text-xs text-gray-400 mt-0.5">
                          {new Date(payment.createdAt).toLocaleString()}
                        </div>
                      </div>
                    </div>

                    {/* Right Side */}
                    <div className="flex items-center mt-3 sm:mt-0">
                      {/* Amount */}
                      <div className="font-medium text-gray-900 mr-4">
                        KSh {payment.amount.toLocaleString()}
                      </div>

                      {/* Status */}
                      <div>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          payment.status === 'COMPLETED'
                            ? 'bg-green-100 text-green-800'
                            : payment.status === 'PENDING'
                            ? 'bg-yellow-100 text-yellow-800'
                            : payment.status === 'FAILED'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {payment.status}
                        </span>
                      </div>

                      {/* Dropdown Indicator */}
                      <ChevronDown
                        className={`h-5 w-5 ml-4 text-gray-400 transition-transform ${
                          expandedPayment === payment.id ? 'transform rotate-180' : ''
                        }`}
                      />
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {expandedPayment === payment.id && (
                  <div className="px-4 pb-4 sm:px-6 bg-gray-50 border-t border-gray-100">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div>
                        <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                          Payment Details
                        </h4>
                        <dl className="grid grid-cols-2 gap-x-4 gap-y-2">
                          <dt className="text-sm text-gray-500">Transaction ID</dt>
                          <dd className="text-sm font-medium text-gray-900">{payment.mpesaTransactionId || 'N/A'}</dd>

                          <dt className="text-sm text-gray-500">Receipt Number</dt>
                          <dd className="text-sm font-medium text-gray-900">{payment.mpesaReceiptNumber || 'N/A'}</dd>

                          <dt className="text-sm text-gray-500">Phone Number</dt>
                          <dd className="text-sm font-medium text-gray-900">{payment.phone}</dd>

                          <dt className="text-sm text-gray-500">Amount</dt>
                          <dd className="text-sm font-medium text-gray-900">KSh {payment.amount.toLocaleString()}</dd>

                          <dt className="text-sm text-gray-500">Date & Time</dt>
                          <dd className="text-sm font-medium text-gray-900">
                            {new Date(payment.createdAt).toLocaleString()}
                          </dd>

                          <dt className="text-sm text-gray-500">Type</dt>
                          <dd className="text-sm font-medium text-gray-900">
                            {payment.type.replace(/_/g, ' ')}
                          </dd>
                        </dl>
                      </div>

                      <div>
                        <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                          User Information
                        </h4>
                        <dl className="grid grid-cols-2 gap-x-4 gap-y-2">
                          {payment.user ? (
                            <>
                              <dt className="text-sm text-gray-500">User ID</dt>
                              <dd className="text-sm font-medium text-gray-900">{payment.user.id}</dd>

                              <dt className="text-sm text-gray-500">Name</dt>
                              <dd className="text-sm font-medium text-gray-900">
                                {payment.user.displayName || `${payment.user.firstName} ${payment.user.lastName}`}
                              </dd>

                              <dt className="text-sm text-gray-500">Email</dt>
                              <dd className="text-sm font-medium text-gray-900">{payment.user.email}</dd>

                              <dt className="text-sm text-gray-500">Role</dt>
                              <dd className="text-sm font-medium text-gray-900">{payment.user.role}</dd>

                              <dt className="text-sm text-gray-500">Wallet Balance</dt>
                              <dd className="text-sm font-medium text-gray-900">
                                KSh {payment.user.walletBalance.toLocaleString()}
                              </dd>
                            </>
                          ) : (
                            <>
                              <dt className="text-sm text-gray-500">User Type</dt>
                              <dd className="text-sm font-medium text-gray-900">Guest Payment</dd>
                            </>
                          )}
                        </dl>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Empty state */}
        {payments.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-gray-500">No payments found</p>
          </div>
        )}

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Showing <span className="font-medium">{payments.length}</span> of <span className="font-medium">{total}</span> payments
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button className="px-3 py-1 bg-indigo-600 text-white border border-indigo-600 rounded-md text-sm">
              {currentPage}
            </button>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
              className="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Info Card */}
      <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <Info className="h-5 w-5 text-blue-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">About VIP Subscriptions</h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>VIP subscriptions provide premium access to hookup users with enhanced features and benefits. Payments are processed through M-Pesa and tracked here.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
