'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { adminService, handleApiError } from '@/lib/api';
import type { Payment } from '@/types/api';
import {
    Search,
    Filter,
    Download,
    Calendar,
    CreditCard,
    TrendingUp,
    Clock,
    Check,
    X,
    ChevronDown,
    User as UserIcon,
    Heart,
    RefreshCw,
    AlertCircle,
    Zap
} from 'lucide-react';

export default function DatingPaymentsPage() {
    const [activeTab, setActiveTab] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedPayment, setExpandedPayment] = useState<string | null>(null);
    const [showRefundModal, setShowRefundModal] = useState(false);
    const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
    const [payments, setPayments] = useState<Payment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0
    });

    // Fetch payments from API
    useEffect(() => {
        fetchPayments();
    }, [currentPage, searchQuery, activeTab]);

    async function fetchPayments() {
        try {
            setLoading(true);
            setError(null);

            const params: any = {
                page: currentPage,
                limit: 20,
                search: searchQuery || undefined
            };

            // Add filter params based on active tab
            if (activeTab === 'subscription') params.type = 'DATING_SUBSCRIPTION';
            if (activeTab === 'completed') params.status = 'COMPLETED';
            if (activeTab === 'pending') params.status = 'PENDING';
            if (activeTab === 'failed') params.status = 'FAILED';
            if (activeTab === 'refunded') params.status = 'REFUNDED';

            const response = await adminService.getPayments(params);

            if (response.data) {
                setPayments(response.data);
            }

            if (response.pagination) {
                setPagination(response.pagination);
            }
        } catch (err) {
            setError(handleApiError(err));
            console.error('Error fetching payments:', err);
        } finally {
            setLoading(false);
        }
    }

    // Calculate stats from fetched payments
    const stats = {
        totalRevenue: payments.reduce((sum, p) => p.status === 'COMPLETED' ? sum + p.amount : sum, 0),
        totalPayments: pagination.total,
        completedPayments: payments.filter(p => p.status === 'COMPLETED').length,
        pendingPayments: payments.filter(p => p.status === 'PENDING').length
    };

    // Filter payments (client-side for tabs not handled by API)
    const filteredPayments = payments;

    const togglePaymentDetails = (id: string) => {
        setExpandedPayment(expandedPayment === id ? null : id);
    };

    const handleRefund = (payment: Payment) => {
        setSelectedPayment(payment);
        setShowRefundModal(true);
    };

    const processRefund = () => {
        console.log('Processing refund for payment ID:', selectedPayment?.id);
        setShowRefundModal(false);
        fetchPayments();
    };

    const getPaymentTypeLabel = (type: string) => {
        switch (type) {
            case 'DATING_SUBSCRIPTION':
                return 'Dating Subscription';
            case 'VIP_SUBSCRIPTION':
                return 'VIP Subscription';
            case 'UNLOCK_ESCORT':
                return 'Unlock Escort';
            case 'REFUND':
                return 'Refund';
            default:
                return type;
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-semibold">Dating Payments</h1>
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
                            <p className="text-xs text-gray-500 mt-1">From dating payments</p>
                        </div>
                        <div className="bg-green-100 p-3 rounded-lg">
                            <TrendingUp className="h-6 w-6 text-green-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Total Payments</p>
                            <p className="text-2xl font-bold text-gray-900 mt-2">{stats.totalPayments.toLocaleString()}</p>
                            <p className="text-xs text-gray-500 mt-1">All time</p>
                        </div>
                        <div className="bg-blue-100 p-3 rounded-lg">
                            <CreditCard className="h-6 w-6 text-blue-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Completed</p>
                            <p className="text-2xl font-bold text-gray-900 mt-2">{stats.completedPayments}</p>
                            <p className="text-xs text-gray-500 mt-1">Successful transactions</p>
                        </div>
                        <div className="bg-green-100 p-3 rounded-lg">
                            <Check className="h-6 w-6 text-green-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Pending</p>
                            <p className="text-2xl font-bold text-gray-900 mt-2">{stats.pendingPayments}</p>
                            <p className="text-xs text-gray-500 mt-1">Awaiting confirmation</p>
                        </div>
                        <div className="bg-yellow-100 p-3 rounded-lg">
                            <Clock className="h-6 w-6 text-yellow-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Payments List */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                    <h2 className="text-lg font-medium text-gray-900">Payments History</h2>

                    {/* Search */}
                    <div className="relative max-w-xs w-full">
                        <input
                            type="text"
                            placeholder="Search user, email, transaction..."
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
                        className={`px-6 py-3 text-sm font-medium whitespace-nowrap ${activeTab === 'all'
                            ? 'text-indigo-600 border-b-2 border-indigo-600'
                            : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        All Payments
                    </button>
                    <button
                        onClick={() => setActiveTab('subscription')}
                        className={`px-6 py-3 text-sm font-medium whitespace-nowrap flex items-center ${activeTab === 'subscription'
                            ? 'text-indigo-600 border-b-2 border-indigo-600'
                            : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        <Heart className="h-4 w-4 mr-1" />
                        Subscriptions
                    </button>
                    <button
                        onClick={() => setActiveTab('completed')}
                        className={`px-6 py-3 text-sm font-medium whitespace-nowrap ${activeTab === 'completed'
                            ? 'text-indigo-600 border-b-2 border-indigo-600'
                            : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        Completed
                    </button>
                    <button
                        onClick={() => setActiveTab('pending')}
                        className={`px-6 py-3 text-sm font-medium whitespace-nowrap ${activeTab === 'pending'
                            ? 'text-indigo-600 border-b-2 border-indigo-600'
                            : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        Pending
                    </button>
                    <button
                        onClick={() => setActiveTab('failed')}
                        className={`px-6 py-3 text-sm font-medium whitespace-nowrap ${activeTab === 'failed'
                            ? 'text-indigo-600 border-b-2 border-indigo-600'
                            : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        Failed
                    </button>
                    <button
                        onClick={() => setActiveTab('refunded')}
                        className={`px-6 py-3 text-sm font-medium whitespace-nowrap ${activeTab === 'refunded'
                            ? 'text-indigo-600 border-b-2 border-indigo-600'
                            : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        Refunded
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
                                    <h3 className="text-sm font-medium text-red-800">Error Loading Payments</h3>
                                    <p className="text-sm text-red-700 mt-1">{error}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Payments */}
                {!loading && !error && (
                    <div className="divide-y divide-gray-100">
                        {filteredPayments.map((payment) => {
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
                                                {/* User Icon */}
                                                <div className="flex-shrink-0 mr-4">
                                                    <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                                                        <UserIcon className="h-5 w-5 text-indigo-600" />
                                                    </div>
                                                </div>

                                                {/* User Details */}
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900 flex items-center">
                                                        {userName}
                                                        <span className="ml-2 text-xs text-gray-600">{getPaymentTypeLabel(payment.type)}</span>
                                                    </div>
                                                    <div className="text-xs text-gray-500 mt-0.5">
                                                        {payment.user?.email || payment.phone}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Right Side */}
                                            <div className="flex items-center mt-3 sm:mt-0">
                                                {/* Date */}
                                                <div className="text-xs text-gray-500 mr-4 flex items-center">
                                                    <Clock className="h-3.5 w-3.5 mr-1 text-gray-400" />
                                                    {new Date(payment.createdAt).toLocaleDateString()}
                                                </div>

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
                                                                : payment.status === 'REFUNDED'
                                                                    ? 'bg-blue-100 text-blue-800'
                                                                    : 'bg-red-100 text-red-800'
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
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                                                <div>
                                                    <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                                                        Payment Details
                                                    </h4>
                                                    <dl className="grid grid-cols-2 gap-x-4 gap-y-2">
                                                        <dt className="text-sm text-gray-500">Payment Type</dt>
                                                        <dd className="text-sm font-medium text-gray-900">{getPaymentTypeLabel(payment.type)}</dd>

                                                        {payment.mpesaReceiptNumber && (
                                                            <>
                                                                <dt className="text-sm text-gray-500">M-Pesa Receipt</dt>
                                                                <dd className="text-sm font-medium text-gray-900">{payment.mpesaReceiptNumber}</dd>
                                                            </>
                                                        )}

                                                        {payment.mpesaTransactionId && (
                                                            <>
                                                                <dt className="text-sm text-gray-500">Transaction ID</dt>
                                                                <dd className="text-sm font-medium text-gray-900">{payment.mpesaTransactionId}</dd>
                                                            </>
                                                        )}

                                                        <dt className="text-sm text-gray-500">Amount</dt>
                                                        <dd className="text-sm font-medium text-gray-900">KSh {payment.amount.toLocaleString()}</dd>

                                                        <dt className="text-sm text-gray-500">Date & Time</dt>
                                                        <dd className="text-sm font-medium text-gray-900">
                                                            {new Date(payment.createdAt).toLocaleString()}
                                                        </dd>

                                                        <dt className="text-sm text-gray-500">Status</dt>
                                                        <dd className="text-sm font-medium text-gray-900">{payment.status}</dd>
                                                    </dl>
                                                </div>

                                                <div>
                                                    <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                                                        User Information
                                                    </h4>
                                                    <dl className="grid grid-cols-2 gap-x-4 gap-y-2">
                                                        {payment.user && (
                                                            <>
                                                                <dt className="text-sm text-gray-500">User ID</dt>
                                                                <dd className="text-sm font-medium text-gray-900">{payment.user.id || payment.userId}</dd>

                                                                <dt className="text-sm text-gray-500">Name</dt>
                                                                <dd className="text-sm font-medium text-gray-900">{userName}</dd>

                                                                <dt className="text-sm text-gray-500">Email</dt>
                                                                <dd className="text-sm font-medium text-gray-900">{payment.user.email}</dd>
                                                            </>
                                                        )}

                                                        <dt className="text-sm text-gray-500">Phone</dt>
                                                        <dd className="text-sm font-medium text-gray-900">{payment.phone}</dd>
                                                    </dl>
                                                </div>
                                            </div>

                                            {/* Actions */}
                                            {payment.status === 'COMPLETED' && (
                                                <div className="mt-4 flex justify-end">
                                                    <button
                                                        className="text-red-600 hover:text-red-900 text-sm font-medium flex items-center"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleRefund(payment);
                                                        }}
                                                    >
                                                        <RefreshCw className="h-4 w-4 mr-1" />
                                                        Process Refund
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Empty state */}
                {!loading && !error && filteredPayments.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-gray-500">No payments found matching your criteria</p>
                    </div>
                )}

                {/* Pagination */}
                {!loading && !error && filteredPayments.length > 0 && (
                    <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                        <div className="text-sm text-gray-500">
                            Showing <span className="font-medium">{((pagination.page - 1) * pagination.limit) + 1}</span> to{' '}
                            <span className="font-medium">{Math.min(pagination.page * pagination.limit, pagination.total)}</span> of{' '}
                            <span className="font-medium">{pagination.total}</span> payments
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

            {/* Refund Modal */}
            {showRefundModal && selectedPayment && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg shadow-lg max-w-md w-full overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="text-lg font-medium text-gray-900">Process Refund</h3>
                            <button
                                onClick={() => setShowRefundModal(false)}
                                className="text-gray-400 hover:text-gray-500"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="p-6">
                            <div className="mb-6">
                                <p className="text-sm text-gray-600">Payment ID: {selectedPayment.id}</p>
                                <p className="text-lg font-medium text-gray-900 mt-1">KSh {selectedPayment.amount.toLocaleString()}</p>
                            </div>

                            <div className="bg-red-50 border border-red-100 rounded-lg p-4 mb-6">
                                <div className="flex items-start">
                                    <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                                    <div className="ml-3">
                                        <h3 className="text-sm font-medium text-red-800">Refund Warning</h3>
                                        <p className="text-sm text-red-700 mt-1">
                                            This action cannot be undone. The amount will be refunded to the user&apos;s payment method.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Refund Reason
                                </label>
                                <select className="w-full border border-gray-300 rounded-lg py-2 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                                    <option value="request">Customer Request</option>
                                    <option value="duplicate">Duplicate Payment</option>
                                    <option value="error">Processing Error</option>
                                    <option value="service">Service Issue</option>
                                    <option value="fraudulent">Fraudulent Transaction</option>
                                </select>
                            </div>

                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Additional Notes
                                </label>
                                <textarea
                                    className="w-full border border-gray-300 rounded-lg py-2 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    rows={3}
                                    placeholder="Enter any additional information..."
                                ></textarea>
                            </div>

                            <div className="flex justify-end gap-4">
                                <button
                                    onClick={() => setShowRefundModal(false)}
                                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={processRefund}
                                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center"
                                >
                                    <RefreshCw className="h-4 w-4 mr-2" />
                                    Process Refund
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
