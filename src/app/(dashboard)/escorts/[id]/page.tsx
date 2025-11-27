'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { adminService, handleApiError } from '@/lib/api';
import type { Escort } from '@/types/api';
import {
  ArrowLeft,
  Phone,
  MapPin,
  Calendar,
  Shield,
  DollarSign,
  User as UserIcon,
  CheckCircle,
  XCircle,
  AlertCircle,
  Star,
  Eye,
  Camera,
  Clock,
  Languages,
  Tag
} from 'lucide-react';
import Link from 'next/link';

export default function EscortDetailPage() {
  const router = useRouter();
  const params = useParams();
  const escortId = params.id as string;

  const [escort, setEscort] = useState<Escort | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (escortId) {
      fetchEscort();
    }
  }, [escortId]);

  async function fetchEscort() {
    try {
      setLoading(true);
      setError(null);

      // Fetch from escorts list and find the specific one
      const response = await adminService.getEscorts({ page: 1, limit: 100 });
      const foundEscort = response.data?.find(e => e.id === escortId);

      if (foundEscort) {
        setEscort(foundEscort);
      } else {
        setError('Escort not found');
      }
    } catch (err) {
      setError(handleApiError(err));
      console.error('Error fetching escort:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleVerify(verified: boolean) {
    if (!escort) return;

    try {
      setActionLoading(true);
      await adminService.verifyEscort(escortId, { verified });
      await fetchEscort(); // Refresh escort data
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
          <p className="mt-4 text-gray-600">Loading escort details...</p>
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
          <h1 className="text-2xl font-semibold">Escort Details</h1>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
            <h3 className="text-red-800 font-medium">Error Loading Escort</h3>
          </div>
          <p className="mt-2 text-red-700 text-sm">{error}</p>
          <button
            onClick={fetchEscort}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!escort) {
    return (
      <div className="space-y-6">
        <div className="flex items-center">
          <button
            onClick={() => router.back()}
            className="mr-4 p-2 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-2xl font-semibold">Escort Details</h1>
        </div>
        <div className="text-center py-12">
          <p className="text-gray-600">Escort not found</p>
        </div>
      </div>
    );
  }

  const isVip = escort.vipStatus && (!escort.vipExpiresAt || new Date(escort.vipExpiresAt) > new Date());

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
          <h1 className="text-2xl font-semibold">Escort Profile</h1>
        </div>

        <div className="flex gap-3">
          {!escort.verified && (
            <button
              onClick={() => handleVerify(true)}
              disabled={actionLoading}
              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
            >
              <Shield className="h-4 w-4 mr-2" />
              Verify Escort
            </button>
          )}
          {escort.verified && (
            <button
              onClick={() => handleVerify(false)}
              disabled={actionLoading}
              className="flex items-center px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 disabled:opacity-50"
            >
              <XCircle className="h-4 w-4 mr-2" />
              Unverify
            </button>
          )}
        </div>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-32"></div>
        <div className="px-6 pb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-end -mt-16 mb-6">
            <div className="relative">
              {escort.photos && escort.photos.length > 0 ? (
                <img
                  src={escort.photos[0]}
                  alt={escort.name}
                  className="h-32 w-32 rounded-full object-cover border-4 border-white shadow-lg"
                />
              ) : (
                <div className="h-32 w-32 rounded-full bg-white border-4 border-white shadow-lg flex items-center justify-center">
                  <UserIcon className="h-16 w-16 text-gray-400" />
                </div>
              )}
              {isVip && (
                <div className="absolute bottom-0 right-0 bg-gradient-to-r from-amber-400 to-yellow-500 text-white text-xs px-2 py-1 rounded-full font-medium">
                  VIP
                </div>
              )}
            </div>

            <div className="mt-4 sm:mt-0 sm:ml-6 flex-1">
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className="text-2xl font-bold text-gray-900">{escort.name}</h2>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  escort.verified
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {escort.verified ? (
                    <>
                      <Shield className="h-4 w-4 mr-1" />
                      Verified
                    </>
                  ) : (
                    <>
                      <Clock className="h-4 w-4 mr-1" />
                      Pending Verification
                    </>
                  )}
                </span>
              </div>
              <p className="text-gray-500 mt-1">{escort.age ? `${escort.age} years` : 'Age not specified'}</p>

              {/* Rating */}
              <div className="flex items-center mt-2">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < Math.round(escort.averageRating)
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
                <span className="ml-2 text-sm text-gray-600">
                  {escort.averageRating.toFixed(1)} ({escort.reviewCount} reviews)
                </span>
                <span className="ml-4 text-sm text-gray-600 flex items-center">
                  <Eye className="h-4 w-4 mr-1" />
                  {escort.totalViews.toLocaleString()} views
                </span>
              </div>
            </div>
          </div>

          {/* About */}
          {escort.about && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">About</h3>
              <p className="text-gray-700">{escort.about}</p>
            </div>
          )}

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Contact Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Contact Information</h3>

              <div className="flex items-center text-gray-700">
                <Phone className="h-5 w-5 mr-3 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Phone</p>
                  <p className="font-medium">{escort.contactPhone}</p>
                </div>
              </div>

              {escort.user && (
                <div className="flex items-center text-gray-700">
                  <UserIcon className="h-5 w-5 mr-3 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">User Account</p>
                    <p className="font-medium">
                      {escort.user.displayName || `${escort.user.firstName} ${escort.user.lastName || ''}`.trim()}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Location & Pricing */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Location & Pricing</h3>

              {escort.locations && (
                <div className="flex items-start text-gray-700">
                  <MapPin className="h-5 w-5 mr-3 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm text-gray-500">Location</p>
                    <p className="font-medium">{escort.locations.city || 'N/A'}</p>
                    {escort.locations.regions && escort.locations.regions.length > 0 && (
                      <p className="text-sm text-gray-500">{escort.locations.regions.join(', ')}</p>
                    )}
                  </div>
                </div>
              )}

              {escort.pricing && (
                <div className="flex items-center text-gray-700">
                  <DollarSign className="h-5 w-5 mr-3 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Hourly Rate</p>
                    <p className="font-medium">KSh {escort.pricing.hourlyRate.toLocaleString()}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Services */}
          {escort.services && escort.services.length > 0 && (
            <div className="border-t border-gray-200 pt-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Services Offered</h3>
              <div className="flex flex-wrap gap-2">
                {escort.services.map((service, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800"
                  >
                    {service.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Availability */}
          {escort.availability && (
            <div className="border-t border-gray-200 pt-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Availability</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {escort.availability.days && escort.availability.days.length > 0 && (
                  <div>
                    <p className="text-sm text-gray-500 mb-2">Days Available</p>
                    <div className="flex flex-wrap gap-2">
                      {escort.availability.days.map((day, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800"
                        >
                          {day}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {escort.availability.hours && (
                  <div>
                    <p className="text-sm text-gray-500 mb-2">Hours</p>
                    <p className="font-medium text-gray-900">{escort.availability.hours}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Languages & Tags */}
          <div className="border-t border-gray-200 pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            {escort.languages && escort.languages.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Languages</h3>
                <div className="flex flex-wrap gap-2">
                  {escort.languages.map((language, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                    >
                      {language}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {escort.tags && escort.tags.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {escort.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Photos */}
          {escort.photos && escort.photos.length > 0 && (
            <div className="border-t border-gray-200 pt-6 mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Photos</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {escort.photos.map((photo, index) => (
                  <img
                    key={index}
                    src={photo}
                    alt={`${escort.name} photo ${index + 1}`}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                ))}
              </div>
            </div>
          )}

          {/* Account Information */}
          <div className="border-t border-gray-200 pt-6 mt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-500">Joined</p>
                <p className="font-semibold text-gray-900">{new Date(escort.createdAt).toLocaleDateString()}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-500">Unlock Price</p>
                <p className="font-semibold text-gray-900">KSh {escort.unlockPrice.toLocaleString()}</p>
              </div>
              {escort.experienceYears && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-500">Experience</p>
                  <p className="font-semibold text-gray-900">{escort.experienceYears} years</p>
                </div>
              )}
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-500">Status</p>
                <p className="font-semibold text-gray-900">{escort.moderationStatus}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3">
        <Link href="/escorts">
          <button className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
            Back to List
          </button>
        </Link>
      </div>
    </div>
  );
}
