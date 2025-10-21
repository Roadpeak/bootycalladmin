'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronRight, Download, Search, Users, ArrowRight } from 'lucide-react';

export default function ReferralProgramPage() {
  const [activeTab, setActiveTab] = useState('all-users');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Mock data - in a real app, you'd fetch this from your API
  const referralStats = {
    totalUsers: 248,
    totalReferrals: 124,
    activeReferrers: 28,
    totalEarnings: 31000,
    pendingCashouts: 7,
    cashoutAmount: 5750
  };

  // All users data
  const allUsers = [
    { id: 1, name: 'James Kamau', email: 'james@example.com', phone: '254712345678', date: '2025-10-12', wasReferred: true, referredBy: 'Sarah Wangui', referredCount: 3, earnings: 750, avatar: 'https://randomuser.me/api/portraits/men/32.jpg' },
    { id: 2, name: 'Sarah Wangui', email: 'sarah@example.com', phone: '254723456789', date: '2025-10-05', wasReferred: false, referredBy: null, referredCount: 5, earnings: 1250, avatar: 'https://randomuser.me/api/portraits/women/44.jpg' },
    { id: 3, name: 'David Maina', email: 'david@example.com', phone: '254734567890', date: '2025-09-28', wasReferred: true, referredBy: 'Sarah Wangui', referredCount: 0, earnings: 0, avatar: 'https://randomuser.me/api/portraits/men/68.jpg' },
    { id: 4, name: 'Caroline Njeri', email: 'caroline@example.com', phone: '254745678901', date: '2025-09-22', wasReferred: true, referredBy: 'James Kamau', referredCount: 0, earnings: 0, avatar: 'https://randomuser.me/api/portraits/women/33.jpg' },
    { id: 5, name: 'Michael Omondi', email: 'michael@example.com', phone: '254756789012', date: '2025-09-15', wasReferred: false, referredBy: null, referredCount: 2, earnings: 500, avatar: 'https://randomuser.me/api/portraits/men/41.jpg' },
    { id: 6, name: 'Grace Akinyi', email: 'grace@example.com', phone: '254767890123', date: '2025-09-10', wasReferred: true, referredBy: 'Michael Omondi', referredCount: 0, earnings: 0, avatar: 'https://randomuser.me/api/portraits/women/56.jpg' },
    { id: 7, name: 'Peter Mwangi', email: 'peter@example.com', phone: '254778901234', date: '2025-09-05', wasReferred: true, referredBy: 'Sarah Wangui', referredCount: 1, earnings: 250, avatar: 'https://randomuser.me/api/portraits/men/22.jpg' },
    { id: 8, name: 'Catherine Wanjiku', email: 'catherine@example.com', phone: '254789012345', date: '2025-09-01', wasReferred: true, referredBy: 'Peter Mwangi', referredCount: 0, earnings: 0, avatar: 'https://randomuser.me/api/portraits/women/68.jpg' },
    { id: 9, name: 'John Kamau', email: 'john@example.com', phone: '254790123456', date: '2025-08-25', wasReferred: false, referredBy: null, referredCount: 0, earnings: 0, avatar: 'https://randomuser.me/api/portraits/men/45.jpg' },
    { id: 10, name: 'Elizabeth Wambui', email: 'elizabeth@example.com', phone: '254701234567', date: '2025-08-20', wasReferred: false, referredBy: null, referredCount: 0, earnings: 0, avatar: 'https://randomuser.me/api/portraits/women/22.jpg' },
  ];

  // Filter users based on active tab and search query
  const filteredUsers = allUsers
    .filter(user => {
      if (activeTab === 'all-users') return true;
      if (activeTab === 'referred-users') return user.wasReferred;
      return true;
    })
    .filter(user => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return (
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        user.phone.includes(query) ||
        (user.referredBy && user.referredBy.toLowerCase().includes(query))
      );
    });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Referral Program</h1>
        <div className="flex gap-3">
          <Link 
            href="/referral-program/cashouts" 
            className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            <span>Manage Cashouts</span>
            <ChevronRight className="h-4 w-4 ml-1" />
          </Link>
          <button className="flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
            <Download className="h-4 w-4 mr-1" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-sm font-medium text-gray-500">Total Users</h2>
          <p className="text-2xl font-bold text-gray-900 mt-2">{referralStats.totalUsers}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-sm font-medium text-gray-500">Total Referrals</h2>
          <p className="text-2xl font-bold text-gray-900 mt-2">{referralStats.totalReferrals}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-sm font-medium text-gray-500">Total Earnings</h2>
          <p className="text-2xl font-bold text-gray-900 mt-2">KSh {referralStats.totalEarnings.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-sm font-medium text-gray-500">Pending Cashouts</h2>
          <p className="text-2xl font-bold text-gray-900 mt-2">{referralStats.pendingCashouts}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-sm font-medium text-gray-500">Cashout Amount</h2>
          <p className="text-2xl font-bold text-gray-900 mt-2">KSh {referralStats.cashoutAmount.toLocaleString()}</p>
        </div>
      </div>

      {/* Users List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <h2 className="text-lg font-medium text-gray-900">Users & Referrals</h2>
          
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
            onClick={() => setActiveTab('all-users')}
            className={`px-6 py-3 text-sm font-medium flex items-center ${
              activeTab === 'all-users'
                ? 'text-indigo-600 border-b-2 border-indigo-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Users className="h-4 w-4 mr-1" />
            All Users
          </button>
          <button
            onClick={() => setActiveTab('referred-users')}
            className={`px-6 py-3 text-sm font-medium flex items-center ${
              activeTab === 'referred-users'
                ? 'text-indigo-600 border-b-2 border-indigo-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <ArrowRight className="h-4 w-4 mr-1" />
            Referred Users
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
                  Date Joined
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Referred By
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Referral Count
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Earnings
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
                        <img className="h-10 w-10 rounded-full" src={user.avatar} alt={user.name} />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        <div className="text-xs text-gray-500">ID: {user.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{user.email}</div>
                    <div className="text-sm text-gray-500">{user.phone}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {user.date}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {user.wasReferred ? (
                      <div className="flex items-center">
                        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full mr-2">
                          Referred
                        </span>
                        <span className="text-gray-900">{user.referredBy}</span>
                      </div>
                    ) : (
                      <span className="text-gray-500">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex items-center">
                      <span className={`${
                        user.referredCount > 0
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800'
                        } text-xs font-medium mr-2 px-2.5 py-0.5 rounded-full`}
                      >
                        {user.referredCount}
                      </span>
                      <span className="text-gray-500">users</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.earnings > 0 ? `KSh ${user.earnings.toLocaleString()}` : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button className="text-indigo-600 hover:text-indigo-900">
                      View Details
                    </button>
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
    </div>
  );
}