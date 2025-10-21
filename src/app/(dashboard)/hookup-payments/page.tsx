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
  Phone,
  Check,
  X,
  Info,
  ChevronDown,
  User,
  Eye
} from 'lucide-react';

export default function HookupPaymentsPage() {
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedPayment, setExpandedPayment] = useState<number | null>(null);
  
  // Constants
  const UNLOCK_AMOUNT = 300; // Standard unlock amount in KSh
  
  // Mock data - in a real app, you'd fetch this from your API
  const stats = {
    totalPayments: 3526,
    totalRevenue: 1057800,
    todayPayments: 87,
    todayRevenue: 26100,
    growthRate: 8,
    averageConversion: 43
  };

  const payments = [
    { 
      id: 1, 
      phoneNumber: '254712345678',
      profileUnlocked: 'Jasmine',
      profileId: 101,
      profileImage: 'https://randomuser.me/api/portraits/women/32.jpg',
      amount: UNLOCK_AMOUNT, 
      date: '2025-10-21 14:32', 
      status: 'completed',
      paymentMethod: 'M-Pesa',
      transactionId: 'QLJ2MQZP5R',
      userId: null, // Anonymous user
      userName: null,
      userImage: null,
      ip: '41.204.187.xxx',
      device: 'iPhone 15, Safari',
      location: 'Nairobi, Kenya'
    },
    { 
      id: 2, 
      phoneNumber: '254723456789',
      profileUnlocked: 'Sophia',
      profileId: 102,
      profileImage: 'https://randomuser.me/api/portraits/women/43.jpg',
      amount: UNLOCK_AMOUNT, 
      date: '2025-10-21 13:21', 
      status: 'completed',
      paymentMethod: 'M-Pesa',
      transactionId: 'QLJ3NR2T8S',
      userId: 2045, // Registered user
      userName: 'David M.',
      userImage: 'https://randomuser.me/api/portraits/men/68.jpg',
      ip: '41.204.188.xxx',
      device: 'Samsung Galaxy S30, Chrome',
      location: 'Nairobi, Kenya'
    },
    { 
      id: 3, 
      phoneNumber: '254734567890',
      profileUnlocked: 'Zara',
      profileId: 103,
      profileImage: 'https://randomuser.me/api/portraits/women/68.jpg',
      amount: UNLOCK_AMOUNT, 
      date: '2025-10-21 12:45', 
      status: 'pending',
      paymentMethod: 'M-Pesa',
      transactionId: 'QLJ4PS3U9T',
      userId: null, // Anonymous user
      userName: null,
      userImage: null,
      ip: '41.215.245.xxx',
      device: 'Tecno Spark 20, Chrome',
      location: 'Mombasa, Kenya'
    },
    { 
      id: 4, 
      phoneNumber: '254745678901',
      profileUnlocked: 'Leo',
      profileId: 104,
      profileImage: 'https://randomuser.me/api/portraits/men/33.jpg',
      amount: UNLOCK_AMOUNT, 
      date: '2025-10-21 11:12', 
      status: 'completed',
      paymentMethod: 'M-Pesa',
      transactionId: 'QLJ5QT4V0U',
      userId: 1856, // Registered user
      userName: 'Sarah W.',
      userImage: 'https://randomuser.me/api/portraits/women/22.jpg',
      ip: '41.204.190.xxx',
      device: 'MacBook Air, Chrome',
      location: 'Nairobi, Kenya'
    },
    { 
      id: 5, 
      phoneNumber: '254756789012',
      profileUnlocked: 'Maya',
      profileId: 105,
      profileImage: 'https://randomuser.me/api/portraits/women/28.jpg',
      amount: UNLOCK_AMOUNT, 
      date: '2025-10-21 10:48', 
      status: 'failed',
      paymentMethod: 'M-Pesa',
      transactionId: 'QLJ6RU5W1V',
      userId: null, // Anonymous user
      userName: null,
      userImage: null,
      ip: '105.160.23.xxx',
      device: 'Android 16, Chrome',
      location: 'Nakuru, Kenya'
    },
    { 
      id: 6, 
      phoneNumber: '254767890123',
      profileUnlocked: 'Ethan',
      profileId: 106,
      profileImage: 'https://randomuser.me/api/portraits/men/22.jpg',
      amount: UNLOCK_AMOUNT, 
      date: '2025-10-21 09:30', 
      status: 'completed',
      paymentMethod: 'M-Pesa',
      transactionId: 'QLJ7SV6X2W',
      userId: 2233, // Registered user
      userName: 'Nina K.',
      userImage: 'https://randomuser.me/api/portraits/women/55.jpg',
      ip: '41.204.192.xxx',
      device: 'iPhone 15 Pro, Safari',
      location: 'Nairobi, Kenya'
    },
    { 
      id: 7, 
      phoneNumber: '254778901234',
      profileUnlocked: 'Amara',
      profileId: 107,
      profileImage: 'https://randomuser.me/api/portraits/women/22.jpg',
      amount: UNLOCK_AMOUNT, 
      date: '2025-10-21 08:22', 
      status: 'completed',
      paymentMethod: 'M-Pesa',
      transactionId: 'QLJ8TW7Y3X',
      userId: null, // Anonymous user
      userName: null,
      userImage: null,
      ip: '41.215.247.xxx',
      device: 'Xiaomi Redmi Note 13, Chrome',
      location: 'Mombasa, Kenya'
    }
  ];

  // Filter payments based on active tab and search query
  const filteredPayments = payments
    .filter(payment => {
      if (activeTab === 'all') return true;
      if (activeTab === 'completed') return payment.status === 'completed';
      if (activeTab === 'pending') return payment.status === 'pending';
      if (activeTab === 'failed') return payment.status === 'failed';
      if (activeTab === 'anonymous') return payment.userId === null;
      if (activeTab === 'registered') return payment.userId !== null;
      return true;
    })
    .filter(payment => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return (
        payment.phoneNumber.includes(query) ||
        payment.profileUnlocked.toLowerCase().includes(query) ||
        payment.transactionId.toLowerCase().includes(query) ||
        (payment.userName && payment.userName.toLowerCase().includes(query))
      );
    });

  const togglePaymentDetails = (id: number) => {
    setExpandedPayment(expandedPayment === id ? null : id);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Hookup Unlock Payments</h1>
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
              <p className="text-2xl font-bold text-gray-900 mt-2">KSh {stats.totalRevenue.toLocaleString()}</p>
              <p className="text-xs text-gray-500 mt-1">{stats.totalPayments.toLocaleString()} total unlocks</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <CreditCard className="h-6 w-6 text-blue-600" />
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
              <p className="text-sm font-medium text-gray-500">Unlocks Today</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{stats.todayPayments}</p>
              <p className="text-xs text-gray-500 mt-1">{UNLOCK_AMOUNT} KSh per unlock</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <Phone className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Conversion Rate</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{stats.averageConversion}%</p>
              <p className="text-xs text-gray-500 mt-1">Profile views to unlocks</p>
            </div>
            <div className="bg-amber-100 p-3 rounded-lg">
              <Eye className="h-6 w-6 text-amber-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Payments List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <h2 className="text-lg font-medium text-gray-900">Contact Unlock Payments</h2>
          
          {/* Search */}
          <div className="relative max-w-xs w-full">
            <input
              type="text"
              placeholder="Search phone, profile, transaction..."
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
          <button
            onClick={() => setActiveTab('anonymous')}
            className={`px-6 py-3 text-sm font-medium whitespace-nowrap ${
              activeTab === 'anonymous'
                ? 'text-indigo-600 border-b-2 border-indigo-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Anonymous Users
          </button>
          <button
            onClick={() => setActiveTab('registered')}
            className={`px-6 py-3 text-sm font-medium whitespace-nowrap ${
              activeTab === 'registered'
                ? 'text-indigo-600 border-b-2 border-indigo-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Registered Users
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
                    {/* Unlocked Profile */}
                    <div className="flex-shrink-0 mr-4">
                      <div className="relative">
                        <img 
                          src={payment.profileImage} 
                          alt={payment.profileUnlocked} 
                          className="h-10 w-10 rounded-full object-cover"
                        />
                        <div className="absolute -bottom-1 -right-1 h-5 w-5 rounded-full bg-white flex items-center justify-center shadow">
                          <Phone className="h-3 w-3 text-indigo-600" />
                        </div>
                      </div>
                    </div>
                    
                    {/* Payment Details */}
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {payment.phoneNumber} unlocked {payment.profileUnlocked}
                      </div>
                      <div className="text-sm text-gray-500 mt-0.5 flex items-center">
                        <Clock className="h-3.5 w-3.5 mr-1 text-gray-400" />
                        {payment.date}
                      </div>
                    </div>
                  </div>

                  {/* Right Side */}
                  <div className="flex items-center mt-3 sm:mt-0">
                    {/* User Info */}
                    {payment.userId ? (
                      <div className="flex items-center mr-4">
                        <img 
                          src={payment.userImage!} 
                          alt={payment.userName!} 
                          className="h-6 w-6 rounded-full object-cover mr-2" 
                        />
                        <span className="text-sm text-gray-600">{payment.userName}</span>
                      </div>
                    ) : (
                      <div className="flex items-center mr-4">
                        <User className="h-5 w-5 text-gray-400 mr-1" />
                        <span className="text-sm text-gray-500">Anonymous</span>
                      </div>
                    )}
                    
                    {/* Amount */}
                    <div className="font-medium text-gray-900 mr-4">
                      KSh {payment.amount}
                    </div>
                    
                    {/* Status */}
                    <div>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        payment.status === 'completed' 
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
                      className={`h-5 w-5 ml-4 text-gray-400 transition-transform ${
                        expandedPayment === payment.id ? 'transform rotate-180' : ''
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
                        <dt className="text-sm text-gray-500">Transaction ID</dt>
                        <dd className="text-sm font-medium text-gray-900">{payment.transactionId}</dd>
                        
                        <dt className="text-sm text-gray-500">Payment Method</dt>
                        <dd className="text-sm font-medium text-gray-900">{payment.paymentMethod}</dd>
                        
                        <dt className="text-sm text-gray-500">Phone Number</dt>
                        <dd className="text-sm font-medium text-gray-900">{payment.phoneNumber}</dd>
                        
                        <dt className="text-sm text-gray-500">Date & Time</dt>
                        <dd className="text-sm font-medium text-gray-900">{payment.date}</dd>
                      </dl>
                    </div>
                    
                    <div>
                      <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                        User Information
                      </h4>
                      <dl className="grid grid-cols-2 gap-x-4 gap-y-2">
                        <dt className="text-sm text-gray-500">User Type</dt>
                        <dd className="text-sm font-medium text-gray-900">
                          {payment.userId ? 'Registered' : 'Anonymous'}
                        </dd>
                        
                        {payment.userId && (
                          <>
                            <dt className="text-sm text-gray-500">User ID</dt>
                            <dd className="text-sm font-medium text-gray-900">{payment.userId}</dd>
                            
                            <dt className="text-sm text-gray-500">User Name</dt>
                            <dd className="text-sm font-medium text-gray-900">{payment.userName}</dd>
                          </>
                        )}
                        
                        <dt className="text-sm text-gray-500">IP Address</dt>
                        <dd className="text-sm font-medium text-gray-900">{payment.ip}</dd>
                        
                        <dt className="text-sm text-gray-500">Device</dt>
                        <dd className="text-sm font-medium text-gray-900">{payment.device}</dd>
                        
                        <dt className="text-sm text-gray-500">Location</dt>
                        <dd className="text-sm font-medium text-gray-900">{payment.location}</dd>
                      </dl>
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="mt-4 flex justify-end space-x-3">
                    <Link href={`/hookup-payments/${payment.id}`}>
                      <button className="text-indigo-600 hover:text-indigo-900 text-sm font-medium">
                        View Full Details
                      </button>
                    </Link>
                    {payment.status === 'pending' && (
                      <button className="text-green-600 hover:text-green-900 text-sm font-medium flex items-center">
                        <Check className="h-4 w-4 mr-1" />
                        Mark as Completed
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

      {/* Info Card */}
      <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <Info className="h-5 w-5 text-blue-400" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">About Contact Unlocks</h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>Users can unlock escort contact information for KSh {UNLOCK_AMOUNT} per profile. This payment can be made without requiring a user account - just the user's M-Pesa phone number. The payment flow is:</p>
              <ol className="list-decimal list-inside mt-2 space-y-1">
                <li>User clicks "Unlock Contact" on an escort profile</li>
                <li>User enters their phone number to receive an M-Pesa payment prompt</li>
                <li>After successful payment, the escort's contact information is revealed</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}