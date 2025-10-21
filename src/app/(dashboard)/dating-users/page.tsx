'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
    Search,
    Filter,
    Download,
    Users,
    Calendar,
    Shield,
    User,
    Heart,
    MessageCircle,
    MapPin,
    Check,
    X,
    MoreHorizontal,
    AlertCircle,
    EyeOff
} from 'lucide-react';

export default function DatingUsersPage() {
    const [activeTab, setActiveTab] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedUsers, setSelectedUsers] = useState<number[]>([]);
    const [showSuspendModal, setShowSuspendModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState<any>(null);

    // Mock data - in a real app, you'd fetch this from your API
    const stats = {
        totalUsers: 15362,
        activeToday: 3456,
        activeThisWeek: 7842,
        verifiedUsers: 12455,
        premiumUsers: 3845,
        newThisMonth: 2134,
        reportedUsers: 43
    };

    const users = [
        {
            id: 1,
            name: 'Jessica K',
            age: 28,
            gender: 'Female',
            location: 'Westlands, Nairobi',
            email: 'jessica@example.com',
            phone: '254712345678',
            photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300',
            joinDate: '2025-09-10',
            lastActive: '2025-10-21 14:32',
            status: 'active',
            isVerified: true,
            isPremium: true,
            isReported: false,
            reportCount: 0,
            likesCount: 142,
            matchesCount: 37,
            messageCount: 684
        },
        {
            id: 2,
            name: 'Michael S',
            age: 32,
            gender: 'Male',
            location: 'Kilimani, Nairobi',
            email: 'michael@example.com',
            phone: '254723456789',
            photo: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=300',
            joinDate: '2025-09-15',
            lastActive: '2025-10-21 13:21',
            status: 'active',
            isVerified: true,
            isPremium: true,
            isReported: false,
            reportCount: 0,
            likesCount: 87,
            matchesCount: 24,
            messageCount: 356
        },
        {
            id: 3,
            name: 'Sophia W',
            age: 25,
            gender: 'Female',
            location: 'Lavington, Nairobi',
            email: 'sophia@example.com',
            phone: '254734567890',
            photo: 'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=300',
            joinDate: '2025-09-20',
            lastActive: '2025-10-21 12:45',
            status: 'inactive',
            isVerified: false,
            isPremium: false,
            isReported: false,
            reportCount: 0,
            likesCount: 65,
            matchesCount: 18,
            messageCount: 243
        },
        {
            id: 4,
            name: 'David M',
            age: 29,
            gender: 'Male',
            location: 'Kileleshwa, Nairobi',
            email: 'david@example.com',
            phone: '254745678901',
            photo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=300',
            joinDate: '2025-09-25',
            lastActive: '2025-10-21 11:12',
            status: 'active',
            isVerified: true,
            isPremium: false,
            isReported: false,
            reportCount: 0,
            likesCount: 112,
            matchesCount: 31,
            messageCount: 476
        },
        {
            id: 5,
            name: 'Emily T',
            age: 27,
            gender: 'Female',
            location: 'Karen, Nairobi',
            email: 'emily@example.com',
            phone: '254756789012',
            photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300',
            joinDate: '2025-09-30',
            lastActive: '2025-10-21 10:48',
            status: 'active',
            isVerified: true,
            isPremium: false,
            isReported: true,
            reportCount: 2,
            likesCount: 94,
            matchesCount: 22,
            messageCount: 317
        },
        {
            id: 6,
            name: 'James N',
            age: 31,
            gender: 'Male',
            location: 'South B, Nairobi',
            email: 'james@example.com',
            phone: '254767890123',
            photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300',
            joinDate: '2025-10-05',
            lastActive: '2025-10-21 09:30',
            status: 'active',
            isVerified: true,
            isPremium: true,
            isReported: false,
            reportCount: 0,
            likesCount: 136,
            matchesCount: 42,
            messageCount: 731
        },
        {
            id: 7,
            name: 'Lily R',
            age: 24,
            gender: 'Female',
            location: 'Parklands, Nairobi',
            email: 'lily@example.com',
            phone: '254778901234',
            photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=300',
            joinDate: '2025-10-10',
            lastActive: '2025-10-21 08:22',
            status: 'suspended',
            isVerified: true,
            isPremium: false,
            isReported: true,
            reportCount: 5,
            likesCount: 75,
            matchesCount: 15,
            messageCount: 189
        }
    ];

    // Filter users based on active tab and search query
    const filteredUsers = users
        .filter(user => {
            if (activeTab === 'all') return true;
            if (activeTab === 'active') return user.status === 'active';
            if (activeTab === 'inactive') return user.status === 'inactive';
            if (activeTab === 'suspended') return user.status === 'suspended';
            if (activeTab === 'reported') return user.isReported;
            if (activeTab === 'premium') return user.isPremium;
            if (activeTab === 'verified') return user.isVerified;
            return true;
        })
        .filter(user => {
            if (!searchQuery) return true;
            const query = searchQuery.toLowerCase();
            return (
                user.name.toLowerCase().includes(query) ||
                user.email.toLowerCase().includes(query) ||
                user.phone.includes(query) ||
                user.location.toLowerCase().includes(query)
            );
        });

    const toggleSelectAll = () => {
        if (selectedUsers.length === filteredUsers.length) {
            setSelectedUsers([]);
        } else {
            setSelectedUsers(filteredUsers.map(user => user.id));
        }
    };

    const toggleSelectUser = (id: number) => {
        if (selectedUsers.includes(id)) {
            setSelectedUsers(selectedUsers.filter(userId => userId !== id));
        } else {
            setSelectedUsers([...selectedUsers, id]);
        }
    };

    const handleSuspendUser = (user: any) => {
        setSelectedUser(user);
        setShowSuspendModal(true);
    };

    const confirmSuspend = () => {
        // In a real app, you would make an API call here
        console.log('Suspending user:', selectedUser?.id);
        setShowSuspendModal(false);
        // Then refresh data
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-semibold">Dating Users</h1>
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
                            <p className="text-sm font-medium text-gray-500">Premium Users</p>
                            <p className="text-2xl font-bold text-gray-900 mt-2">{stats.premiumUsers.toLocaleString()}</p>
                            <p className="text-xs text-gray-500 mt-1">{Math.round((stats.premiumUsers / stats.totalUsers) * 100)}% of total users</p>
                        </div>
                        <div className="bg-pink-100 p-3 rounded-lg">
                            <Heart className="h-6 w-6 text-pink-600" />
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
                            placeholder="Search name, email, location..."
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
                    <button
                        onClick={() => setActiveTab('reported')}
                        className={`px-6 py-3 text-sm font-medium whitespace-nowrap ${activeTab === 'reported'
                            ? 'text-indigo-600 border-b-2 border-indigo-600'
                            : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        Reported
                    </button>
                    <button
                        onClick={() => setActiveTab('premium')}
                        className={`px-6 py-3 text-sm font-medium whitespace-nowrap ${activeTab === 'premium'
                            ? 'text-indigo-600 border-b-2 border-indigo-600'
                            : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        Premium
                    </button>
                    <button
                        onClick={() => setActiveTab('verified')}
                        className={`px-6 py-3 text-sm font-medium whitespace-nowrap ${activeTab === 'verified'
                            ? 'text-indigo-600 border-b-2 border-indigo-600'
                            : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        Verified
                    </button>
                </div>

                {/* Table */}
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
                                    Location
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Activity
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
                                                <img className="h-10 w-10 rounded-full object-cover" src={user.photo} alt={user.name} />
                                                {user.isPremium && (
                                                    <div className="absolute -top-1 -right-1 h-4 w-4 bg-pink-500 rounded-full border-2 border-white" title="Premium Member"></div>
                                                )}
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900 flex items-center">
                                                    {user.name}, {user.age}
                                                    {user.isVerified && (
                                                        <span className="ml-1 text-indigo-600" title="Verified Profile">
                                                            <Shield className="h-3.5 w-3.5" />
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="text-sm text-gray-500">{user.gender}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-gray-900">{user.email}</div>
                                        <div className="text-sm text-gray-500">{user.phone}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <div className="flex items-center">
                                            <MapPin className="h-3.5 w-3.5 mr-1 text-gray-400" />
                                            {user.location}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex flex-col space-y-1">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.status === 'active'
                                                ? 'bg-green-100 text-green-800'
                                                : user.status === 'inactive'
                                                    ? 'bg-gray-100 text-gray-800'
                                                    : 'bg-red-100 text-red-800'
                                                }`}>
                                                {user.status}
                                            </span>
                                            {user.isReported && (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                                    {user.reportCount} reports
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <div className="flex flex-col">
                                            <div className="text-gray-600 font-medium mb-1">Joined: {user.joinDate}</div>
                                            <div className="flex gap-4">
                                                <span className="flex items-center text-gray-500" title="Likes">
                                                    <Heart className="h-3.5 w-3.5 mr-1 text-pink-500" />
                                                    {user.likesCount}
                                                </span>
                                                <span className="flex items-center text-gray-500" title="Matches">
                                                    <Check className="h-3.5 w-3.5 mr-1 text-indigo-500" />
                                                    {user.matchesCount}
                                                </span>
                                                <span className="flex items-center text-gray-500" title="Messages">
                                                    <MessageCircle className="h-3.5 w-3.5 mr-1 text-green-500" />
                                                    {user.messageCount}
                                                </span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <div className="flex items-center space-x-3">
                                            <Link href={`/dating-users/${user.id}`}>
                                                <button className="text-indigo-600 hover:text-indigo-900">
                                                    View
                                                </button>
                                            </Link>
                                            <div className="relative group">
                                                <button className="text-gray-400 hover:text-gray-500">
                                                    <MoreHorizontal className="h-5 w-5" />
                                                </button>
                                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 hidden group-hover:block">
                                                    <Link href={`/dating-users/${user.id}/edit`} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                                                        Edit Profile
                                                    </Link>
                                                    {user.status !== 'suspended' && (
                                                        <button
                                                            className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                                                            onClick={() => handleSuspendUser(user)}
                                                        >
                                                            Suspend Account
                                                        </button>
                                                    )}
                                                    {user.status === 'suspended' && (
                                                        <button className="block w-full text-left px-4 py-2 text-sm text-green-600 hover:bg-gray-100">
                                                            Reactivate Account
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
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
                                <img
                                    src={selectedUser.photo}
                                    alt={selectedUser.name}
                                    className="h-12 w-12 rounded-full mr-4 object-cover"
                                />
                                <div>
                                    <p className="text-lg font-medium text-gray-900">{selectedUser.name}, {selectedUser.age}</p>
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
                                                <li>Pause any active subscriptions</li>
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