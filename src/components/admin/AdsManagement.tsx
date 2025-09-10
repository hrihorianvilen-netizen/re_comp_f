'use client';

import { useState } from 'react';

interface Ad {
  id: string;
  title: string;
  description?: string;
  imageUrl?: string;
  link?: string;
  type: 'banner' | 'sidebar' | 'popup';
  status: 'active' | 'inactive' | 'pending';
  createdAt: string;
  updatedAt: string;
}

// Mock data - replace with actual API call
const mockAds: Ad[] = [
  {
    id: '1',
    title: 'Summer Sale Banner',
    description: 'Promote summer deals',
    imageUrl: '/images/ads/summer-banner.jpg',
    link: 'https://example.com/summer-sale',
    type: 'banner',
    status: 'active',
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T10:30:00Z'
  },
  {
    id: '2',
    title: 'Newsletter Signup',
    description: 'Encourage newsletter subscriptions',
    type: 'sidebar',
    status: 'active',
    createdAt: '2024-01-14T15:45:00Z',
    updatedAt: '2024-01-14T15:45:00Z'
  }
];

type AdStatus = 'all' | 'active' | 'inactive' | 'pending';
type AdType = 'all' | 'banner' | 'sidebar' | 'popup';

export default function AdsManagement() {
  const [statusFilter, setStatusFilter] = useState<AdStatus>('all');
  const [typeFilter, setTypeFilter] = useState<AdType>('all');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [isLoading] = useState(false);

  const ads = mockAds;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'banner': return '🏷️';
      case 'sidebar': return '📱';
      case 'popup': return '💬';
      default: return '📢';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const filteredAds = ads.filter(ad => {
    const matchesStatus = statusFilter === 'all' || ad.status === statusFilter;
    const matchesType = typeFilter === 'all' || ad.type === typeFilter;
    return matchesStatus && matchesType;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#198639]"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Ads Management</h1>
          <p className="text-gray-600 mt-1">Manage advertisements and promotional content</p>
        </div>
        <button
          onClick={() => setShowCreateForm(true)}
          className="px-4 py-2 bg-[#198639] text-white rounded-md hover:bg-[#15732f] transition-colors"
        >
          + Create Ad
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Status Filter */}
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              id="status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as AdStatus)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#198639]"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="pending">Pending</option>
            </select>
          </div>

          {/* Type Filter */}
          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
              Type
            </label>
            <select
              id="type"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as AdType)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#198639]"
            >
              <option value="all">All Types</option>
              <option value="banner">Banner</option>
              <option value="sidebar">Sidebar</option>
              <option value="popup">Popup</option>
            </select>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-semibold text-[#198639]">{ads.length}</div>
              <div className="text-sm text-gray-600">Total Ads</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-semibold text-green-600">
                {ads.filter(a => a.status === 'active').length}
              </div>
              <div className="text-sm text-gray-600">Active</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-semibold text-gray-600">
                {ads.filter(a => a.status === 'inactive').length}
              </div>
              <div className="text-sm text-gray-600">Inactive</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-semibold text-yellow-600">
                {ads.filter(a => a.status === 'pending').length}
              </div>
              <div className="text-sm text-gray-600">Pending</div>
            </div>
          </div>
        </div>
      </div>

      {/* Ads Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredAds.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <div className="text-gray-500 text-xl mb-4">No ads found</div>
            <p className="text-gray-400">Create your first advertisement to get started.</p>
          </div>
        ) : (
          filteredAds.map((ad) => (
            <div key={ad.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              {/* Ad Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{getTypeIcon(ad.type)}</span>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{ad.title}</h3>
                    <span className="text-sm text-gray-500 capitalize">{ad.type} Ad</span>
                  </div>
                </div>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(ad.status)}`}>
                  {ad.status}
                </span>
              </div>

              {/* Ad Content */}
              {ad.description && (
                <p className="text-sm text-gray-700 mb-4">{ad.description}</p>
              )}

              {ad.imageUrl && (
                <div className="mb-4">
                  <img 
                    src={ad.imageUrl} 
                    alt={ad.title}
                    className="w-full h-32 object-cover rounded-md border"
                  />
                </div>
              )}

              {ad.link && (
                <div className="mb-4">
                  <label className="block text-xs font-medium text-gray-500 mb-1">Link:</label>
                  <a 
                    href={ad.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-[#198639] hover:underline break-all"
                  >
                    {ad.link}
                  </a>
                </div>
              )}

              {/* Ad Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="text-xs text-gray-500">
                  Created: {formatDate(ad.createdAt)}
                </div>
                <div className="flex space-x-2">
                  <button
                    className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                    onClick={() => console.log('Edit ad:', ad.id)}
                  >
                    Edit
                  </button>
                  <button
                    className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200"
                    onClick={() => console.log('Delete ad:', ad.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Ad Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-80 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-lg w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Create New Ad</h2>
              <button
                onClick={() => setShowCreateForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="text-center py-12">
              <div className="text-gray-500 mb-4">🚧</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Coming Soon</h3>
              <p className="text-gray-600">
                The ad creation form is under development. You can currently view and manage existing ads.
              </p>
              <button
                onClick={() => setShowCreateForm(false)}
                className="mt-4 px-4 py-2 bg-[#198639] text-white rounded-md hover:bg-[#15732f]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}