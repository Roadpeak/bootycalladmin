'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Check, X, ChevronRight, ArrowRight, Download } from 'lucide-react';

export default function ReferralProgramPage() {
  const [activeTab, setActiveTab] = useState('all');
  
  // Mock data - in a real app, you'd fetch this from your API
  const referralStats = {
    totalReferrals: 124,
    activeReferrals: 85,
    totalEarnings: 31000,
    pendingCashouts: 7,
    cashoutAmount: 5750
  };

  const referrals = [
    { id: 1, name: 'James Kamau', email: 'james@example.com', phone: '254712345678', date: '2025-10-12', status: 'active', earnings: 1250, referredBy: 'Sarah Wangui', avatar: 'https://randomuser.me/api/portraits/men/32.jpg' },
    { id: 2, name: 'Sarah Wangui', email: 'sarah@example.com', phone: '254723456789', date: '2025-10-05', status: 'active', earnings: 2750, referredBy: null, avatar: 'https://randomuser.me/api/portraits/women/44.jpg' },
    { id: 3, name: 'David Maina', email: 'david@example.com', phone: '254734567890', date: '2025-09-28', status: 'active', earnings: 1500, referredBy: 'Sarah Wangui', avatar: 'https://randomuser.me/api/portraits/men/68.jpg' },
    { id: 4, name: 'Caroline Njeri', email: 'caroline@example.com', phone: '254745678901', date: '2025-09-22', status: 'inactive', earnings: 250, referredBy: 'James Kamau', avatar: 'https://randomuser.me/api/portraits/women/33.jpg' },
    { id: 5, name: 'Michael Omondi', email: 'michael@example.com', phone: '254756789012', date: '2025-09-15', status: 'active', earnings: 1750, referredBy: null, avatar: 'https://randomuser.me/api/portraits/men/41.jpg' },
  ];

  const filteredReferrals = activeTab === 'all' 
    ? referrals 
    : referrals.filter(referral => referral.status === activeTab);

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
          <h2 className="text-sm font-medium text-gray-500">Total Referrals</h2>
          <p className="text-2xl font-bold text-gray-900 mt-2">{referralStats.totalReferrals}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-sm font-medium text-gray-500">Active Referrals</h2>
          <p className="text-2xl font-bold text-gray-900 mt-2">{referralStats.activeReferrals}</p>
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

      {/* Referrals List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-lg font-medium text-gray-900">Referrals List</h2>
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
            All Referrals
          </button>
          <button
            onClick={() => setActiveTab('active')}
            className={`px-6 py-3 text-sm font-medium ${
              activeTab === 'active'
                ? 'text-indigo-600 border-b-2 border-indigo-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Active
          </button>
          <button
            onClick={() => setActiveTab('inactive')}
            className={`px-6 py-3 text-sm font-medium ${
              activeTab === 'inactive'
                ? 'text-indigo-600 border-b-2 border-indigo-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Inactive
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
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Earnings
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Referred By
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredReferrals.map((referral) => (
                <tr key={referral.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0">
                        <img className="h-10 w-10 rounded-full" src={referral.avatar} alt={referral.name} />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{referral.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{referral.email}</div>
                    <div className="text-sm text-gray-500">{referral.phone}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {referral.date}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        referral.status === 'active'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {referral.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    KSh {referral.earnings.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {referral.referredBy || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button className="text-indigo-600 hover:text-indigo-900 mr-3">
                      View
                    </button>
                    <button className={`${
                      referral.status === 'active' ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'
                    }`}>
                      {referral.status === 'active' ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination would go here */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Showing <span className="font-medium">{filteredReferrals.length}</span> referrals
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