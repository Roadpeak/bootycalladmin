'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  ChevronRight, 
  Users, 
  CreditCard, 
  Calendar, 
  TrendingUp, 
  DollarSign, 
  AlertCircle,
  Activity,
  UserPlus,
  Heart,
  User,
  MessageCircle,
  CheckSquare 
} from 'lucide-react';

export default function DashboardPage() {
  // Statistics data - in a real app, this would come from an API
  const stats = {
    totalUsers: 24780,
    userGrowth: 12,
    newUsersToday: 87,
    totalRevenue: 1345600,
    revenueGrowth: 8,
    revenueToday: 25600,
    pendingCashouts: 7,
    pendingAmount: 5750,
    pendingVerifications: 34,
    activeChats: 156
  };

  // User type breakdown
  const userTypes = [
    { name: 'Dating Users', count: 15362, icon: Heart, color: 'bg-pink-500' },
    { name: 'Hookup Users', count: 7834, icon: MessageCircle, color: 'bg-purple-500' },
    { name: 'Escorts', count: 1584, icon: User, color: 'bg-blue-500' }
  ];

  // Recent payment data
  const recentPayments = [
    { id: 1, user: 'James Kamau', type: 'Dating Premium', amount: 1299, date: '2025-10-21 14:32', status: 'completed', avatar: 'https://randomuser.me/api/portraits/men/32.jpg' },
    { id: 2, user: 'Sarah Wangui', type: 'Escort Verification', amount: 2000, date: '2025-10-21 12:21', status: 'completed', avatar: 'https://randomuser.me/api/portraits/women/44.jpg' },
    { id: 3, user: 'David Maina', type: 'Hookup Premium', amount: 999, date: '2025-10-21 10:45', status: 'completed', avatar: 'https://randomuser.me/api/portraits/men/68.jpg' },
    { id: 4, user: 'Caroline Njeri', type: 'Dating Boost', amount: 499, date: '2025-10-21 09:12', status: 'completed', avatar: 'https://randomuser.me/api/portraits/women/33.jpg' },
    { id: 5, user: 'Michael Omondi', type: 'Escort Featured', amount: 1500, date: '2025-10-21 08:48', status: 'pending', avatar: 'https://randomuser.me/api/portraits/men/41.jpg' }
  ];

  // Pending verifications
  const pendingVerifications = [
    { id: 1, user: 'Grace Akinyi', type: 'Escort', date: '2025-10-21 15:30', avatar: 'https://randomuser.me/api/portraits/women/56.jpg' },
    { id: 2, user: 'Peter Mwangi', type: 'Escort', date: '2025-10-21 14:22', avatar: 'https://randomuser.me/api/portraits/men/22.jpg' },
    { id: 3, user: 'Catherine Wanjiku', type: 'Escort', date: '2025-10-21 13:15', avatar: 'https://randomuser.me/api/portraits/women/68.jpg' }
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
              <p className="text-2xl font-bold text-gray-900 mt-2">{stats.totalUsers.toLocaleString()}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <div className="flex items-center text-green-500 text-sm mt-4">
            <TrendingUp className="h-4 w-4 mr-1" />
            <span>{stats.userGrowth}% increase</span>
            <span className="text-gray-400 ml-2">vs. last month</span>
          </div>
        </div>
        
        {/* Total Revenue */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">KSh {stats.totalRevenue.toLocaleString()}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <div className="flex items-center text-green-500 text-sm mt-4">
            <TrendingUp className="h-4 w-4 mr-1" />
            <span>{stats.revenueGrowth}% increase</span>
            <span className="text-gray-400 ml-2">vs. last month</span>
          </div>
        </div>
        
        {/* New Users Today */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">New Users Today</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{stats.newUsersToday}</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <UserPlus className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          <div className="flex items-center text-gray-500 text-sm mt-4">
            <Calendar className="h-4 w-4 mr-1" />
            <span>Today, {new Date().toLocaleDateString()}</span>
          </div>
        </div>
        
        {/* Today's Revenue */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Today's Revenue</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">KSh {stats.revenueToday.toLocaleString()}</p>
            </div>
            <div className="bg-pink-100 p-3 rounded-lg">
              <CreditCard className="h-6 w-6 text-pink-600" />
            </div>
          </div>
          <div className="flex items-center text-gray-500 text-sm mt-4">
            <Calendar className="h-4 w-4 mr-1" />
            <span>Today, {new Date().toLocaleDateString()}</span>
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
                    <p>{stats.pendingVerifications} escort verifications pending approval</p>
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
            
            {/* Pending Cashouts */}
            <div className="bg-amber-50 border border-amber-100 rounded-lg p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <AlertCircle className="h-5 w-5 text-amber-600" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-amber-800">Pending Cashouts</h3>
                  <div className="mt-2 text-sm text-amber-700">
                    <p>{stats.pendingCashouts} cashout requests totaling KSh {stats.pendingAmount.toLocaleString()}</p>
                  </div>
                  <div className="mt-3">
                    <Link
                      href="/referral-program/cashouts"
                      className="text-sm font-medium text-amber-600 hover:text-amber-500"
                    >
                      Process Cashouts <ChevronRight className="inline h-4 w-4" />
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
                    <p className="mt-1">{stats.activeChats} active chats</p>
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
                {recentPayments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-8 w-8 flex-shrink-0">
                          <img className="h-8 w-8 rounded-full" src={payment.avatar} alt={payment.user} />
                        </div>
                        <div className="ml-3">
                          <div className="text-sm font-medium text-gray-900">{payment.user}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{payment.type}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">KSh {payment.amount}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{payment.date}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        payment.status === 'completed' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {payment.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Recent Verifications */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-lg font-medium text-gray-900">Recent Verification Requests</h2>
          </div>
          
          <ul className="divide-y divide-gray-100">
            {pendingVerifications.map((verification) => (
              <li key={verification.id} className="p-4 hover:bg-gray-50">
                <div className="flex items-center space-x-4">
                  <div className="flex-shrink-0">
                    <img className="h-10 w-10 rounded-full" src={verification.avatar} alt={verification.user} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{verification.user}</p>
                    <p className="text-sm text-gray-500 truncate">{verification.type} Verification</p>
                  </div>
                  <div className="flex-shrink-0">
                    <div className="text-xs text-gray-500">{verification.date}</div>
                    <button className="text-xs text-indigo-600 hover:text-indigo-500 mt-1">Review</button>
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
        </div>
      </div>
    </div>
  );
}