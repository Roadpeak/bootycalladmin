'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { adminService, handleApiError } from '@/lib/api';
import type { Escort } from '@/types/api';
import {
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Clock,
  Shield,
  Download,
  Eye,
  User as UserIcon,
  Check,
  X,
  Calendar,
  Camera,
  AlertCircle
} from 'lucide-react';

export default function EscortsPage() {
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [selectedEscort, setSelectedEscort] = useState<Escort | null>(null);
  const [escorts, setEscorts] = useState<Escort[]>([]);
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
    totalEscorts: pagination.total,
    verified: escorts.filter(e => e.verified).length,
    pendingVerification: escorts.filter(e => !e.verified).length,
    vipEscorts: escorts.filter(e => e.vipStatus && (!e.vipExpiresAt || new Date(e.vipExpiresAt) > new Date())).length
  };

  // Fetch escorts from API
  useEffect(() => {
    fetchEscorts();
  }, [currentPage, searchQuery, activeTab]);

  async function fetchEscorts() {
    try {
      setLoading(true);
      setError(null);

      const params: any = {
        page: currentPage,
        limit: 20,
        search: searchQuery || undefined
      };

      // Add filter params based on active tab
      if (activeTab === 'verified') params.verified = true;
      if (activeTab === 'unverified') params.verified = false;
      if (activeTab === 'vip') params.vipStatus = true;

      const response = await adminService.getEscorts(params);

      if (response.data) {
        setEscorts(response.data);
      }

      if (response.pagination) {
        setPagination(response.pagination);
      }
    } catch (err) {
      setError(handleApiError(err));
      console.error('Error fetching escorts:', err);
    } finally {
      setLoading(false);
    }
  }

  // Filter escorts based on active tab (client-side for tabs not handled by API)
  const filteredEscorts = escorts.filter(escort => {
    if (activeTab === 'all') return true;
    if (activeTab === 'verified') return escort.verified;
    if (activeTab === 'unverified') return !escort.verified;
    if (activeTab === 'vip') return escort.vipStatus && (!escort.vipExpiresAt || new Date(escort.vipExpiresAt) > new Date());
    return true;
  });

  const handleVerifyEscort = (escort: Escort) => {
    setSelectedEscort(escort);
    setShowVerificationModal(true);
  };

  const handleApproveVerification = async () => {
    if (!selectedEscort) return;

    try {
      await adminService.verifyEscort(selectedEscort.id, {
        verified: true
      });
      setShowVerificationModal(false);
      fetchEscorts(); // Refresh the list
    } catch (err) {
      alert(handleApiError(err));
    }
  };

  const handleRejectVerification = async () => {
    if (!selectedEscort) return;

    try {
      await adminService.verifyEscort(selectedEscort.id, {
        verified: false,
        notes: 'Verification rejected by admin'
      });
      setShowVerificationModal(false);
      fetchEscorts(); // Refresh the list
    } catch (err) {
      alert(handleApiError(err));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Escorts</h1>
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
              <p className="text-sm font-medium text-gray-500">Total Escorts</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{stats.totalEscorts}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <UserIcon className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Verified</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{stats.verified}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <Shield className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">Pending Verification</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{stats.pendingVerification}</p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-lg">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-500">VIP Escorts</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{stats.vipEscorts}</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <CheckCircle className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Escorts List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <h2 className="text-lg font-medium text-gray-900">Escorts List</h2>

          {/* Search */}
          <div className="relative max-w-xs w-full">
            <input
              type="text"
              placeholder="Search escorts..."
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
            All Escorts
          </button>
          <button
            onClick={() => setActiveTab('verified')}
            className={`px-6 py-3 text-sm font-medium whitespace-nowrap ${
              activeTab === 'verified'
                ? 'text-indigo-600 border-b-2 border-indigo-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Verified
          </button>
          <button
            onClick={() => setActiveTab('unverified')}
            className={`px-6 py-3 text-sm font-medium whitespace-nowrap ${
              activeTab === 'unverified'
                ? 'text-indigo-600 border-b-2 border-indigo-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Unverified
          </button>
          <button
            onClick={() => setActiveTab('vip')}
            className={`px-6 py-3 text-sm font-medium whitespace-nowrap ${
              activeTab === 'vip'
                ? 'text-indigo-600 border-b-2 border-indigo-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            VIP
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
                  <h3 className="text-sm font-medium text-red-800">Error Loading Escorts</h3>
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Escort
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rate
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Subscription
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Join Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredEscorts.map((escort) => {
                  const isVip = escort.vipStatus && (!escort.vipExpiresAt || new Date(escort.vipExpiresAt) > new Date());

                  return (
                    <tr key={escort.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0">
                            {escort.photos && escort.photos.length > 0 ? (
                              <img className="h-10 w-10 rounded-full object-cover" src={escort.photos[0]} alt={escort.name} />
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                                <UserIcon className="h-5 w-5 text-purple-600" />
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 flex items-center">
                              {escort.name}
                              {isVip && (
                                <span className="ml-2 bg-gradient-to-r from-amber-400 to-yellow-500 text-white text-xs px-2 py-0.5 rounded-full">
                                  VIP
                                </span>
                              )}
                            </div>
                            <div className="text-sm text-gray-500">
                              {escort.age ? `${escort.age} years` : 'Age not specified'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{escort.contactPhone}</div>
                        <div className="text-sm text-gray-500">
                          {escort.user?.displayName || `${escort.user?.firstName} ${escort.user?.lastName || ''}`.trim() || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {escort.locations?.city || 'N/A'}
                        {escort.locations?.regions && escort.locations.regions.length > 0 && (
                          <div className="text-xs text-gray-400 mt-1">
                            {escort.locations.regions.slice(0, 2).join(', ')}
                            {escort.locations.regions.length > 2 && ' +' + (escort.locations.regions.length - 2)}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                        {escort.pricing?.hourlyRate ? `KSh ${escort.pricing.hourlyRate.toLocaleString()}/hr` : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {isVip ? (
                          <div className="flex flex-col">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                              VIP
                            </span>
                            {escort.vipExpiresAt && (
                              <span className="text-xs text-gray-500 mt-1">
                                Until {new Date(escort.vipExpiresAt).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-gray-400">Free</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          escort.verified
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {escort.verified ? 'Verified' : 'Unverified'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(escort.createdAt).toLocaleDateString()}
                        {escort.updatedAt && (
                          <div className="text-xs text-gray-400 mt-1">
                            Updated: {new Date(escort.updatedAt).toLocaleDateString()}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <Link href={`/escorts/${escort.id}`}>
                            <button className="text-indigo-600 hover:text-indigo-900 flex items-center">
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </button>
                          </Link>

                          {!escort.verified && (
                            <button
                              className="text-green-600 hover:text-green-900 flex items-center ml-2"
                              onClick={() => handleVerifyEscort(escort)}
                            >
                              <Shield className="h-4 w-4 mr-1" />
                              Verify
                            </button>
                          )}
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
        {!loading && !error && filteredEscorts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No escorts found matching your criteria</p>
          </div>
        )}

        {/* Pagination */}
        {!loading && !error && filteredEscorts.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Showing <span className="font-medium">{((pagination.page - 1) * pagination.limit) + 1}</span> to{' '}
              <span className="font-medium">{Math.min(pagination.page * pagination.limit, pagination.total)}</span> of{' '}
              <span className="font-medium">{pagination.total}</span> escorts
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

      {/* Verification Modal */}
      {showVerificationModal && selectedEscort && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">Verification Review</h3>
              <button
                onClick={() => setShowVerificationModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700">Escort Information</h4>
                    <div className="mt-2 flex items-center">
                      {selectedEscort.photos && selectedEscort.photos.length > 0 ? (
                        <img
                          src={selectedEscort.photos[0]}
                          alt={selectedEscort.name}
                          className="h-16 w-16 rounded-full object-cover mr-4"
                        />
                      ) : (
                        <div className="h-16 w-16 rounded-full bg-purple-100 flex items-center justify-center mr-4">
                          <UserIcon className="h-8 w-8 text-purple-600" />
                        </div>
                      )}
                      <div>
                        <p className="text-lg font-medium text-gray-900">{selectedEscort.name}</p>
                        <p className="text-sm text-gray-600">
                          {selectedEscort.age ? `${selectedEscort.age} years` : 'Age not specified'} • {selectedEscort.locations?.city || 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700">Contact Details</h4>
                    <div className="mt-2">
                      <p className="text-sm text-gray-600">Phone: {selectedEscort.contactPhone}</p>
                      <p className="text-sm text-gray-600">
                        User: {selectedEscort.user?.displayName || `${selectedEscort.user?.firstName} ${selectedEscort.user?.lastName || ''}`.trim() || 'N/A'}
                      </p>
                    </div>
                  </div>

                  {selectedEscort.locations && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-700">Location & Regions</h4>
                      <div className="mt-2">
                        <p className="text-sm text-gray-600">City: {selectedEscort.locations.city || 'N/A'}</p>
                        {selectedEscort.locations.regions && selectedEscort.locations.regions.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {selectedEscort.locations.regions.map((region, index) => (
                              <span key={index} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                                {region}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {selectedEscort.pricing && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-700">Services & Pricing</h4>
                      <div className="mt-2">
                        <p className="text-sm text-gray-600 font-medium">
                          Hourly Rate: {selectedEscort.pricing.hourlyRate ? `KSh ${selectedEscort.pricing.hourlyRate.toLocaleString()}` : 'N/A'}
                        </p>
                        {selectedEscort.pricing.services && selectedEscort.pricing.services.length > 0 && (
                          <div className="mt-2 space-y-1">
                            <p className="text-xs text-gray-500">Additional Services:</p>
                            {selectedEscort.pricing.services.map((service, index) => (
                              <div key={index} className="text-xs text-gray-600 flex justify-between">
                                <span>{service.name}</span>
                                <span className="font-medium">KSh {service.price.toLocaleString()}</span>
                              </div>
                            ))}
                          </div>
                        )}
                        {selectedEscort.services && selectedEscort.services.length > 0 && (
                          <div className="mt-2">
                            <p className="text-xs text-gray-500 mb-1">Services Offered:</p>
                            <div className="flex flex-wrap gap-1">
                              {selectedEscort.services.map((service, index) => (
                                <span key={index} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800">
                                  {service.name}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {selectedEscort.availability && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-700">Availability</h4>
                      <div className="mt-2">
                        {selectedEscort.availability.days && selectedEscort.availability.days.length > 0 && (
                          <div className="mb-2">
                            <p className="text-xs text-gray-500 mb-1">Days:</p>
                            <div className="flex flex-wrap gap-1">
                              {selectedEscort.availability.days.map((day, index) => (
                                <span key={index} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                  {day}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        {selectedEscort.availability.hours && (
                          <p className="text-sm text-gray-600">Hours: {selectedEscort.availability.hours}</p>
                        )}
                      </div>
                    </div>
                  )}

                  <div>
                    <h4 className="text-sm font-medium text-gray-700">Account Information</h4>
                    <div className="mt-2">
                      <p className="text-sm text-gray-600">Joined: {new Date(selectedEscort.createdAt).toLocaleDateString()}</p>
                      <p className="text-sm text-gray-600">Status: {selectedEscort.verified ? 'Verified' : 'Unverified'}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Photos</h4>
                  {selectedEscort.photos && selectedEscort.photos.length > 0 ? (
                    <div className="grid grid-cols-2 gap-2">
                      {selectedEscort.photos.map((photo, index) => (
                        <img
                          key={index}
                          src={photo}
                          alt={`Photo ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 flex items-center justify-center h-64">
                      <div className="text-center">
                        <Camera className="h-12 w-12 text-gray-400 mx-auto" />
                        <p className="text-sm text-gray-500 mt-2">No photos available</p>
                      </div>
                    </div>
                  )}

                  {selectedEscort.about && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">About</h4>
                      <p className="text-sm text-gray-600">{selectedEscort.about}</p>
                    </div>
                  )}

                  {selectedEscort.languages && selectedEscort.languages.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Languages</h4>
                      <div className="flex flex-wrap gap-1">
                        {selectedEscort.languages.map((language, index) => (
                          <span key={index} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                            {language}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedEscort.tags && selectedEscort.tags.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Tags</h4>
                      <div className="flex flex-wrap gap-1">
                        {selectedEscort.tags.map((tag, index) => (
                          <span key={index} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-8 flex justify-end gap-4">
                <button
                  onClick={handleRejectVerification}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center"
                >
                  <X className="h-4 w-4 mr-2 text-red-600" />
                  Reject Verification
                </button>
                <button
                  onClick={handleApproveVerification}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center"
                >
                  <Check className="h-4 w-4 mr-2" />
                  Approve Verification
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
