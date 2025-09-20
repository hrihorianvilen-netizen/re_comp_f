'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';
import { toast } from 'react-hot-toast';
import { stripHtmlTags } from '@/lib/htmlUtils';
import LoadingOverlay from '@/components/ui/LoadingOverlay';

interface Promotion {
  id: string;
  title: string;
  description: string;
  type: string;
  merchantId: string;
  merchantName?: string;
  startDate: string | null;
  endDate: string | null;
  giftcodes?: string;
  loginRequired: boolean;
  reviewRequired: boolean;
  isActive: boolean;
  createdAt: string;
  merchant?: {
    id: string;
    name: string;
    slug: string;
  };
}

export default function AllPromotionsPage() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [typeCounts, setTypeCounts] = useState<Record<string, number>>({ all: 0, DEFAULT: 0, COMMON: 0, PRIVATE: 0 });
  const itemsPerPage = 10;

  useEffect(() => {
    fetchPromotions();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, searchQuery, filterType]);

  const fetchPromotions = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        ...(searchQuery && { search: searchQuery }),
        ...(filterType !== 'all' && { type: filterType })
      });

      const response = await api.get<{
        promotions: Promotion[];
        pagination?: {
          page: number;
          limit: number;
          total: number;
          pages: number;
        }
      }>(`/api/admin/promotions?${params}`);
      if (response.data) {
        const fetchedPromotions = response.data.promotions || [];
        setPromotions(fetchedPromotions);
        setTotalPages(response.data.pagination?.pages || 1);

        // Calculate type counts
        const counts = { all: 0, DEFAULT: 0, COMMON: 0, PRIVATE: 0 };
        fetchedPromotions.forEach((promo: Promotion) => {
          counts.all++;
          if (promo.type in counts) {
            counts[promo.type as keyof typeof counts]++;
          }
        });
        setTypeCounts(counts);
      }
    } catch (error) {
      console.error('Error fetching promotions:', error);
      toast.error('Failed to load promotions');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this promotion?')) return;

    setIsProcessing(true);
    try {
      await api.delete(`/api/admin/promotions/${id}`);
      toast.success('Promotion deleted successfully');
      await fetchPromotions();
    } catch (error) {
      console.error('Error deleting promotion:', error);
      toast.error('Failed to delete promotion');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    setIsProcessing(true);
    try {
      await api.patch(`/api/admin/promotions/${id}`, { isActive: !isActive });
      toast.success(`Promotion ${!isActive ? 'activated' : 'deactivated'} successfully`);
      await fetchPromotions();
    } catch (error) {
      console.error('Error toggling promotion:', error);
      toast.error('Failed to update promotion status');
    } finally {
      setIsProcessing(false);
    }
  };

  const getTypeLabel = (type: string) => {
    const typeMap: Record<string, string> = {
      'DEFAULT': 'Default',
      'COMMON': 'Common',
      'PRIVATE': 'Private'
    };
    return typeMap[type] || type;
  };

  const getTypeColor = (type: string) => {
    const colorMap: Record<string, string> = {
      'DEFAULT': 'bg-blue-100 text-blue-800',
      'COMMON': 'bg-green-100 text-green-800',
      'PRIVATE': 'bg-purple-100 text-purple-800'
    };
    return colorMap[type] || 'bg-gray-100 text-gray-800';
  };

  const filteredPromotions = promotions;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">All Promotions</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage all promotions across merchants
          </p>
        </div>
        <Link
          href="/admin/promotions/new"
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#A96B11] hover:bg-[#8B560E]"
        >
          <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Promotion
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow">
        {/* Search Bar */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Search
          </label>
          <input
            type="text"
            placeholder="Search by title or merchant..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full max-w-md px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#A96B11]"
          />
        </div>

        {/* Type Tabs */}
        <div className="flex flex-wrap gap-2 border-b border-gray-200">
          <button
            onClick={() => {
              setFilterType('all');
              setCurrentPage(1);
            }}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              filterType === 'all'
                ? 'text-[#A96B11] border-[#A96B11]'
                : 'text-gray-600 border-transparent hover:text-gray-800'
            }`}
          >
            All ({typeCounts.all})
          </button>
          <button
            onClick={() => {
              setFilterType('DEFAULT');
              setCurrentPage(1);
            }}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              filterType === 'DEFAULT'
                ? 'text-[#A96B11] border-[#A96B11]'
                : 'text-gray-600 border-transparent hover:text-gray-800'
            }`}
          >
            Default ({typeCounts.DEFAULT})
          </button>
          <button
            onClick={() => {
              setFilterType('COMMON');
              setCurrentPage(1);
            }}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              filterType === 'COMMON'
                ? 'text-[#A96B11] border-[#A96B11]'
                : 'text-gray-600 border-transparent hover:text-gray-800'
            }`}
          >
            Common ({typeCounts.COMMON})
          </button>
          <button
            onClick={() => {
              setFilterType('PRIVATE');
              setCurrentPage(1);
            }}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              filterType === 'PRIVATE'
                ? 'text-[#A96B11] border-[#A96B11]'
                : 'text-gray-600 border-transparent hover:text-gray-800'
            }`}
          >
            Private ({typeCounts.PRIVATE})
          </button>
        </div>
      </div>

      {/* Promotions Table */}
      <div className="bg-white shadow rounded-lg">
        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-flex items-center">
              <svg className="animate-spin h-8 w-8 text-[#FF6B2C]" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span className="ml-2">Loading promotions...</span>
            </div>
          </div>
        ) : filteredPromotions.length === 0 ? (
          <div className="p-8 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
            </svg>
            <p className="mt-2 text-gray-500">No promotions found</p>
            <Link
              href="/admin/promotions/new"
              className="mt-4 inline-flex items-center text-[#A96B11] hover:text-[#8B560E]"
            >
              <svg className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add your first promotion
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Promotion
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Merchant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Period
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPromotions.map((promotion) => (
                  <tr key={promotion.id}>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {promotion.title}
                        </div>
                        <div className="text-sm text-gray-500">
                          {stripHtmlTags(promotion.description).substring(0, 100)}...
                        </div>
                        {promotion.giftcodes && (
                          <div className="text-xs text-gray-400 mt-1">
                            Gift codes available
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {promotion.merchant ? (
                        <Link
                          href={`/admin/merchants/${promotion.merchant.id}`}
                          className="text-sm text-[#A96B11] hover:text-[#8B560E]"
                        >
                          {promotion.merchant.name}
                        </Link>
                      ) : (
                        <span className="text-sm text-gray-500">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full font-medium ${getTypeColor(promotion.type)}`}>
                        {getTypeLabel(promotion.type)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div>
                        {promotion.startDate ? new Date(promotion.startDate).toLocaleDateString() : 'No start'} -
                      </div>
                      <div>
                        {promotion.endDate ? new Date(promotion.endDate).toLocaleDateString() : 'No end'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleToggleActive(promotion.id, promotion.isActive)}
                        className={`px-2 py-1 text-xs rounded-full font-medium ${
                          promotion.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {promotion.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link
                        href={`/admin/promotions/${promotion.id}/edit`}
                        className="text-[#A96B11] hover:text-[#8B560E] mr-3"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(promotion.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
            <div className="flex justify-between items-center">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className={`px-3 py-1 rounded ${
                  currentPage === 1
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border'
                }`}
              >
                Previous
              </button>
              <span className="text-sm text-gray-700">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className={`px-3 py-1 rounded ${
                  currentPage === totalPages
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-gray-700 hover:bg-gray-50 border'
                }`}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
      {/* Loading Overlay */}
      <LoadingOverlay
        show={isProcessing}
        message="Processing your request..."
      />
    </div>
  );
}