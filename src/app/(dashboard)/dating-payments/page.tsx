'use client';

import { useState } from 'react';
import Link from 'next/link';
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
    Info,
    ChevronDown,
    User,
    Heart,
    RefreshCw,
    AlertCircle,
    Zap
} from 'lucide-react';

export default function DatingPaymentsPage() {
    const [activeTab, setActiveTab] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedPayment, setExpandedPayment] = useState<number | null>(null);
    const [showRefundModal, setShowRefundModal] = useState(false);
    const [selectedPayment, setSelectedPayment] = useState<any>(null);

    // Constants
    const SIGNUP_FEE = 500; // Standard signup amount in KSh
    const PREMIUM_SUBSCRIPTION = 1500; // Monthly premium subscription
    const BOOST_FEE = 300; // Profile boost fee

    // Mock data - in a real app, you'd fetch this from your API
    const stats = {
        totalSignups: 12476,
        signupsRevenue: 6238000,
        totalSubscriptions: 3845,
        subscriptionsRevenue: 5767500,
        todaySignups: 74,
        todayRevenue: 59200,
        growthRate: 8
    };

    const payments = [
        {
            id: 1,
            userId: 1234,
            userName: 'Jessica K',
            email: 'jessica@example.com',
            phone: '254712345678',
            userImage: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300',
            amount: SIGNUP_FEE,
            type: 'signup',
            date: '2025-10-21 14:32',
            status: 'completed',
            paymentMethod: 'M-Pesa',
            transactionId: 'SP123456789',
            ip: '41.204.187.xxx',
            device: 'iPhone 15, Safari',
            location: 'Nairobi, Kenya'
        },
        {
            id: 2,
            userId: 2345,
            userName: 'Michael S',
            email: 'michael@example.com',
            phone: '254723456789',
            userImage: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=300',
            amount: PREMIUM_SUBSCRIPTION,
            type: 'premium',
            date: '2025-10-21 13:21',
            status: 'completed',
            paymentMethod: 'M-Pesa',
            transactionId: 'PM234567890',
            ip: '41.204.188.xxx',
            device: 'Samsung Galaxy S30, Chrome',
            location: 'Nairobi, Kenya'
        },
        {
            id: 3,
            userId: 3456,
            userName: 'Sophia W',
            email: 'sophia@example.com',
            phone: '254734567890',
            userImage: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=300',
            amount: SIGNUP_FEE,
            type: 'signup',
            date: '2025-10-21 12:45',
            status: 'pending',
            paymentMethod: 'M-Pesa',
            transactionId: 'SP345678901',
            ip: '41.215.245.xxx',
            device: 'Tecno Spark 20, Chrome',
            location: 'Mombasa, Kenya'
        },
        {
            id: 4,
            userId: 4567,
            userName: 'David M',
            email: 'david@example.com',
            phone: '254745678901',
            userImage: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=300',
            amount: BOOST_FEE,
            type: 'boost',
            date: '2025-10-21 11:12',
            status: 'completed',
            paymentMethod: 'M-Pesa',
            transactionId: 'BO456789012',
            ip: '41.204.190.xxx',
            device: 'MacBook Air, Chrome',
            location: 'Nairobi, Kenya'
        },
        {
            id: 5,
            userId: 5678,
            userName: 'Emily T',
            email: 'emily@example.com',
            phone: '254756789012',
            userImage: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300',
            amount: SIGNUP_FEE,
            type: 'signup',
            date: '2025-10-21 10:48',
            status: 'failed',
            paymentMethod: 'M-Pesa',
            transactionId: 'SP567890123',
            ip: '105.160.23.xxx',
            device: 'Android 16, Chrome',
            location: 'Nakuru, Kenya'
        },
        {
            id: 6,
            userId: 6789,
            userName: 'James N',
            email: 'james@example.com',
            phone: '254767890123',
            userImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300',
            amount: PREMIUM_SUBSCRIPTION,
            type: 'premium',
            date: '2025-10-21 09:30',
            status: 'completed',
            paymentMethod: 'Credit Card',
            transactionId: 'PM678901234',
            ip: '41.204.192.xxx',
            device: 'iPhone 15 Pro, Safari',
            location: 'Nairobi, Kenya'
        },
        {
            id: 7,
            userId: 7890,
            userName: 'Lily R',
            email: 'lily@example.com',
            phone: '254778901234',
            userImage: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300',
            amount: PREMIUM_SUBSCRIPTION,
            type: 'premium-renewal',
            date: '2025-10-21 08:22',
            status: 'completed',
            paymentMethod: 'M-Pesa',
            transactionId: 'PR789012345',
            ip: '41.215.247.xxx',
            device: 'Xiaomi Redmi Note 13, Chrome',
            location: 'Mombasa, Kenya'
        }
    ];

    // Filter payments based on active tab and search query
    const filteredPayments = payments
        .filter(payment => {
            if (activeTab === 'all') return true;
            if (activeTab === 'signup') return payment.type === 'signup';
            if (activeTab === 'premium') return payment.type === 'premium' || payment.type === 'premium-renewal';
            if (activeTab === 'boost') return payment.type === 'boost';
            if (activeTab === 'completed') return payment.status === 'completed';
            if (activeTab === 'pending') return payment.status === 'pending';
            if (activeTab === 'failed') return payment.status === 'failed';
            return true;
        })
        .filter(payment => {
            if (!searchQuery) return true;
            const query = searchQuery.toLowerCase();
            return (
                payment.userName.toLowerCase().includes(query) ||
                payment.email.toLowerCase().includes(query) ||
                payment.phone.includes(query) ||
                payment.transactionId.toLowerCase().includes(query)
            );
        });

    const togglePaymentDetails = (id: number) => {
        setExpandedPayment(expandedPayment === id ? null : id);
    };

    const handleRefund = (payment: any) => {
        setSelectedPayment(payment);
        setShowRefundModal(true);
    };

    const processRefund = () => {
        // In a real app, you would make an API call here
        console.log('Processing refund for payment ID:', selectedPayment?.id);
        setShowRefundModal(false);
        // Then refresh data
    };

    const getPaymentTypeIcon = (type: string) => {
        switch (type) {
            case 'signup':
                return <User className="h-4 w-4 text-blue-500" />;
            case 'premium':
            case 'premium-renewal':
                return <Heart className="h-4 w-4 text-pink-500" />;
            case 'boost':
                return <Zap className="h-4 w-4 text-amber-500" />;
            default:
                return <CreditCard className="h-4 w-4 text-gray-500" />;
        }
    };

    const getPaymentTypeLabel = (type: string) => {
        switch (type) {
            case 'signup':
                return 'Signup Fee';
            case 'premium':
                return 'Premium Subscription';
            case 'premium-renewal':
                return 'Premium Renewal';
            case 'boost':
                return 'Profile Boost';
            default:
                return 'Payment';
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
                            <p className="text-sm font-medium text-gray-500">Signup Revenue</p>
                            <p className="text-2xl font-bold text-gray-900 mt-2">KSh {stats.signupsRevenue.toLocaleString()}</p>
                            <p className="text-xs text-gray-500 mt-1">{stats.totalSignups.toLocaleString()} users</p>
                        </div>
                        <div className="bg-blue-100 p-3 rounded-lg">
                            <User className="h-6 w-6 text-blue-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Premium Revenue</p>
                            <p className="text-2xl font-bold text-gray-900 mt-2">KSh {stats.subscriptionsRevenue.toLocaleString()}</p>
                            <p className="text-xs text-gray-500 mt-1">{stats.totalSubscriptions.toLocaleString()} subscribers</p>
                        </div>
                        <div className="bg-pink-100 p-3 rounded-lg">
                            <Heart className="h-6 w-6 text-pink-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Today's Revenue</p>
                            <p className="text-2xl font-bold text-gray-900 mt-2">KSh {stats.todayRevenue.toLocaleString()}</p>
                            <div className="flex items-center text-green-500 text-xs mt-1">
                                <TrendingUp className="h-3 w-3 mr-1" />
                                <span>{stats.growthRate}% increase</span>
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
                            <p className="text-sm font-medium text-gray-500">New Signups Today</p>
                            <p className="text-2xl font-bold text-gray-900 mt-2">{stats.todaySignups}</p>
                            <p className="text-xs text-gray-500 mt-1">{SIGNUP_FEE} KSh per signup</p>
                        </div>
                        <div className="bg-purple-100 p-3 rounded-lg">
                            <CreditCard className="h-6 w-6 text-purple-600" />
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
                        onClick={() => setActiveTab('signup')}
                        className={`px-6 py-3 text-sm font-medium whitespace-nowrap flex items-center ${activeTab === 'signup'
                            ? 'text-indigo-600 border-b-2 border-indigo-600'
                            : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        <User className="h-4 w-4 mr-1" />
                        Signup Fees
                    </button>
                    <button
                        onClick={() => setActiveTab('premium')}
                        className={`px-6 py-3 text-sm font-medium whitespace-nowrap flex items-center ${activeTab === 'premium'
                            ? 'text-indigo-600 border-b-2 border-indigo-600'
                            : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        <Heart className="h-4 w-4 mr-1" />
                        Premium
                    </button>
                    <button
                        onClick={() => setActiveTab('boost')}
                        className={`px-6 py-3 text-sm font-medium whitespace-nowrap flex items-center ${activeTab === 'boost'
                            ? 'text-indigo-600 border-b-2 border-indigo-600'
                            : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        <Zap className="h-4 w-4 mr-1" />
                        Boosts
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
                </div>

                {/* Payments */}
                <div className="divide-y divide-gray-100">
                    {filteredPayments.map((payment) => (
                        <div key={payment.id} className="hover:bg-gray-50">
                            <div
                                className="p-4 sm:px-6 cursor-pointer"
                                onClick={() => togglePaymentDetails(payment.id)}
                            >
                                <div className="flex flex-col sm:flex-row justify-between">
                                    <div className="flex items-center">
                                        {/* User */}
                                        <div className="flex-shrink-0 mr-4">
                                            <img
                                                src={payment.userImage}
                                                alt={payment.userName}
                                                className="h-10 w-10 rounded-full object-cover"
                                            />
                                        </div>

                                        {/* User Details */}
                                        <div>
                                            <div className="text-sm font-medium text-gray-900 flex items-center">
                                                {payment.userName}
                                                <div className="ml-2 flex items-center">
                                                    {getPaymentTypeIcon(payment.type)}
                                                    <span className="ml-1 text-xs text-gray-600">{getPaymentTypeLabel(payment.type)}</span>
                                                </div>
                                            </div>
                                            <div className="text-xs text-gray-500 mt-0.5">
                                                {payment.email} • {payment.phone}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right Side */}
                                    <div className="flex items-center mt-3 sm:mt-0">
                                        {/* Date */}
                                        <div className="text-xs text-gray-500 mr-4 flex items-center">
                                            <Clock className="h-3.5 w-3.5 mr-1 text-gray-400" />
                                            {payment.date}
                                        </div>

                                        {/* Amount */}
                                        <div className="font-medium text-gray-900 mr-4">
                                            KSh {payment.amount}
                                        </div>

                                        {/* Status */}
                                        <div>
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${payment.status === 'completed'
                                                ? 'bg-green-100 text-green-800'
                                                : payment.status === 'pending'
                                                    ? 'bg-yellow-100 text-yellow-800'
                                                    : 'bg-red-100 text-red-800'
                                                }`}>
                                                {payment.status}
                                            </span>
                                        </div>

                                        {/* Dropdown Indicator */}
                                        <ChevronDown
                                            className={`h-5 w-5 ml-4 text-gray-400 transition-transform ${expandedPayment === payment.id ? 'transform rotate-180' : ''
                                                }`}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Expanded Details */}
                            {expandedPayment === payment.id && (
                                <div className="px-4 pb-4 sm:px-6 bg-gray-50 border-t border-gray-100 animate-fadeIn">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                                        <div>
                                            <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                                                Payment Details
                                            </h4>
                                            <dl className="grid grid-cols-2 gap-x-4 gap-y-2">
                                                <dt className="text-sm text-gray-500">Payment Type</dt>
                                                <dd className="text-sm font-medium text-gray-900">{getPaymentTypeLabel(payment.type)}</dd>

                                                <dt className="text-sm text-gray-500">Transaction ID</dt>
                                                <dd className="text-sm font-medium text-gray-900">{payment.transactionId}</dd>

                                                <dt className="text-sm text-gray-500">Payment Method</dt>
                                                <dd className="text-sm font-medium text-gray-900">{payment.paymentMethod}</dd>

                                                <dt className="text-sm text-gray-500">Amount</dt>
                                                <dd className="text-sm font-medium text-gray-900">KSh {payment.amount}</dd>

                                                <dt className="text-sm text-gray-500">Date & Time</dt>
                                                <dd className="text-sm font-medium text-gray-900">{payment.date}</dd>
                                            </dl>
                                        </div>

                                        <div>
                                            <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                                                User Information
                                            </h4>
                                            <dl className="grid grid-cols-2 gap-x-4 gap-y-2">
                                                <dt className="text-sm text-gray-500">User ID</dt>
                                                <dd className="text-sm font-medium text-gray-900">{payment.userId}</dd>

                                                <dt className="text-sm text-gray-500">Full Name</dt>
                                                <dd className="text-sm font-medium text-gray-900">{payment.userName}</dd>

                                                <dt className="text-sm text-gray-500">Email</dt>
                                                <dd className="text-sm font-medium text-gray-900">{payment.email}</dd>

                                                <dt className="text-sm text-gray-500">Phone</dt>
                                                <dd className="text-sm font-medium text-gray-900">{payment.phone}</dd>

                                                <dt className="text-sm text-gray-500">IP Address</dt>
                                                <dd className="text-sm font-medium text-gray-900">{payment.ip}</dd>

                                                <dt className="text-sm text-gray-500">Device</dt>
                                                <dd className="text-sm font-medium text-gray-900">{payment.device}</dd>
                                            </dl>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="mt-4 flex justify-end space-x-3">
                                        <Link href={`/dating-payments/${payment.id}`}>
                                            <button className="text-indigo-600 hover:text-indigo-900 text-sm font-medium">
                                                View Full Details
                                            </button>
                                        </Link>
                                        {payment.status === 'pending' && (
                                            <button
                                                className="text-green-600 hover:text-green-900 text-sm font-medium flex items-center"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    // In a real app, this would call an API to update the status
                                                    console.log('Manually approving payment:', payment.id);
                                                }}
                                            >
                                                <Check className="h-4 w-4 mr-1" />
                                                Approve Payment
                                            </button>
                                        )}
                                        {payment.status === 'completed' && payment.date.includes('2025-10-21') && (
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
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Empty state */}
                {filteredPayments.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-gray-500">No payments found matching your criteria</p>
                    </div>
                )}

                {/* Pagination */}
                <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                    <div className="text-sm text-gray-500">
                        Showing <span className="font-medium">{filteredPayments.length}</span> payments
                    </div>
                    <div className="flex gap-2">
                        <button className="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-500">
                            Previous
                        </button>
                        <button className="px-3 py-1 bg-gray-100 border border-gray-300 rounded-md text-sm text-gray-800">
                            1
                        </button>
                        <button className="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-500">
                            Next
                        </button>
                    </div>
                </div>
            </div>

            {/* Pricing Card */}
            <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Dating Service Pricing</h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center">
                            <div className="bg-blue-100 p-3 rounded-full mr-4">
                                <User className="h-6 w-6 text-blue-600" />
                            </div>
                            <div>
                                <h4 className="text-lg font-medium text-gray-900">Signup Fee</h4>
                                <p className="text-3xl font-bold text-gray-900 mt-1">KSh {SIGNUP_FEE}</p>
                            </div>
                        </div>
                        <p className="text-sm text-gray-500 mt-4">
                            One-time payment required to complete profile setup and begin using the dating platform.
                        </p>
                    </div>

                    <div className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center">
                            <div className="bg-pink-100 p-3 rounded-full mr-4">
                                <Heart className="h-6 w-6 text-pink-600" />
                            </div>
                            <div>
                                <h4 className="text-lg font-medium text-gray-900">Premium</h4>
                                <p className="text-3xl font-bold text-gray-900 mt-1">KSh {PREMIUM_SUBSCRIPTION}</p>
                                <span className="text-xs text-gray-500">per month</span>
                            </div>
                        </div>
                        <p className="text-sm text-gray-500 mt-4">
                            Monthly subscription that provides unlimited messaging, profile highlights, and advanced search filters.
                        </p>
                    </div>

                    <div className="border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center">
                            <div className="bg-amber-100 p-3 rounded-full mr-4">
                                <Zap className="h-6 w-6 text-amber-600" />
                            </div>
                            <div>
                                <h4 className="text-lg font-medium text-gray-900">Profile Boost</h4>
                                <p className="text-3xl font-bold text-gray-900 mt-1">KSh {BOOST_FEE}</p>
                                <span className="text-xs text-gray-500">per boost</span>
                            </div>
                        </div>
                        <p className="text-sm text-gray-500 mt-4">
                            Temporarily increases profile visibility in search results and discovery for 24 hours.
                        </p>
                    </div>
                </div>
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
                            <div className="mb-6 flex items-center">
                                <img
                                    src={selectedPayment.userImage}
                                    alt={selectedPayment.userName}
                                    className="h-12 w-12 rounded-full mr-4"
                                />
                                <div>
                                    <p className="text-lg font-medium text-gray-900">{selectedPayment.userName}</p>
                                    <p className="text-sm text-gray-600">{selectedPayment.email} • {selectedPayment.phone}</p>
                                </div>
                            </div>  <div className="bg-red-50 border border-red-100 rounded-lg p-4 mb-6">
                                <div className="flex items-start">
                                    <div className="flex-shrink-0">
                                        <AlertCircle className="h-5 w-5 text-red-600" />
                                    </div>
                                    <div className="ml-3">
                                        <h3 className="text-sm font-medium text-red-800">Refund Warning</h3>
                                        <div className="mt-2 text-sm text-red-700">
                                            <p>You are about to process a refund for this payment. This action cannot be undone and will:</p>
                                            <ul className="list-disc list-inside mt-2 space-y-1">
                                                <li>Return KSh {selectedPayment.amount} to the user's payment method</li>
                                                <li>Cancel any associated service or subscription benefits</li>
                                                <li>Create a record of this refund in the payment history</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>  <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Refund Reason
                                </label>
                                <select
                                    className="w-full border border-gray-300 rounded-lg py-2 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    defaultValue="request"
                                >
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
                                    className="w-full border border-gray-300 rounded-lg py-2 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    rows={3}
                                    placeholder="Enter any additional information about this refund..."
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