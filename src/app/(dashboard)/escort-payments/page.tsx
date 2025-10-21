'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Search,
  Filter,
  Download,
  CheckCircle,
  XCircle,
  Calendar,
  CreditCard,
  TrendingUp,
  Star,
  Eye,
  Check,
  X,
  AlertCircle,
  Clock
} from 'lucide-react';

export default function HookupPaymentsPage() {
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  
  // Constants
  const VIP_AMOUNT = 3000; // Standard VIP payment amount in KSh
  
  // Mock data - in a real app, you'd fetch this from your API
  const stats = {
    totalHookupUsers: 7834,
    vipUsers: 1256,
    normalUsers: 6578,
    totalRevenue: 3768000,
    revenueThisMonth: 287000,
    growth: 12
  };

  const users = [
    { 
      id: 1, 
      name: 'James Kamau', 
      age: 28,
      location: 'Westlands, Nairobi',
      phone: '254712345678',
      email: 'james@example.com',
      photo: 'https://randomuser.me/api/portraits/men/32.jpg',
      isVip: true,
      joinDate: '2025-09-10',
      lastPaymentDate: '2025-10-15',
      paymentAmount: VIP_AMOUNT,
      paymentMethod: 'M-Pesa',
      transactionId: 'TRX1234567'
    },
    { 
      id: 2, 
      name: 'David Maina', 
      age: 32,
      location: 'Kilimani, Nairobi',
      phone: '254723456789',
      email: 'david@example.com',
      photo: 'https://randomuser.me/api/portraits/men/68.jpg',
      isVip: true,
      joinDate: '2025-09-15',
      lastPaymentDate: '2025-10-10',
      paymentAmount: VIP_AMOUNT,
      paymentMethod: 'M-Pesa',
      transactionId: 'TRX2345678'
    },
    { 
      id: 3, 
      name: 'Michael Omondi', 
      age: 25,
      location: 'Lavington, Nairobi',
      phone: '254734567890',
      email: 'michael@example.com',
      photo: 'https://randomuser.me/api/portraits/men/41.jpg',
      isVip: false,
      joinDate: '2025-09-20',
      lastPaymentDate: null,
      paymentAmount: null,
      paymentMethod: null,
      transactionId: null
    },
    { 
      id: 4, 
      name: 'Peter Mwangi', 
      age: 30,
      location: 'Kileleshwa, Nairobi',
      phone: '254745678901',
      email: 'peter@example.com',
      photo: 'https://randomuser.me/api/portraits/men/22.jpg',
      isVip: false,
      joinDate: '2025-09-25',
      lastPaymentDate: null,
      paymentAmount: null,
      paymentMethod: null,
      transactionId: null
    },
    { 
      id: 5, 
      name: 'John Kamau', 
      age: 27,
      location: 'Ruaka, Nairobi',
      phone: '254756789012',
      email: 'john@example.com',
      photo: 'https://randomuser.me/api/portraits/men/45.jpg',
      isVip: true,
      joinDate: '2025-09-30',
      lastPaymentDate: '2025-10-05',
      paymentAmount: VIP_AMOUNT,
      paymentMethod: 'M-Pesa',
      transactionId: 'TRX3456789'
    },
    { 
      id: 6, 
      name: 'Samuel Njoroge', 
      age: 29,
      location: 'Karen, Nairobi',
      phone: '254767890123',
      email: 'samuel@example.com',
      photo: 'https://randomuser.me/api/portraits/men/36.jpg',
      isVip: false,
      joinDate: '2025-10-05',
      lastPaymentDate: null,
      paymentAmount: null,
      paymentMethod: null,
      transactionId: null
    },
    { 
      id: 7, 
      name: 'Kevin Otieno', 
      age: 26,
      location: 'South B, Nairobi',
      phone: '254778901234',
      email: 'kevin@example.com',
      photo: 'https://randomuser.me/api/portraits/men/15.jpg',
      isVip: false,
      joinDate: '2025-10-10',
      lastPaymentDate: null,
      paymentAmount: null,
      paymentMethod: null,
      transactionId: null
    }
  ];

  // Recent payments for transaction history
  const recentPayments = [
    { 
      id: 1, 
      userId: 1, 
      userName: 'James Kamau', 
      amount: VIP_AMOUNT, 
      date: '2025-10-15 14:32', 
      status: 'completed', 
      method: 'M-Pesa',
      transactionId: 'TRX1234567'
    },
    { 
      id: 2, 
      userId: 2, 
      userName: 'David Maina', 
      amount: VIP_AMOUNT, 
      date: '2025-10-10 10:45', 
      status: 'completed', 
      method: 'M-Pesa',
      transactionId: 'TRX2345678'
    },
    { 
      id: 3, 
      userId: 5, 
      userName: 'John Kamau', 
      amount: VIP_AMOUNT, 
      date: '2025-10-05 08:48', 
      status: 'completed', 
      method: 'M-Pesa',
      transactionId: 'TRX3456789'
    },
    { 
      id: 4, 
      userId: 8, 
      userName: 'George Wanyama', 
      amount: VIP_AMOUNT, 
      date: '2025-10-01 16:20', 
      status: 'completed', 
      method: 'M-Pesa',
      transactionId: 'TRX4567890'
    },
    { 
      id: 5, 
      userId: 9, 
      userName: 'Brian Kipchoge', 
      amount: VIP_AMOUNT, 
      date: '2025-09-28 11:15', 
      status: 'completed', 
      method: 'M-Pesa',
      transactionId: 'TRX5678901'
    }
  ];

  // Filter users based on active tab and search query
  const filteredUsers = users
    .filter(user => {
      if (activeTab === 'all') return true;
      if (activeTab === 'vip') return user.isVip;
      if (activeTab === 'normal') return !user.isVip;
      return true;
    })
    .filter(user => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return (
        user.name.toLowerCase().includes(query) ||
        user.location.toLowerCase().includes(query) ||
        user.phone.includes(query) ||
        user.email.toLowerCase().includes(query)
      );
    });

  const handleAddPayment = (user: any) => {
    setSelectedUser(user);
    setShowPaymentModal(true);
  };

  const handleConfirmPayment = () => {
    // In a real app, you would make an API call here
    console.log('Confirming payment for user ID:', selectedUser?.id);
    setShowPaymentModal(false);
    // Then refresh data
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Hookup Payments</h1>
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
              <p className="text-sm font-medium text-gray-500">Total Hookup Users</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{stats.totalHookupUsers.toLocaleString()}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <Star className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">VIP Users</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{stats.vipUsers.toLocaleString()}</p>
              <p className="text-xs text-gray-500 mt-1">{Math.round((stats.vipUsers / stats.totalHookupUsers) * 100)}% of total users</p>
            </div>
            <div className="bg-amber-100 p-3 rounded-lg">
              <CheckCircle className="h-6 w-6 text-amber-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">KSh {stats.totalRevenue.toLocaleString()}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <CreditCard className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Revenue This Month</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">KSh {stats.revenueThisMonth.toLocaleString()}</p>
              <div className="flex items-center text-green-500 text-xs mt-1">
                <TrendingUp className="h-3 w-3 mr-1" />
                <span>{stats.growth}% increase</span>
              </div>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <Calendar className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Users List */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <h2 className="text-lg font-medium text-gray-900">Hookup Users</h2>
            
            {/* Search */}
            <div className="relative max-w-xs w-full">
              <input
                type="text"
                placeholder="Search users..."
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
          <div className="flex border-b border-gray-100">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-6 py-3 text-sm font-medium ${
                activeTab === 'all'
                  ? 'text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              All Users
            </button>
            <button
              onClick={() => setActiveTab('vip')}
              className={`px-6 py-3 text-sm font-medium ${
                activeTab === 'vip'
                  ? 'text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              VIP Users
            </button>
            <button
              onClick={() => setActiveTab('normal')}
              className={`px-6 py-3 text-sm font-medium ${
                activeTab === 'normal'
                  ? 'text-indigo-600 border-b-2 border-indigo-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Normal Users
            </button>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Payment
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0">
                          <img className="h-10 w-10 rounded-full" src={user.photo} alt={user.name} />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-500">{user.age} yrs, {user.location}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{user.phone}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.isVip
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {user.isVip ? 'VIP' : 'Normal'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {user.isVip ? (
                        <div>
                          <span className="text-green-600 font-medium">Paid KSh {user.paymentAmount}</span>
                          <div className="text-xs text-gray-500 mt-1">Last payment: {user.lastPaymentDate}</div>
                        </div>
                      ) : (
                        <span className="text-gray-500">Not paid</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button 
                          className="text-indigo-600 hover:text-indigo-900 flex items-center"
                          onClick={() => console.log('View profile', user.id)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View
                        </button>
                        
                        {!user.isVip && (
                          <button
                            className="text-green-600 hover:text-green-900 flex items-center ml-2"
                            onClick={() => handleAddPayment(user)}
                          >
                            <CreditCard className="h-4 w-4 mr-1" />
                            Add Payment
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Empty state */}
          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No users found matching your criteria</p>
            </div>
          )}

          {/* Pagination */}
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Showing <span className="font-medium">{filteredUsers.length}</span> users
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

        {/* Recent Payments */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-lg font-medium text-gray-900">Recent Payments</h2>
          </div>
          
          <div className="overflow-y-auto max-h-[600px]">
            {recentPayments.length > 0 ? (
              <ul className="divide-y divide-gray-100">
                {recentPayments.map((payment) => (
                  <li key={payment.id} className="p-4 hover:bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{payment.userName}</p>
                        <p className="text-xs text-gray-500 mt-1">User ID: {payment.userId}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-green-600">KSh {payment.amount}</p>
                        <p className="text-xs text-gray-500 mt-1">{payment.date}</p>
                      </div>
                    </div>
                    <div className="mt-2 flex justify-between items-center">
                      <div className="flex items-center">
                        <span className="bg-green-100 text-green-800 text-xs px-2.5 py-0.5 rounded-full">
                          {payment.status}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">
                        {payment.method}: {payment.transactionId}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500">No recent payments</p>
              </div>
            )}
          </div>

          {/* View All Link */}
          <div className="px-6 py-4 border-t border-gray-100">
            <a href="#" className="text-sm font-medium text-indigo-600 hover:text-indigo-500">
              View All Payment History
            </a>
          </div>
        </div>
      </div>

      {/* Add Payment Modal */}
      {showPaymentModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">Add VIP Payment</h3>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="mb-6 flex items-center">
                <img 
                  src={selectedUser.photo} 
                  alt={selectedUser.name} 
                  className="h-12 w-12 rounded-full mr-4" 
                />
                <div>
                  <p className="text-lg font-medium text-gray-900">{selectedUser.name}</p>
                  <p className="text-sm text-gray-600">{selectedUser.email} • {selectedUser.phone}</p>
                </div>
              </div>
              
              <div className="bg-amber-50 border border-amber-100 rounded-lg p-4 mb-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <AlertCircle className="h-5 w-5 text-amber-600" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-amber-800">VIP Upgrade</h3>
                    <div className="mt-2 text-sm text-amber-700">
                      <p>You are adding a VIP payment for this user. They will be upgraded to VIP status and gain all associated benefits.</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-gray-600">VIP Membership Fee:</span>
                  <span className="text-sm font-bold text-gray-900">KSh {VIP_AMOUNT}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-900">Total Amount:</span>
                  <span className="text-lg font-bold text-gray-900">KSh {VIP_AMOUNT}</span>
                </div>
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Method
                </label>
                <select
                  className="w-full border border-gray-300 rounded-lg py-2 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  defaultValue="mpesa"
                >
                  <option value="mpesa">M-Pesa</option>
                  <option value="card">Credit/Debit Card</option>
                  <option value="bank">Bank Transfer</option>
                  <option value="cash">Cash Payment</option>
                </select>
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Transaction ID
                </label>
                <input
                  type="text"
                  placeholder="e.g., TRX1234567"
                  className="w-full border border-gray-300 rounded-lg py-2 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              
              <div className="flex justify-end gap-4">
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmPayment}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center"
                >
                  <Check className="h-4 w-4 mr-2" />
                  Confirm Payment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}