'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { adminService, handleApiError } from '@/lib/api';
import type { User } from '@/types/api';
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Shield,
  DollarSign,
  User as UserIcon,
  Edit,
  AlertCircle,
  MessageCircle
} from 'lucide-react';
import Link from 'next/link';
import AccountStatusCard from '@/components/admin/AccountStatusCard';
import { StatusBadge } from '@/components/admin/ui';

export default function HookupUserDetailPage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (userId) {
      fetchUser();
    }
  }, [userId]);

  async function fetchUser() {
    try {
      setLoading(true);
      setError(null);
      const userData = await adminService.getUserById(userId);
      setUser(userData);
    } catch (err) {
      setError(handleApiError(err));
      console.error('Error fetching user:', err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading user details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center">
          <button
            onClick={() => router.back()}
            className="mr-4 p-2 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-2xl font-semibold">User Details</h1>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
            <h3 className="text-red-800 font-medium">Error Loading User</h3>
          </div>
          <p className="mt-2 text-red-700 text-sm">{error}</p>
          <button
            onClick={fetchUser}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="space-y-6">
        <div className="flex items-center">
          <button
            onClick={() => router.back()}
            className="mr-4 p-2 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-2xl font-semibold">User Details</h1>
        </div>
        <div className="text-center py-12">
          <p className="text-gray-600">User not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <button
            onClick={() => router.back()}
            className="mr-4 p-2 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-2xl font-semibold">Hookup User Details</h1>
        </div>

      </div>

      <AccountStatusCard
        userId={user.id}
        status={user.accountStatus}
        reason={user.statusReason}
        changedAt={user.statusChangedAt}
        walletBalance={user.walletBalance}
        onChanged={fetchUser}
        onDeleted={() => router.back()}
      />

      {/* User Profile Card */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="bg-gradient-to-r from-purple-500 to-indigo-500 h-32"></div>
        <div className="px-6 pb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-end -mt-16 mb-6">
            <div className="relative">
              <div className="h-32 w-32 rounded-full bg-white p-2 shadow-lg">
                <div className="h-full w-full rounded-full bg-gray-200 flex items-center justify-center">
                  <UserIcon className="h-16 w-16 text-gray-400" />
                </div>
              </div>
            </div>

            <div className="mt-4 sm:mt-0 sm:ml-6 flex-1">
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold text-gray-900">
                  {user.displayName || `${user.firstName} ${user.lastName}`}
                </h2>
                <StatusBadge
                  status={user.accountStatus ?? 'ACTIVE'}
                  label={{ ACTIVE: 'Active', DEACTIVATED: 'Deactivated', SUSPENDED: 'Suspended', DELETED: 'Deleted' }[user.accountStatus ?? 'ACTIVE']}
                />
              </div>
              <p className="text-gray-500 mt-1">Hookup User</p>
            </div>
          </div>

          {/* Contact Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Contact Information</h3>

              <div className="flex items-center text-gray-700">
                <Mail className="h-5 w-5 mr-3 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{user.email}</p>
                </div>
              </div>

              <div className="flex items-center text-gray-700">
                <Phone className="h-5 w-5 mr-3 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-medium">{user.phone}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Account Details</h3>

              <div className="flex items-center text-gray-700">
                <Calendar className="h-5 w-5 mr-3 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Member Since</p>
                  <p className="font-medium">{new Date(user.createdAt).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="flex items-center text-gray-700">
                <DollarSign className="h-5 w-5 mr-3 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Wallet Balance</p>
                  <p className="font-medium">KSh {user.walletBalance.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Referral Information */}
          {user.referralCode && (
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Referral Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-500">Referral Code</p>
                  <p className="text-lg font-mono font-semibold text-gray-900">{user.referralCode}</p>
                </div>
                {user.referredBy && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-500">Referred By</p>
                    <p className="text-lg font-semibold text-gray-900">{user.referredBy}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3">
        <Link href={`/hookup-users`}>
          <button className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
            Back to List
          </button>
        </Link>
      </div>
    </div>
  );
}
