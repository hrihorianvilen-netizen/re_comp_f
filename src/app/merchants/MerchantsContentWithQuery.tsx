'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams, useRouter } from 'next/navigation';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useInView } from 'react-intersection-observer';
import api from '@/lib/api';
import { getImageUrl } from '@/lib/utils';
import RatingStars from '@/components/RatingStars';
import { merchantKeys } from '@/hooks/useMerchants';
import { Merchant } from '@/types/api';

export default function MerchantsContentWithQuery() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const [filters, setFilters] = useState({
    category: searchParams.get('category') || '',
    status: searchParams.get('status') || 'all'
  });

  // React Query infinite query
  const {
    data,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useInfiniteQuery({
    queryKey: ['merchants', 'infinite', filters],
    queryFn: async ({ pageParam = 1 }) => {
      const result = await api.getMerchants({
        page: pageParam,
        limit: 30,
        category: filters.category || undefined,
        status: filters.status === 'all' ? undefined : filters.status,
        excludeDrafts: true
      });
      
      if (result.error) throw new Error(result.error);
      return result.data;
    },
    getNextPageParam: (lastPage, pages) => {
      if (!lastPage) return undefined;
      const currentPage = pages.length;
      const totalPages = lastPage.pagination.pages;
      return currentPage < totalPages ? currentPage + 1 : undefined;
    },
    initialPageParam: 1,
  });

  // Intersection observer for infinite scroll
  const { ref, inView } = useInView({
    threshold: 0,
    rootMargin: '100px',
  });

  // Fetch next page when scrolling to bottom
  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, fetchNextPage, hasNextPage, isFetchingNextPage]);

  // Update filters when URL params change
  useEffect(() => {
    const category = searchParams.get('category') || '';
    const status = searchParams.get('status') || 'all';
    setFilters({ category, status });
  }, [searchParams]);

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    
    // Update URL with new filters
    const params = new URLSearchParams();
    if (newFilters.category) params.set('category', newFilters.category);
    if (newFilters.status !== 'all') params.set('status', newFilters.status);
    
    const newUrl = `/merchants${params.toString() ? '?' + params.toString() : ''}`;
    router.push(newUrl);
  };

  // Flatten pages to get all merchants
  const merchants = data?.pages.flatMap(page => page?.merchants || []) || [];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#198639]"></div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">
            {error?.message || 'Failed to load merchants'}
          </div>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-[#198639] text-white rounded hover:bg-[#15732f]"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
              <div className="mb-6 lg:mb-0">
                <h1 className="text-2xl font-bold text-gray-900">Browse Merchants</h1>
                <p className="text-gray-600 mt-1">
                  Discover trusted merchants and read authentic reviews from our community
                </p>
              </div>
            </div>
            
            {/* Filters */}
            <div className="mt-6 flex flex-wrap gap-4">
              {/* Category Filter */}
              <div className="min-w-[200px]">
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <select
                  id="category"
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#198639] focus:border-transparent"
                >
                  <option value="">All Categories</option>
                  <option value="Technology">Technology</option>
                  <option value="Fashion">Fashion</option>
                  <option value="Home & Garden">Home & Garden</option>
                  <option value="Health & Beauty">Health & Beauty</option>
                  <option value="Sports">Sports</option>
                  <option value="Food & Beverage">Food & Beverage</option>
                  <option value="Travel">Travel</option>
                  <option value="Automotive">Automotive</option>
                  <option value="Books">Books</option>
                  <option value="Electronics">Electronics</option>
                </select>
              </div>

              {/* Status Filter */}
              <div className="min-w-[200px]">
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  id="status"
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#198639] focus:border-transparent"
                >
                  <option value="all">All Merchants</option>
                  <option value="recommended">Recommended</option>
                  <option value="trusted">Trusted</option>
                  <option value="neutral">Neutral</option>
                  <option value="controversial">Controversial</option>
                  <option value="avoid">Avoid</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Merchants Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {merchants.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {merchants.map((merchant, index) => (
                <div
                  key={merchant.id}
                  ref={index === merchants.length - 5 ? ref : null}
                  className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200"
                >
                  <div className="p-6">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        <Image
                          src={getImageUrl(merchant.logo) || '/images/default-merchant.png'}
                          alt={`${merchant.name} logo`}
                          width={64}
                          height={64}
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-semibold text-gray-900 truncate">
                            {merchant.name}
                          </h3>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            merchant.status === 'recommended' ? 'bg-green-100 text-green-800' :
                            merchant.status === 'trusted' ? 'bg-blue-100 text-blue-800' :
                            merchant.status === 'controversial' ? 'bg-yellow-100 text-yellow-800' :
                            merchant.status === 'avoid' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {merchant.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{merchant.category}</p>
                        <div className="flex items-center mt-2">
                          <RatingStars rating={Number(merchant.rating)} size={24} />
                          <span className="ml-2 text-sm text-gray-600">
                            {merchant.rating} ({merchant.reviewCount} reviews)
                          </span>
                        </div>
                        {/* Add weekly visits display */}
                        <div className="flex items-center gap-1 mt-2">
                          <span className="text-blue-500">👥</span>
                          <span className="text-sm text-gray-600">
                            {(merchant.weeklyVisits || 0).toLocaleString()} visits this week
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-gray-700 text-sm mt-4 line-clamp-3">
                      {merchant.description}
                    </p>
                    
                    <div className="mt-4 flex justify-between items-center">
                      <Link
                        href={`/merchants/${merchant.slug}`}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[#198639] hover:bg-[#15732f] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#198639]"
                      >
                        View Details
                      </Link>
                      {merchant.website && (
                        <a
                          href={merchant.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#198639] hover:text-[#15732f] text-sm font-medium"
                        >
                          Visit Website ↗
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Loading More Indicator */}
            {isFetchingNextPage && (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#198639]"></div>
              </div>
            )}

            {/* End of Results */}
            {!hasNextPage && merchants.length > 0 && (
              <div className="text-center py-8">
                <p className="text-gray-600">You've reached the end of the results.</p>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-500 text-xl mb-4">No merchants found</div>
            <p className="text-gray-400">Try adjusting your filters to see more results.</p>
          </div>
        )}
      </div>
    </div>
  );
}