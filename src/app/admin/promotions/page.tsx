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
  const [totalPromotions, setTotalPromotions] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingMessage, setProcessingMessage] = useState('Processing...');
  const [typeCounts, setTypeCounts] = useState<Record<string, number>>({ all: 0, default: 0, common: 0, private: 0 });
  const [selectedPromotions, setSelectedPromotions] = useState<Set<string>>(new Set());
  const [selectAll, setSelectAll] = useState(false);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchPromotions();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, searchQuery, filterType]);

  // Fetch total type counts separately (unfiltered)
  useEffect(() => {
    if (promotions.length > 0 || searchQuery) {
      fetchTypeCounts();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, promotions]); // Refetch counts when search changes or promotions load

  const fetchTypeCounts = async () => {
    try {
      // Fetch counts for each type in parallel
      const types = ['all', 'default', 'common', 'private'];

      const countPromises = types.map(async (type) => {
        const params = new URLSearchParams({
          page: '1',
          limit: '1',
          ...(type !== 'all' && { type: type }),
          ...(searchQuery && { search: searchQuery })
        });

        const response = await api.get<{
          pagination?: { total: number };
        }>(`/admin/promotions?${params}`);

        return {
          type,
          count: response.data?.pagination?.total || 0
        };
      });

      const results = await Promise.all(countPromises);

      console.log(results, 'type count results');
      

      const counts = { all: 0, default: 0, common: 0, private: 0 };
      results.forEach(({ type, count }) => {
        console.log(type, count, 'type count');
        
        counts[type as keyof typeof counts] = count;
      });

      console.log('Type counts:', counts);
      setTypeCounts(counts);
    } catch (error) {
      console.error('Error fetching type counts:', error);
      // Fallback: use current page data for counts
      const counts = { all: 0, default: 0, common: 0, private: 0 };
      promotions.forEach((promo: Promotion) => {
        counts.all++;
        const lowerType = promo.type.toLowerCase();
        if (lowerType in counts) {
          counts[lowerType as keyof typeof counts]++;
        }
      });
      setTypeCounts(counts);
    }
  };

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
        };
        typeCounts?: {
          all: number;
          default: number;
          common: number;
          private: number;
        };
      }>(`/admin/promotions?${params}`);
      if (response.data) {
        const fetchedPromotions = response.data.promotions || [];
        setPromotions(fetchedPromotions);
        setTotalPages(response.data.pagination?.pages || 1);
        setTotalPromotions(response.data.pagination?.total || fetchedPromotions.length);

        // Don't update type counts here as they are fetched separately
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

    setProcessingMessage('Deleting promotion...');
    setIsProcessing(true);
    try {
      await api.delete(`/admin/promotions/${id}`);
      toast.success('Promotion deleted successfully');
      await fetchPromotions();
    } catch (error) {
      console.error('Error deleting promotion:', error);
      toast.error('Failed to delete promotion');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Are you sure you want to delete ${selectedPromotions.size} promotion(s)?`)) {
      return;
    }

    setProcessingMessage(`Deleting ${selectedPromotions.size} promotion(s)...`);
    setIsProcessing(true);
    try {
      const deletePromises = Array.from(selectedPromotions).map(id =>
        api.delete(`/admin/promotions/${id}`)
      );

      await Promise.all(deletePromises);
      toast.success(`${selectedPromotions.size} promotion(s) deleted successfully`);
      setSelectedPromotions(new Set());
      setSelectAll(false);
      await fetchPromotions();
    } catch (error) {
      console.error('Error deleting promotions:', error);
      toast.error('Failed to delete some promotions');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBulkStatusChange = async (isActive: boolean) => {
    setProcessingMessage(`${isActive ? 'Activating' : 'Deactivating'} ${selectedPromotions.size} promotion(s)...`);
    setIsProcessing(true);
    try {
      const updatePromises = Array.from(selectedPromotions).map(id =>
        api.patch(`/admin/promotions/${id}`, { isActive })
      );

      await Promise.all(updatePromises);
      toast.success(`${selectedPromotions.size} promotion(s) ${isActive ? 'activated' : 'deactivated'} successfully`);
      setSelectedPromotions(new Set());
      setSelectAll(false);
      await fetchPromotions();
    } catch (error) {
      console.error('Error updating promotions:', error);
      toast.error('Failed to update some promotions');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    setProcessingMessage(`${isActive ? 'Activating' : 'Deactivating'} promotion...`);
    setIsProcessing(true);
    try {
      await api.patch(`/admin/promotions/${id}`, { isActive: !isActive });
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
      'default': 'Default',
      'common': 'Common',
      'private': 'Private'
    };
    return typeMap[type.toLowerCase()] || type;
  };

  const getTypeColor = (type: string) => {
    const colorMap: Record<string, string> = {
      'default': 'bg-blue-100 text-blue-800',
      'common': 'bg-green-100 text-green-800',
      'private': 'bg-purple-100 text-purple-800'
    };
    return colorMap[type.toLowerCase()] || 'bg-gray-100 text-gray-800';
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
            className={`px-4 py-2 text-sm font-medium border-b-2 cursor-pointer transition-colors ${
              filterType === 'all'
                ? 'text-[#A96B11] border-[#A96B11]'
                : 'text-gray-600 border-transparent hover:text-gray-800'
            }`}
          >
            All ({typeCounts.all})
          </button>
          <button
            onClick={() => {
              setFilterType('default');
              setCurrentPage(1);
            }}
            className={`px-4 py-2 text-sm font-medium border-b-2 cursor-pointer transition-colors ${
              filterType === 'default'
                ? 'text-[#A96B11] border-[#A96B11]'
                : 'text-gray-600 border-transparent hover:text-gray-800'
            }`}
          >
            Default ({typeCounts.default})
          </button>
          <button
            onClick={() => {
              setFilterType('common');
              setCurrentPage(1);
            }}
            className={`px-4 py-2 text-sm font-medium border-b-2 cursor-pointer transition-colors ${
              filterType === 'common'
                ? 'text-[#A96B11] border-[#A96B11]'
                : 'text-gray-600 border-transparent hover:text-gray-800'
            }`}
          >
            Common ({typeCounts.common})
          </button>
          <button
            onClick={() => {
              setFilterType('private');
              setCurrentPage(1);
            }}
            className={`px-4 py-2 text-sm font-medium border-b-2 cursor-pointer transition-colors ${
              filterType === 'private'
                ? 'text-[#A96B11] border-[#A96B11]'
                : 'text-gray-600 border-transparent hover:text-gray-800'
            }`}
          >
            Private ({typeCounts.private})
          </button>
        </div>
      </div>

      {/* Promotions Table */}
      <div className="bg-white shadow rounded-lg">
        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-flex items-center">
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#A96B11]"></div>
                <p className="mt-2 text-gray-500">Loading promotion ...</p>
              </div>
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
          <>
            {/* Bulk Actions Toolbar */}
            {selectedPromotions.size > 0 && (
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-700">
                      {selectedPromotions.size} {selectedPromotions.size === 1 ? 'item' : 'items'} selected
                    </span>
                    <button
                      onClick={() => {
                        setSelectedPromotions(new Set());
                        setSelectAll(false);
                      }}
                      className="text-sm text-gray-500 hover:text-gray-700"
                    >
                      Clear selection
                    </button>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleBulkStatusChange(true)}
                      className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                    >
                      Activate
                    </button>
                    <button
                      onClick={() => handleBulkStatusChange(false)}
                      className="px-3 py-1 text-sm bg-yellow-600 text-white rounded hover:bg-yellow-700"
                    >
                      Deactivate
                    </button>
                    <button
                      onClick={handleBulkDelete}
                      className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            )}

            <div className="w-full">
            <table className="w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="w-12 px-3 py-3">
                    <input
                      type="checkbox"
                      className="h-4 w-4 text-[#A96B11] focus:ring-[#A96B11] border-gray-300 rounded"
                      checked={selectAll}
                      onChange={(e) => {
                        setSelectAll(e.target.checked);
                        if (e.target.checked) {
                          setSelectedPromotions(new Set(filteredPromotions.map(p => p.id)));
                        } else {
                          setSelectedPromotions(new Set());
                        }
                      }}
                    />
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Title
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                    Merchant
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                    Description
                  </th>
                  <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                    Codes
                  </th>
                  <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                    Type
                  </th>
                  <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">

                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPromotions.map((promotion) => (
                  <tr key={promotion.id} className="hover:bg-gray-50">
                    <td className="w-12 px-3 py-3">
                      <input
                        type="checkbox"
                        className="h-4 w-4 text-[#A96B11] focus:ring-[#A96B11] border-gray-300 rounded"
                        checked={selectedPromotions.has(promotion.id)}
                        onChange={(e) => {
                          const newSelected = new Set(selectedPromotions);
                          if (e.target.checked) {
                            newSelected.add(promotion.id);
                          } else {
                            newSelected.delete(promotion.id);
                          }
                          setSelectedPromotions(newSelected);
                          setSelectAll(newSelected.size === filteredPromotions.length);
                        }}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium text-gray-900 truncate max-w-[200px]">
                        {promotion.title}
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      {promotion.merchant ? (
                        <Link
                          href={`/admin/merchants/${promotion.merchant.id}`}
                          className="text-sm text-[#A96B11] hover:text-[#8B560E] block truncate max-w-[150px]"
                        >
                          {promotion.merchant.name}
                        </Link>
                      ) : (
                        <span className="text-sm text-gray-500">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <div className="text-sm text-gray-500 max-w-[200px] truncate">
                        {stripHtmlTags(promotion.description)}
                      </div>
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap hidden md:table-cell">
                      <div className="text-sm">
                        {promotion.giftcodes ?
                          <span className="text-green-600">✓</span> :
                          <span className="text-gray-400">-</span>
                        }
                      </div>
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap hidden sm:table-cell">
                      <span className={`px-2 py-1 text-xs rounded-full font-medium ${getTypeColor(promotion.type)}`}>
                        {getTypeLabel(promotion.type)}
                      </span>
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap">
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
                    <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-3">
                        <Link
                          href={`/admin/promotions/${promotion.id}/edit`}
                          className="text-[#A96B11] hover:text-[#8B560E] transition-colors p-1 hover:bg-[#A96B11]/10 rounded"
                          title="Edit promotion"
                        >
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                          </svg>
                        </Link>
                        <button
                          onClick={() => handleDelete(promotion.id)}
                          className="text-red-600 hover:text-red-800 transition-colors p-1 hover:bg-red-50 rounded"
                          title="Delete promotion"
                        >
                          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          </>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-4 py-3 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalPromotions)} of {totalPromotions} promotions
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
      </div>
      {/* Loading Overlay */}
      <LoadingOverlay
        show={isProcessing}
        message={processingMessage}
      />
    </div>
  );
}