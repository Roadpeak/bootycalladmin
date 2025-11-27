'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { adminService, handleApiError } from '@/lib/api';
import type { Withdrawal } from '@/types/api';
import {
  ChevronLeft,
  Download,
  Search,
  Check,
  X,
  AlertCircle,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react';

export default function CashoutsPage() {
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [showProcessModal, setShowProcessModal] = useState(false);
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<Withdrawal | null>(null);
  const [mpesaTransactionId, setMpesaTransactionId] = useState('');

  useEffect(() => {
    fetchWithdrawals();
  }, [currentPage, activeTab, searchQuery]);

  async function fetchWithdrawals() {
    try {
      setLoading(true);
      setError(null);

      const params: any = {
        page: currentPage,
        limit: 20
      };

      if (activeTab === 'pending') params.status = 'PENDING';
      if (activeTab === 'completed') params.status = 'COMPLETED';
      if (activeTab === 'rejected') params.status = 'REJECTED';

      const response = await adminService.getWithdrawals(params);

      if (response.data) {
        // Filter by search query if provided
        let filteredData = response.data;
        if (searchQuery) {
          const query = searchQuery.toLowerCase();
          filteredData = response.data.filter(w =>
            w.user?.email.toLowerCase().includes(query) ||
            w.user?.phone.includes(query) ||
            w.phone.includes(query) ||
            w.mpesaTransactionId?.toLowerCase().includes(query)
          );
        }
        setWithdrawals(filteredData);
      }

      if (response.pagination) {
        setPagination(response.pagination);
      }
    } catch (err) {
      setError(handleApiError(err));
      console.error('Error fetching withdrawals:', err);
    } finally {
      setLoading(false);
    }
  }

  function handleProcessClick(withdrawal: Withdrawal) {
    setSelectedWithdrawal(withdrawal);
    setMpesaTransactionId('');
    setShowProcessModal(true);
  }

  async function handleApproveWithdrawal() {
    if (!selectedWithdrawal) return;

    try {
      setProcessingId(selectedWithdrawal.id);
      await adminService.processWithdrawal(selectedWithdrawal.id, {
        status: 'COMPLETED',
        mpesaTransactionId: mpesaTransactionId || undefined
      });
      setShowProcessModal(false);
      setSelectedWithdrawal(null);
      setMpesaTransactionId('');
      fetchWithdrawals(); // Refresh list
    } catch (err) {
      alert(handleApiError(err));
    } finally {
      setProcessingId(null);
    }
  }

  async function handleRejectWithdrawal() {
    if (!selectedWithdrawal) return;

    try {
      setProcessingId(selectedWithdrawal.id);
      await adminService.processWithdrawal(selectedWithdrawal.id, {
        status: 'REJECTED',
        notes: 'Rejected by admin'
      });
      setShowProcessModal(false);
      setSelectedWithdrawal(null);
      fetchWithdrawals(); // Refresh list
    } catch (err) {
      alert(handleApiError(err));
    } finally {
      setProcessingId(null);
    }
  }

  const stats = {
    totalWithdrawals: pagination.total,
    pendingWithdrawals: withdrawals.filter(w => w.status === 'PENDING').length,
    completedWithdrawals: withdrawals.filter(w => w.status === 'COMPLETED').length,
    totalAmount: withdrawals
      .filter(w => w.status === 'PENDING')
      .reduce((sum, w) => sum + w.amount, 0)
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div className="flex items-center">
          <Link href="/referral-program" className="mr-4">
            <button className="p-2 hover:bg-gray-100 rounded-lg">
              <ChevronLeft className="h-5 w-5" />
            </button>
          </Link>
          <h1 className="text-2xl font-semibold">Withdrawal Requests</h1>
        </div>
        <div className="flex gap-3">
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
              <h2 className="text-sm font-medium text-gray-500">Total Requests</h2>
              <p className="text-2xl font-bold text-gray-900 mt-2">{stats.totalWithdrawals}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <DollarSign className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-sm font-medium text-gray-500">Pending</h2>
              <p className="text-2xl font-bold text-gray-900 mt-2">{stats.pendingWithdrawals}</p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-lg">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-sm font-medium text-gray-500">Completed</h2>
              <p className="text-2xl font-bold text-gray-900 mt-2">{stats.completedWithdrawals}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-sm font-medium text-gray-500">Pending Amount</h2>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                KSh {stats.totalAmount.toLocaleString()}
              </p>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <DollarSign className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Withdrawals List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <h2 className="text-lg font-medium text-gray-900">Withdrawal Requests</h2>

          {/* Search */}
          <div className="relative max-w-xs w-full">
            <input
              type="text"
              placeholder="Search by phone, email..."
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
            All Requests
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
            onClick={() => setActiveTab('rejected')}
            className={`px-6 py-3 text-sm font-medium whitespace-nowrap ${
              activeTab === 'rejected'
                ? 'text-indigo-600 border-b-2 border-indigo-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Rejected
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="p-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <h3 className="text-sm font-medium text-red-800">Error Loading Withdrawals</h3>
                  <p className="text-sm text-red-700 mt-1">{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Table */}
        {!loading && !error && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Phone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    M-Pesa Transaction
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date Requested
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {withdrawals.map((withdrawal) => (
                  <tr key={withdrawal.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {withdrawal.user?.displayName ||
                          `${withdrawal.user?.firstName} ${withdrawal.user?.lastName}` ||
                          'N/A'}
                      </div>
                      {withdrawal.user?.email && (
                        <div className="text-sm text-gray-500">{withdrawal.user.email}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {withdrawal.phone}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                      KSh {withdrawal.amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {withdrawal.mpesaTransactionId || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(withdrawal.createdAt).toLocaleDateString()}
                      <div className="text-xs text-gray-400">
                        {new Date(withdrawal.createdAt).toLocaleTimeString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          withdrawal.status === 'COMPLETED'
                            ? 'bg-green-100 text-green-800'
                            : withdrawal.status === 'PENDING'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {withdrawal.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {withdrawal.status === 'PENDING' && (
                        <button
                          onClick={() => handleProcessClick(withdrawal)}
                          disabled={processingId === withdrawal.id}
                          className="text-indigo-600 hover:text-indigo-900 disabled:opacity-50"
                        >
                          Process
                        </button>
                      )}
                      {withdrawal.status !== 'PENDING' && (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && withdrawals.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No withdrawal requests found</p>
          </div>
        )}

        {/* Pagination */}
        {!loading && !error && withdrawals.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-gray-500">
              Showing <span className="font-medium">{((pagination.page - 1) * pagination.limit) + 1}</span> to{' '}
              <span className="font-medium">{Math.min(pagination.page * pagination.limit, pagination.total)}</span> of{' '}
              <span className="font-medium">{pagination.total}</span> requests
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-500 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Previous
              </button>
              {Array.from({ length: Math.min(pagination.totalPages, 5) }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-1 border border-gray-300 rounded-md text-sm ${
                    currentPage === page
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === pagination.totalPages}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-500 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Process Withdrawal Modal */}
      {showProcessModal && selectedWithdrawal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-100">
              <h3 className="text-lg font-medium text-gray-900">Process Withdrawal</h3>
            </div>

            <div className="p-6">
              <div className="mb-4">
                <p className="text-sm text-gray-600">User</p>
                <p className="text-lg font-medium text-gray-900">
                  {selectedWithdrawal.user?.displayName ||
                    `${selectedWithdrawal.user?.firstName} ${selectedWithdrawal.user?.lastName}` ||
                    'N/A'}
                </p>
              </div>

              <div className="mb-4">
                <p className="text-sm text-gray-600">Phone Number</p>
                <p className="text-lg font-medium text-gray-900">{selectedWithdrawal.phone}</p>
              </div>

              <div className="mb-4">
                <p className="text-sm text-gray-600">Amount</p>
                <p className="text-2xl font-bold text-gray-900">
                  KSh {selectedWithdrawal.amount.toLocaleString()}
                </p>
              </div>

              <div className="mb-6">
                <label htmlFor="mpesa-txn" className="block text-sm font-medium text-gray-700 mb-2">
                  M-Pesa Transaction ID (Optional)
                </label>
                <input
                  id="mpesa-txn"
                  type="text"
                  value={mpesaTransactionId}
                  onChange={(e) => setMpesaTransactionId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder="Enter M-Pesa transaction ID"
                />
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowProcessModal(false);
                    setSelectedWithdrawal(null);
                    setMpesaTransactionId('');
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                  disabled={!!processingId}
                >
                  Cancel
                </button>
                <button
                  onClick={handleRejectWithdrawal}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center"
                  disabled={!!processingId}
                >
                  <X className="h-4 w-4 mr-1" />
                  Reject
                </button>
                <button
                  onClick={handleApproveWithdrawal}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center"
                  disabled={!!processingId}
                >
                  <Check className="h-4 w-4 mr-1" />
                  {processingId ? 'Processing...' : 'Approve & Pay'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
