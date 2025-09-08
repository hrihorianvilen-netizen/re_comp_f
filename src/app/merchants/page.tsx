'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams, useRouter } from 'next/navigation';
import api from '@/lib/api';
import { getImageUrl } from '@/lib/utils';
import RatingStars from '@/components/RatingStars';

interface Merchant {
  id: string;
  slug: string;
  name: string;
  logo?: string;
  category: string;
  description: string;
  rating: number;
  reviewCount: number;
  status: string;
}

export default function MerchantsPage() {
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [categories, setCategories] = useState<{ name: string; count: number }[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    category: '',
    status: '',
    search: ''
  });
  const [error, setError] = useState<string | null>(null);

  const searchParams = useSearchParams();
  const router = useRouter();
  const observer = useRef<IntersectionObserver>();
  const lastMerchantElementRef = useCallback((node: HTMLDivElement) => {
    if (loadingMore) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        loadMoreMerchants();
      }
    });
    if (node) observer.current.observe(node);
  }, [loadingMore, hasMore]);

  // Initialize filters from URL params and load initial data
  useEffect(() => {
    const initialFilters = {
      category: searchParams.get('category') || '',
      status: searchParams.get('status') || '',
      search: searchParams.get('search') || ''
    };
    
    setFilters(initialFilters);
    loadInitialMerchants(initialFilters);
    loadCategories();
  }, [searchParams]);

  const loadInitialMerchants = async (filtersToUse = filters) => {
    setLoading(true);
    setError(null);
    setCurrentPage(1);
    setMerchants([]);
    setHasMore(true);

    try {
      const result = await api.getMerchants({
        page: 1,
        limit: 30, // Load 30 items initially as requested
        category: filtersToUse.category || undefined,
        status: filtersToUse.status || undefined,
        search: filtersToUse.search || undefined,
        excludeDrafts: true // Exclude draft merchants from public view
      });

      if (result.error) {
        setError(result.error);
      } else if (result.data) {
        const { merchants: newMerchants, pagination } = result.data;
        setMerchants(newMerchants || []);
        setCurrentPage(2); // Next page to load
        setHasMore(pagination && pagination.page < pagination.pages);
      }
    } catch (error) {
      console.error('Failed to load merchants:', error);
      setError('Failed to load merchants. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadMoreMerchants = async () => {
    if (loadingMore || !hasMore) return;

    setLoadingMore(true);
    
    try {
      const result = await api.getMerchants({
        page: currentPage,
        limit: 30,
        category: filters.category || undefined,
        status: filters.status || undefined,
        search: filters.search || undefined,
        excludeDrafts: true // Exclude draft merchants from public view
      });

      if (result.data) {
        const { merchants: newMerchants, pagination } = result.data;
        if (newMerchants && newMerchants.length > 0) {
          setMerchants(prev => [...prev, ...newMerchants]);
          setCurrentPage(prev => prev + 1);
          setHasMore(pagination && pagination.page < pagination.pages);
        } else {
          setHasMore(false);
        }
      }
    } catch (error) {
      console.error('Failed to load more merchants:', error);
    } finally {
      setLoadingMore(false);
    }
  };

  const loadCategories = async () => {
    try {
      const result = await api.getMerchantCategories();
      if (result.data) {
        setCategories(result.data.categories || []);
      }
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    
    // Update URL params
    const params = new URLSearchParams();
    if (newFilters.category) params.set('category', newFilters.category);
    if (newFilters.status) params.set('status', newFilters.status);
    if (newFilters.search) params.set('search', newFilters.search);
    
    const newUrl = params.toString() ? `?${params.toString()}` : '/merchants';
    router.push(newUrl, { scroll: false });
    
    // Reload merchants with new filters
    loadInitialMerchants(newFilters);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const searchQuery = formData.get('search') as string;
    handleFilterChange('search', searchQuery);
  };

  const handleClearFilters = () => {
    setFilters({ category: '', status: '', search: '' });
    router.push('/merchants', { scroll: false });
    loadInitialMerchants({ category: '', status: '', search: '' });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'recommended':
        return 'text-green-600 bg-green-100';
      case 'trusted':
        return 'text-blue-600 bg-blue-100';
      case 'controversial':
        return 'text-yellow-600 bg-yellow-100';
      case 'avoid':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };


  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#198639] mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading merchants...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error && merchants.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <svg className="w-24 h-24 text-red-500 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Error Loading Merchants</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button 
              onClick={() => loadInitialMerchants()}
              className="bg-[#198639] text-white px-4 py-2 rounded hover:bg-[#15732f]"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const activeFiltersCount = [filters.category, filters.status, filters.search].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Banner Header - Similar to landing page */}
      <div className="w-full relative">
        <Image
          src="/images/banner.png"
          alt="Browse Merchants Banner"
          width={1440}
          height={300}
          className="w-full md:h-full h-[120px] md:object-cover"
          priority
        />
        {/* Text Overlay with Search */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-black max-w-2xl mx-auto px-4">
            <h1 className="text-xl md:text-2xl font-medium mb-2">
              Browse Merchants
            </h1>
            <p className="text-sm md:text-base mb-6">
              Discover trusted businesses and read authentic reviews from real customers.
            </p>
            
            {/* Search Bar */}
            <div className="max-w-lg mx-auto">
              <form onSubmit={handleSearch} className="flex">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    name="search"
                    defaultValue={filters.search}
                    placeholder="Search merchants..."
                    className="block w-full pl-10 pr-3 py-1.5 border border-gray-300 rounded-l-lg placeholder-gray-500 text-gray-900 focus:outline-none focus:border-[#198639] bg-white/90 backdrop-blur-sm"
                  />
                </div>
                <button
                  type="submit"
                  className="px-6 py-1.5 bg-[#198639] text-white font-medium rounded-r-lg hover:bg-[#15732f] focus:outline-none focus:ring-2"
                >
                  Search
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar - Desktop */}
          <div className="hidden lg:block lg:col-span-1 space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Filters</h3>
                {activeFiltersCount > 0 && (
                  <button
                    onClick={handleClearFilters}
                    className="text-sm text-[#198639] hover:text-[#15732f] font-medium"
                  >
                    Clear all ({activeFiltersCount})
                  </button>
                )}
              </div>

              {/* Category Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Category
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="category"
                      value=""
                      checked={filters.category === ''}
                      onChange={(e) => handleFilterChange('category', e.target.value)}
                      className="w-4 h-4 text-[#198639] border-gray-300 focus:ring-[#198639]"
                    />
                    <span className="ml-2 text-sm text-gray-700">All Categories</span>
                  </label>
                  {categories.map((category) => (
                    <label key={category.name} className="flex items-center">
                      <input
                        type="radio"
                        name="category"
                        value={category.name}
                        checked={filters.category === category.name}
                        onChange={(e) => handleFilterChange('category', e.target.value)}
                        className="w-4 h-4 text-[#198639] border-gray-300 focus:ring-[#198639]"
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        {category.name} ({category.count})
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Status
                </label>
                <div className="space-y-2">
                  {[
                    { value: '', label: 'All Statuses' },
                    { value: 'recommended', label: 'Recommended' },
                    { value: 'trusted', label: 'Trusted' },
                    { value: 'neutral', label: 'Neutral' },
                    { value: 'controversial', label: 'Controversial' },
                    { value: 'avoid', label: 'Avoid' }
                  ].map((status) => (
                    <label key={status.value} className="flex items-center">
                      <input
                        type="radio"
                        name="status"
                        value={status.value}
                        checked={filters.status === status.value}
                        onChange={(e) => handleFilterChange('status', e.target.value)}
                        className="w-4 h-4 text-[#198639] border-gray-300 focus:ring-[#198639]"
                      />
                      <span className="ml-2 text-sm text-gray-700">{status.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Filters - Select Dropdowns */}
          <div className="lg:hidden col-span-full mb-6">
            <div className="bg-white rounded-lg shadow-sm p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Filters</h3>
                {activeFiltersCount > 0 && (
                  <button
                    onClick={handleClearFilters}
                    className="text-sm text-[#198639] hover:text-[#15732f] font-medium"
                  >
                    Clear all ({activeFiltersCount})
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Category Select */}
                <div>
                  <label htmlFor="category-select" className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    id="category-select"
                    value={filters.category}
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#198639] focus:border-[#198639] bg-white"
                  >
                    <option value="">All Categories</option>
                    {categories.map((category) => (
                      <option key={category.name} value={category.name}>
                        {category.name} ({category.count})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Status Select */}
                <div>
                  <label htmlFor="status-select" className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    id="status-select"
                    value={filters.status}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#198639] focus:border-[#198639] bg-white"
                  >
                    <option value="">All Statuses</option>
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

          {/* Merchants Grid */}
          <div className="lg:col-span-3">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                {merchants.length} {merchants.length === 1 ? 'merchant' : 'merchants'} found
                {filters.search && ` for "${filters.search}"`}
                {filters.category && ` in ${filters.category}`}
                {filters.status && ` with ${filters.status} status`}
              </h2>
            </div>

            {merchants.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.47-.881-6.08-2.33" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No merchants found</h3>
                <p className="text-gray-600 mb-4">
                  Try adjusting your search criteria or filters.
                </p>
                <button
                  onClick={handleClearFilters}
                  className="text-[#198639] hover:text-[#15732f] font-medium"
                >
                  Clear all filters
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {merchants.map((merchant, index) => (
                    <div
                      key={merchant.id}
                      ref={index === merchants.length - 1 ? lastMerchantElementRef : null}
                      className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow group"
                    >
                      <Link href={`/merchants/${merchant.slug}`}>
                        <div className="relative w-full h-48 overflow-hidden">
                          {merchant.logo ? (
                            <Image
                              src={getImageUrl(merchant.logo)}
                              alt={merchant.name}
                              fill
                              className="object-cover rounded-t-lg group-hover:scale-105 transition-transform duration-200"
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-200 rounded-t-lg flex items-center justify-center">
                              <span className="text-gray-400 text-xl font-medium">
                                {merchant.name.charAt(0)}
                              </span>
                            </div>
                          )}
                          
                          {/* Status Badge */}
                          <div className="absolute top-3 right-3">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(merchant.status)}`}>
                              {merchant.status}
                            </span>
                          </div>
                        </div>
                        
                        <div className="p-4">
                          <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-[#198639]">
                            {merchant.name}
                          </h3>
                          <p className="text-sm text-gray-600 mb-2">{merchant.category}</p>
                          <p className="text-sm text-gray-500 line-clamp-2 mb-3">
                            {merchant.description}
                          </p>
                          
                          {/* Rating */}
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-1">
                              <RatingStars rating={merchant.rating} size={20} />
                              <span className="text-sm font-medium text-gray-900 ml-1">
                                {merchant.rating.toFixed(1)}
                              </span>
                            </div>
                            <span className="text-xs text-gray-500">
                              {merchant.reviewCount} reviews
                            </span>
                          </div>
                        </div>
                      </Link>
                    </div>
                  ))}
                </div>

                {/* Loading More Indicator */}
                {loadingMore && (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#198639] mx-auto"></div>
                    <p className="mt-2 text-gray-600">Loading more merchants...</p>
                  </div>
                )}

                {/* End of Results */}
                {!hasMore && merchants.length > 0 && (
                  <div className="text-center py-8">
                    <p className="text-gray-600">You've reached the end of the results.</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}