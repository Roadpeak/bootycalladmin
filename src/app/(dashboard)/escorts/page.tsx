'use client';

import { useState } from 'react';
import Link from 'next/link';
import { 
  Search, 
  Filter, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Shield, 
  Download, 
  Eye, 
  User, 
  Check, 
  X, 
  Calendar,
  Camera
} from 'lucide-react';

export default function EscortsPage() {
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [selectedEscort, setSelectedEscort] = useState<any>(null);
  
  // Mock data - in a real app, you'd fetch this from your API
  const stats = {
    totalEscorts: 1584,
    verified: 1023,
    pendingVerification: 34,
    pendingPayment: 527
  };

  const escorts = [
    { 
      id: 1, 
      name: 'Isabella Njeri', 
      age: 25,
      location: 'Westlands, Nairobi',
      phone: '254712345678',
      email: 'isabella@example.com',
      photos: ['https://randomuser.me/api/portraits/women/56.jpg'],
      isPaid: true,
      isVerified: true,
      isVip: true,
      joinDate: '2025-09-10',
      lastPaymentDate: '2025-10-15',
      verificationDate: '2025-09-12'
    },
    { 
      id: 2, 
      name: 'Sophia Wanjiku', 
      age: 23,
      location: 'Kilimani, Nairobi',
      phone: '254723456789',
      email: 'sophia@example.com',
      photos: ['https://randomuser.me/api/portraits/women/44.jpg'],
      isPaid: true,
      isVerified: true,
      isVip: false,
      joinDate: '2025-09-15',
      lastPaymentDate: '2025-10-10',
      verificationDate: '2025-09-18'
    },
    { 
      id: 3, 
      name: 'Olivia Muthoni', 
      age: 24,
      location: 'Lavington, Nairobi',
      phone: '254734567890',
      email: 'olivia@example.com',
      photos: ['https://randomuser.me/api/portraits/women/33.jpg'],
      isPaid: true,
      isVerified: false,
      isVip: false,
      joinDate: '2025-09-20',
      lastPaymentDate: '2025-10-18',
      verificationDate: null
    },
    { 
      id: 4, 
      name: 'Grace Akinyi', 
      age: 22,
      location: 'Kileleshwa, Nairobi',
      phone: '254745678901',
      email: 'grace@example.com',
      photos: ['https://randomuser.me/api/portraits/women/68.jpg'],
      isPaid: false,
      isVerified: false,
      isVip: false,
      joinDate: '2025-09-25',
      lastPaymentDate: null,
      verificationDate: null
    },
    { 
      id: 5, 
      name: 'Emily Atieno', 
      age: 26,
      location: 'Ruaka, Nairobi',
      phone: '254756789012',
      email: 'emily@example.com',
      photos: ['https://randomuser.me/api/portraits/women/22.jpg'],
      isPaid: false,
      isVerified: true,
      isVip: false,
      joinDate: '2025-09-30',
      lastPaymentDate: null,
      verificationDate: '2025-10-05'
    },
    { 
      id: 6, 
      name: 'Victoria Nekesa', 
      age: 25,
      location: 'Karen, Nairobi',
      phone: '254767890123',
      email: 'victoria@example.com',
      photos: ['https://randomuser.me/api/portraits/women/35.jpg'],
      isPaid: true,
      isVerified: true,
      isVip: false,
      joinDate: '2025-10-05',
      lastPaymentDate: '2025-10-08',
      verificationDate: '2025-10-10'
    },
    { 
      id: 7, 
      name: 'Hannah Wambui', 
      age: 23,
      location: 'South B, Nairobi',
      phone: '254778901234',
      email: 'hannah@example.com',
      photos: ['https://randomuser.me/api/portraits/women/15.jpg'],
      isPaid: false,
      isVerified: false,
      isVip: false,
      joinDate: '2025-10-10',
      lastPaymentDate: null,
      verificationDate: null
    }
  ];

  // Filter escorts based on active tab and search query
  const filteredEscorts = escorts
    .filter(escort => {
      if (activeTab === 'all') return true;
      if (activeTab === 'verified') return escort.isVerified;
      if (activeTab === 'unverified') return !escort.isVerified;
      if (activeTab === 'paid') return escort.isPaid;
      if (activeTab === 'unpaid') return !escort.isPaid;
      if (activeTab === 'vip') return escort.isVip;
      return true;
    })
    .filter(escort => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return (
        escort.name.toLowerCase().includes(query) ||
        escort.location.toLowerCase().includes(query) ||
        escort.phone.includes(query) ||
        escort.email.toLowerCase().includes(query)
      );
    });

  const handleVerifyEscort = (escort: any) => {
    setSelectedEscort(escort);
    setShowVerificationModal(true);
  };

  const handleApproveVerification = () => {
    // In a real app, you would make an API call here to update the escort's verification status
    console.log('Approving verification for escort ID:', selectedEscort?.id);
    setShowVerificationModal(false);
    // Then refresh data
  };

  const handleRejectVerification = () => {
    // In a real app, you would make an API call here
    console.log('Rejecting verification for escort ID:', selectedEscort?.id);
    setShowVerificationModal(false);
    // Then refresh data
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
              <User className="h-6 w-6 text-blue-600" />
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
              <p className="text-sm font-medium text-gray-500">Pending Payment</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">{stats.pendingPayment}</p>
            </div>
            <div className="bg-red-100 p-3 rounded-lg">
              <XCircle className="h-6 w-6 text-red-600" />
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
            onClick={() => setActiveTab('paid')}
            className={`px-6 py-3 text-sm font-medium whitespace-nowrap ${
              activeTab === 'paid'
                ? 'text-indigo-600 border-b-2 border-indigo-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Paid
          </button>
          <button
            onClick={() => setActiveTab('unpaid')}
            className={`px-6 py-3 text-sm font-medium whitespace-nowrap ${
              activeTab === 'unpaid'
                ? 'text-indigo-600 border-b-2 border-indigo-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Unpaid
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

        {/* Table */}
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
              {filteredEscorts.map((escort) => (
                <tr key={escort.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0">
                        <img className="h-10 w-10 rounded-full" src={escort.photos[0]} alt={escort.name} />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 flex items-center">
                          {escort.name}
                          {escort.isVip && (
                            <span className="ml-2 bg-gradient-to-r from-amber-400 to-yellow-500 text-white text-xs px-2 py-0.5 rounded-full">
                              VIP
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-500">{escort.age} years</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{escort.phone}</div>
                    <div className="text-sm text-gray-500">{escort.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {escort.location}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col space-y-1">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        escort.isPaid
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {escort.isPaid ? 'Paid' : 'Unpaid'}
                      </span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        escort.isVerified
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {escort.isVerified ? 'Verified' : 'Unverified'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {escort.joinDate}
                    {escort.lastPaymentDate && (
                      <div className="text-xs text-gray-400 mt-1">
                        Last payment: {escort.lastPaymentDate}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button 
                        className="text-indigo-600 hover:text-indigo-900 flex items-center"
                        onClick={() => console.log('View profile', escort.id)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </button>
                      
                      {!escort.isVerified && (
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
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty state */}
        {filteredEscorts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No escorts found matching your criteria</p>
          </div>
        )}

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
          <div className="text-sm text-gray-500">
            Showing <span className="font-medium">{filteredEscorts.length}</span> escorts
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
                      <img 
                        src={selectedEscort.photos[0]} 
                        alt={selectedEscort.name} 
                        className="h-16 w-16 rounded-full mr-4" 
                      />
                      <div>
                        <p className="text-lg font-medium text-gray-900">{selectedEscort.name}</p>
                        <p className="text-sm text-gray-600">{selectedEscort.age} years • {selectedEscort.location}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700">Contact Details</h4>
                    <div className="mt-2">
                      <p className="text-sm text-gray-600">Phone: {selectedEscort.phone}</p>
                      <p className="text-sm text-gray-600">Email: {selectedEscort.email}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-700">Account Information</h4>
                    <div className="mt-2">
                      <p className="text-sm text-gray-600">Joined: {selectedEscort.joinDate}</p>
                      <p className="text-sm text-gray-600">Payment Status: {selectedEscort.isPaid ? 'Paid' : 'Unpaid'}</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Verification Photos</h4>
                  <div className="border border-gray-200 rounded-lg p-4 bg-gray-50 flex items-center justify-center h-64">
                    <div className="text-center">
                      <Camera className="h-12 w-12 text-gray-400 mx-auto" />
                      <p className="text-sm text-gray-500 mt-2">Verification photos would be displayed here</p>
                      <p className="text-xs text-gray-400">In a real app, you'd display ID photos and verification selfies</p>
                    </div>
                  </div>
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