'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { adminService, handleApiError } from '@/lib/api';
import type { User } from '@/types/api';
import {
    Search,
    Filter,
    Download,
    Users,
    Calendar,
    User as UserIcon,
    Heart,
    MessageCircle,
    MoreHorizontal,
    AlertCircle,
    EyeOff,
    X
} from 'lucide-react';

export default function HookupUsersPage() {
    const [activeTab, setActiveTab] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
    const [showSuspendModal, setShowSuspendModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0
    });

    const stats = {
        totalUsers: pagination.total,
        activeToday: users.filter(u => u.isActive).length,
        activeThisWeek: users.filter(u => u.isActive).length,
        newThisMonth: users.length,
        reportedUsers: 0
    };

    // Fetch users from API
    useEffect(() => {
        fetchUsers();
    }, [currentPage, searchQuery]);

    async function fetchUsers() {
        try {
            setLoading(true);
            setError(null);

            const response = await adminService.getUsers({
                page: currentPage,
                limit: 20,
                role: 'HOOKUP_USER',
                search: searchQuery || undefined
            });

            if (response.data) {
                setUsers(response.data);
            }

            if (response.pagination) {
                setPagination(response.pagination);
            }
        } catch (err) {
            setError(handleApiError(err));
            console.error('Error fetching users:', err);
        } finally {
            setLoading(false);
        }
    }

    // Filter users based on active tab
    const filteredUsers = users.filter(user => {
        if (activeTab === 'all') return true;
        if (activeTab === 'active') return user.isActive;
        if (activeTab === 'inactive') return !user.isActive;
        if (activeTab === 'suspended') return !user.isActive;
        return true;
    });

    const toggleSelectAll = () => {
        if (selectedUsers.length === filteredUsers.length) {
            setSelectedUsers([]);
        } else {
            setSelectedUsers(filteredUsers.map(user => user.id));
        }
    };

    const toggleSelectUser = (id: string) => {
        if (selectedUsers.includes(id)) {
            setSelectedUsers(selectedUsers.filter(userId => userId !== id));
        } else {
            setSelectedUsers([...selectedUsers, id]);
        }
    };

    const handleSuspendUser = (user: User) => {
        setSelectedUser(user);
        setShowSuspendModal(true);
    };

    async function confirmSuspend() {
        if (!selectedUser) return;

        try {
            await adminService.updateUserStatus(selectedUser.id, {
                isActive: false
            });

            setShowSuspendModal(false);
            fetchUsers(); // Refresh the list
        } catch (err) {
            alert(handleApiError(err));
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-semibold">Hookup Users</h1>
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
                            <p className="text-sm font-medium text-gray-500">Total Users</p>
                            <p className="text-2xl font-bold text-gray-900 mt-2">{stats.totalUsers.toLocaleString()}</p>
                            <p className="text-xs text-gray-500 mt-1">{stats.newThisMonth.toLocaleString()} new this month</p>
                        </div>
                        <div className="bg-blue-100 p-3 rounded-lg">
                            <Users className="h-6 w-6 text-blue-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Active Users</p>
                            <p className="text-2xl font-bold text-gray-900 mt-2">{stats.activeToday.toLocaleString()}</p>
                            <p className="text-xs text-gray-500 mt-1">{stats.activeThisWeek.toLocaleString()} this week</p>
                        </div>
                        <div className="bg-green-100 p-3 rounded-lg">
                            <Calendar className="h-6 w-6 text-green-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Messages Today</p>
                            <p className="text-2xl font-bold text-gray-900 mt-2">0</p>
                            <p className="text-xs text-gray-500 mt-1">Platform activity</p>
                        </div>
                        <div className="bg-purple-100 p-3 rounded-lg">
                            <MessageCircle className="h-6 w-6 text-purple-600" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex justify-between items-start">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Reported Users</p>
                            <p className="text-2xl font-bold text-gray-900 mt-2">{stats.reportedUsers}</p>
                            <p className="text-xs text-gray-500 mt-1">Requiring review</p>
                        </div>
                        <div className="bg-red-100 p-3 rounded-lg">
                            <AlertCircle className="h-6 w-6 text-red-600" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Users List */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                    <h2 className="text-lg font-medium text-gray-900">Users</h2>

                    {/* Search */}
                    <div className="relative max-w-xs w-full">
                        <input
                            type="text"
                            placeholder="Search name, email, phone..."
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
                        All Users
                    </button>
                    <button
                        onClick={() => setActiveTab('active')}
                        className={`px-6 py-3 text-sm font-medium whitespace-nowrap ${activeTab === 'active'
                            ? 'text-indigo-600 border-b-2 border-indigo-600'
                            : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        Active
                    </button>
                    <button
                        onClick={() => setActiveTab('inactive')}
                        className={`px-6 py-3 text-sm font-medium whitespace-nowrap ${activeTab === 'inactive'
                            ? 'text-indigo-600 border-b-2 border-indigo-600'
                            : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        Inactive
                    </button>
                    <button
                        onClick={() => setActiveTab('suspended')}
                        className={`px-6 py-3 text-sm font-medium whitespace-nowrap ${activeTab === 'suspended'
                            ? 'text-indigo-600 border-b-2 border-indigo-600'
                            : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        Suspended
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
                                    <h3 className="text-sm font-medium text-red-800">Error Loading Users</h3>
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
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        <input
                                            type="checkbox"
                                            checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                                            onChange={toggleSelectAll}
                                            className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                                        />
                                    </th>
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
                                        Wallet
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Referral Code
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredUsers.map((user) => {
                                    const displayName = user.displayName || `${user.firstName} ${user.lastName}`;

                                    return (
                                        <tr key={user.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedUsers.includes(user.id)}
                                                    onChange={() => toggleSelectUser(user.id)}
                                                    className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                                                />
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="h-10 w-10 flex-shrink-0 relative">
                                                        <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                                                            <UserIcon className="h-5 w-5 text-purple-600" />
                                                        </div>
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900 flex items-center">
                                                            {displayName}
                                                        </div>
                                                        <div className="text-sm text-gray-500">{user.role}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-900">{user.email}</div>
                                                <div className="text-sm text-gray-500">{user.phone}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                    user.isActive
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-red-100 text-red-800'
                                                }`}>
                                                    {user.isActive ? 'Active' : 'Suspended'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                <div className="flex flex-col">
                                                    <div className="text-gray-900 font-medium">
                                                        KSh {user.walletBalance.toLocaleString()}
                                                    </div>
                                                    <div className="text-xs text-gray-500">
                                                        Joined {new Date(user.createdAt).toLocaleDateString()}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {user.referralCode ? (
                                                    <code className="px-2 py-1 bg-gray-100 rounded text-xs font-mono">
                                                        {user.referralCode}
                                                    </code>
                                                ) : (
                                                    <span className="text-gray-400">-</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <div className="flex items-center space-x-3">
                                                    <Link href={`/hookup-users/${user.id}`}>
                                                        <button className="text-indigo-600 hover:text-indigo-900">
                                                            View
                                                        </button>
                                                    </Link>
                                                    <div className="relative group">
                                                        <button className="text-gray-400 hover:text-gray-500">
                                                            <MoreHorizontal className="h-5 w-5" />
                                                        </button>
                                                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 hidden group-hover:block">
                                                            <Link href={`/hookup-users/${user.id}/edit`} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                                                Edit Profile
                                                            </Link>
                                                            {user.isActive ? (
                                                                <button
                                                                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                                                                    onClick={() => handleSuspendUser(user)}
                                                                >
                                                                    Suspend Account
                                                                </button>
                                                            ) : (
                                                                <button
                                                                    className="block w-full text-left px-4 py-2 text-sm text-green-600 hover:bg-gray-100"
                                                                    onClick={async () => {
                                                                        try {
                                                                            await adminService.updateUserStatus(user.id, { isActive: true });
                                                                            fetchUsers();
                                                                        } catch (err) {
                                                                            alert(handleApiError(err));
                                                                        }
                                                                    }}
                                                                >
                                                                    Reactivate Account
                                                                </button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Empty state */}
                {!loading && !error && filteredUsers.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-gray-500">No users found matching your criteria</p>
                    </div>
                )}

                {/* Pagination */}
                {!loading && !error && filteredUsers.length > 0 && (
                    <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
                        <div className="text-sm text-gray-500">
                            Showing <span className="font-medium">{((pagination.page - 1) * pagination.limit) + 1}</span> to{' '}
                            <span className="font-medium">{Math.min(pagination.page * pagination.limit, pagination.total)}</span> of{' '}
                            <span className="font-medium">{pagination.total}</span> users
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setCurrentPage(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-500 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                            >
                                Previous
                            </button>
                            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
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

            {/* Suspend Account Modal */}
            {showSuspendModal && selectedUser && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg shadow-lg max-w-md w-full">
                        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                            <h3 className="text-lg font-medium text-gray-900">Suspend User Account</h3>
                            <button
                                onClick={() => setShowSuspendModal(false)}
                                className="text-gray-400 hover:text-gray-500"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="p-6">
                            <div className="mb-6 flex items-center">
                                <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center mr-4">
                                    <UserIcon className="h-6 w-6 text-purple-600" />
                                </div>
                                <div>
                                    <p className="text-lg font-medium text-gray-900">
                                        {selectedUser.displayName || `${selectedUser.firstName} ${selectedUser.lastName}`}
                                    </p>
                                    <p className="text-sm text-gray-600">{selectedUser.email} • {selectedUser.phone}</p>
                                </div>
                            </div>

                            <div className="bg-red-50 border border-red-100 rounded-lg p-4 mb-6">
                                <div className="flex items-start">
                                    <div className="flex-shrink-0">
                                        <EyeOff className="h-5 w-5 text-red-600" />
                                    </div>
                                    <div className="ml-3">
                                        <h3 className="text-sm font-medium text-red-800">Warning</h3>
                                        <div className="mt-2 text-sm text-red-700">
                                            <p>You are about to suspend this user account. This action will:</p>
                                            <ul className="list-disc list-inside mt-2 space-y-1">
                                                <li>Prevent the user from logging in</li>
                                                <li>Hide their profile from other users</li>
                                                <li>Pause any active features</li>
                                                <li>Send a notification email to the user</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Suspension Reason
                                </label>
                                <select
                                    className="w-full border border-gray-300 rounded-lg py-2 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    defaultValue=""
                                >
                                    <option value="" disabled>Select a reason</option>
                                    <option value="tos_violation">Terms of Service Violation</option>
                                    <option value="inappropriate">Inappropriate Content</option>
                                    <option value="harassment">Harassment of Other Users</option>
                                    <option value="fake_profile">Fake Profile</option>
                                    <option value="spam">Spam/Advertising</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>

                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Additional Notes (Optional)
                                </label>
                                <textarea
                                    rows={3}
                                    className="w-full border border-gray-300 rounded-lg py-2 px-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    placeholder="Provide specific details about this suspension..."
                                ></textarea>
                            </div>

                            <div className="flex justify-end gap-4">
                                <button
                                    onClick={() => setShowSuspendModal(false)}
                                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={confirmSuspend}
                                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center"
                                >
                                    <EyeOff className="h-4 w-4 mr-2" />
                                    Suspend Account
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
