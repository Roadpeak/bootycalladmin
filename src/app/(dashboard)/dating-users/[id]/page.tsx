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
  Ban,
  CheckCircle,
  XCircle,
  AlertCircle,
  Heart,
  Clock
} from 'lucide-react';
import Link from 'next/link';

export default function DatingUserDetailPage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.id as string;

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

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

  async function handleToggleStatus() {
    if (!user) return;

    try {
      setActionLoading(true);
      await adminService.updateUserStatus(userId, {
        isActive: !user.isActive
      });
      await fetchUser(); // Refresh user data
    } catch (err) {
      alert(handleApiError(err));
    } finally {
      setActionLoading(false);
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

  const isPremium = user.datingSubscriptionExpiresAt && new Date(user.datingSubscriptionExpiresAt) > new Date();

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
          <h1 className="text-2xl font-semibold">Dating User Details</h1>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleToggleStatus}
            disabled={actionLoading}
            className={`flex items-center px-4 py-2 rounded-lg ${
              user.isActive
                ? 'bg-red-100 text-red-700 hover:bg-red-200'
                : 'bg-green-100 text-green-700 hover:bg-green-200'
            } disabled:opacity-50`}
          >
            {user.isActive ? (
              <>
                <Ban className="h-4 w-4 mr-2" />
                Suspend User
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4 mr-2" />
                Activate User
              </>
            )}
          </button>
        </div>
      </div>

      {/* User Profile Card */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="bg-gradient-to-r from-pink-500 to-purple-500 h-32"></div>
        <div className="px-6 pb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-end -mt-16 mb-6">
            <div className="relative">
              <div className="h-32 w-32 rounded-full bg-white p-2 shadow-lg">
                <div className="h-full w-full rounded-full bg-gray-200 flex items-center justify-center">
                  <UserIcon className="h-16 w-16 text-gray-400" />
                </div>
              </div>
              {isPremium && (
                <div className="absolute bottom-0 right-0 bg-gradient-to-r from-amber-400 to-yellow-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                  Premium
                </div>
              )}
            </div>

            <div className="mt-4 sm:mt-0 sm:ml-6 flex-1">
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold text-gray-900">
                  {user.displayName || `${user.firstName} ${user.lastName}`}
                </h2>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  user.isActive
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                }`}>
                  {user.isActive ? (
                    <>
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Active
                    </>
                  ) : (
                    <>
                      <XCircle className="h-4 w-4 mr-1" />
                      Suspended
                    </>
                  )}
                </span>
              </div>
              <p className="text-gray-500 mt-1">Dating User</p>
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

          {/* Subscription Information */}
          {user.datingSubscriptionExpiresAt && (
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Subscription Information</h3>
              <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Heart className="h-8 w-8 text-pink-500 mr-3" />
                    <div>
                      <p className="font-medium text-gray-900">Dating Premium Subscription</p>
                      <p className="text-sm text-gray-600">
                        {isPremium ? 'Active' : 'Expired'} •
                        Expires: {new Date(user.datingSubscriptionExpiresAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  {isPremium ? (
                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                      Active
                    </span>
                  ) : (
                    <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full text-sm font-medium">
                      Expired
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Referral Information */}
          {user.referralCode && (
            <div className="border-t border-gray-200 pt-6 mt-6">
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
        <Link href={`/dating-users`}>
          <button className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
            Back to List
          </button>
        </Link>
      </div>
    </div>
  );
}
