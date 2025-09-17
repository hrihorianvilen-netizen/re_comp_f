'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import OptimizedImage from '@/components/ui/OptimizedImage';
import { Merchant } from '@/types/api';
import { RatingStars } from '@/components/ui';
import api from '@/lib/api';
import { getImageUrl } from '@/lib/utils';

const statusColors = {
  approved: 'bg-green-100 text-green-800',
  pending: 'bg-yellow-100 text-yellow-800',
  draft: 'bg-orange-100 text-orange-800',
  suspended: 'bg-red-100 text-red-800',
  rejected: 'bg-gray-100 text-gray-800',
  recommended: 'bg-green-100 text-green-800',
  trusted: 'bg-blue-100 text-blue-800',
  controversial: 'bg-yellow-100 text-yellow-800',
  avoid: 'bg-red-100 text-red-800',
  neutral: 'bg-gray-100 text-gray-800',
};

export default function AdminMerchantsPage() {
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMerchants, setSelectedMerchants] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalMerchants, setTotalMerchants] = useState(0);
  const itemsPerPage = 10;

  const loadMerchants = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params: { [key: string]: string | number } = {
        page: currentPage,
        limit: itemsPerPage,
      };

      if (selectedStatus !== 'all') {
        params.status = selectedStatus;
      }

      if (searchQuery.trim()) {
        params.query = searchQuery.trim();
      }

      const response = await api.getAdminMerchants(params);

      if (response.error) {
        setError(response.error);
      } else if (response.data) {
        setMerchants(response.data.merchants || []);
        const pagination = response.data.pagination;
        if (pagination) {
          setTotalPages(pagination.pages || 0);
          setTotalMerchants(pagination.total || 0);
        }
      }
    } catch (err) {
      console.error('Failed to load merchants:', err);
      setError('Failed to load merchants. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [currentPage, selectedStatus, searchQuery]);

  // Load merchants from backend
  useEffect(() => {
    loadMerchants();
  }, [loadMerchants]);

  const handleDelete = async (merchantId: string) => {
    if (!confirm('Are you sure you want to delete this merchant? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await api.deleteAdminMerchant(merchantId);
      if (response.error) {
        alert(`Failed to delete merchant: ${response.error}`);
      } else {
        alert('Merchant deleted successfully');
        loadMerchants(); // Reload the list
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete merchant. Please try again.');
    }
  };

  const handleBulkAction = async (action: 'publish' | 'deactivate') => {
    if (selectedMerchants.length === 0) {
      alert('Please select merchants to perform bulk action.');
      return;
    }

    if (!confirm(`Are you sure you want to ${action} ${selectedMerchants.length} merchant(s)?`)) {
      return;
    }

    try {
      const response = await api.bulkActionMerchants(action, selectedMerchants);
      if (response.error) {
        alert(`Bulk action failed: ${response.error}`);
      } else {
        alert(`Successfully ${action}ed ${selectedMerchants.length} merchant(s)`);
        setSelectedMerchants([]);
        loadMerchants(); // Reload the list
      }
    } catch (error) {
      console.error('Bulk action error:', error);
      alert('Bulk action failed. Please try again.');
    }
  };

  const handleSelectAll = () => {
    if (selectedMerchants.length === merchants.length) {
      setSelectedMerchants([]);
    } else {
      setSelectedMerchants(merchants.map(m => m.id));
    }
  };

  const handleSelectMerchant = (merchantId: string) => {
    if (selectedMerchants.includes(merchantId)) {
      setSelectedMerchants(selectedMerchants.filter(id => id !== merchantId));
    } else {
      setSelectedMerchants([...selectedMerchants, merchantId]);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to first page when searching
    // loadMerchants will be called by useEffect due to dependency change
  };

  const handleStatusChange = (status: string) => {
    setSelectedStatus(status);
    setCurrentPage(1); // Reset to first page when filtering
    // loadMerchants will be called by useEffect due to dependency change
  };

  // Loading state
  if (loading && merchants.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#198639] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading merchants...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && merchants.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <svg className="w-24 h-24 text-red-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Merchants</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={loadMerchants}
            className="bg-[#198639] text-white px-4 py-2 rounded hover:bg-[#15732f]"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Merchants</h1>
          <p className="text-gray-600">Manage and review merchant listings</p>
        </div>
        <Link
          href="/admin/merchants/new"
          className="bg-[#A96B11] text-white px-4 py-2 rounded-md hover:bg-[#8b5609] font-medium"
        >
          Add New Merchant
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm mb-6">
        <div className="p-4">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            {/* Search */}
            <form onSubmit={handleSearch} className="flex gap-2 flex-1 max-w-md">
              <input
                type="text"
                placeholder="Search merchants..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#A96B11]"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-[#A96B11] text-white rounded-md hover:bg-[#8b5609]"
              >
                Search
              </button>
            </form>

            {/* Status Filter */}
            <div className="flex gap-2 flex-wrap">
              {['all', 'draft', 'pending', 'recommended', 'trusted', 'neutral', 'controversial', 'avoid'].map((status) => (
                <button
                  key={status}
                  onClick={() => handleStatusChange(status)}
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    selectedStatus === status
                      ? 'bg-[#A96B11] text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedMerchants.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm mb-6">
          <div className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">
                {selectedMerchants.length} merchant(s) selected
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => handleBulkAction('publish')}
                  className="px-3 py-1 bg-green-100 text-green-800 rounded text-sm hover:bg-green-200"
                >
                  Approve
                </button>
                <button
                  onClick={() => handleBulkAction('deactivate')}
                  className="px-3 py-1 bg-red-100 text-red-800 rounded text-sm hover:bg-red-200"
                >
                  Suspend
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Merchants Table */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedMerchants.length === merchants.length && merchants.length > 0}
                    onChange={handleSelectAll}
                    className="w-4 h-4 rounded border-gray-300"
                  />
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Merchant</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Category</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Rating</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Status</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Created</th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-900">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {merchants.map((merchant) => (
                <tr key={merchant.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedMerchants.includes(merchant.id)}
                      onChange={() => handleSelectMerchant(merchant.id)}
                      className="w-4 h-4 rounded border-gray-300"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <OptimizedImage
                        src={getImageUrl(merchant.logo, '/images/shopee.jpg')}
                        alt={merchant.name}
                        width={40}
                        height={40}
                        className="rounded-lg"
                        sizeType="thumbnail"
                        qualityPriority="medium"
                      />
                      <div>
                        <Link
                          href={(merchant.status === 'pending' || merchant.status === 'draft') ? `/admin/merchants/${merchant.id}/edit` : `/admin/merchants/${merchant.id}`}
                          className="font-medium text-gray-900 hover:text-[#A96B11]"
                        >
                          {merchant.name}
                        </Link>
                        <p className="text-sm text-gray-500">
                          {merchant.description?.length > 50
                            ? `${merchant.description.substring(0, 50)}...`
                            : merchant.description}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {merchant.category}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <RatingStars rating={merchant.rating || 0} size={16} />
                      <span className="text-sm text-gray-600">
                        {(merchant.rating || 0).toFixed(1)} ({merchant.reviewCount || 0})
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      statusColors[merchant.status as keyof typeof statusColors] || statusColors.neutral
                    }`}>
                      {(merchant.status || 'neutral').charAt(0).toUpperCase() + (merchant.status || 'neutral').slice(1)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {new Date(merchant.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/merchants/${merchant.slug}`}
                        className="text-gray-400 hover:text-gray-600"
                        target="_blank"
                        title="View"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </Link>
                      <Link
                        href={(merchant.status === 'pending' || merchant.status === 'draft') ? `/admin/merchants/${merchant.id}/edit` : `/admin/merchants/${merchant.id}`}
                        className="text-gray-400 hover:text-[#A96B11]"
                        title={(merchant.status === 'pending' || merchant.status === 'draft') ? 'Edit Draft' : 'Edit'}
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </Link>
                      <button
                        onClick={() => handleDelete(merchant.id)}
                        className="text-gray-400 hover:text-red-600"
                        title="Delete"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-4 py-3 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalMerchants)} of {totalMerchants} merchants
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 rounded-md border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                >
                  Previous
                </button>
                
                <div className="flex gap-1">
                  {[...Array(Math.min(5, totalPages))].map((_, index) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = index + 1;
                    } else if (currentPage <= 3) {
                      pageNum = index + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + index;
                    } else {
                      pageNum = currentPage - 2 + index;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`px-3 py-1 rounded-md border ${
                          currentPage === pageNum
                            ? 'bg-[#A96B11] text-white border-[#A96B11]'
                            : 'border-gray-300 hover:bg-gray-100'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 rounded-md border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {merchants.length === 0 && !loading && (
          <div className="text-center py-12">
            <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a1 1 0 011-1h6a1 1 0 011 1v2M7 7h10" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No merchants found</h3>
            <p className="text-gray-600 mb-4">
              {searchQuery || selectedStatus !== 'all' 
                ? 'Try adjusting your search or filter criteria.' 
                : 'Get started by adding your first merchant.'}
            </p>
            {(!searchQuery && selectedStatus === 'all') && (
              <Link
                href="/admin/merchants/new"
                className="inline-flex items-center px-4 py-2 bg-[#A96B11] text-white rounded-md hover:bg-[#8b5609]"
              >
                Add New Merchant
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}