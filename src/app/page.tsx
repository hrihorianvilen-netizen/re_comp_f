'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Merchant, Review } from '@/types/api';
import api from '@/lib/api';

// Import organized components
import { MerchantTabs, RecentlyViewedSwiper } from '@/components/merchants';
import { RecentReviews } from '@/components/reviews';
import { MobileTabSection } from '@/components/shared';
import AdSlot from '@/components/ui/AdSlot';

export default function HomePage() {
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [recentMerchants, setRecentMerchants] = useState<Merchant[]>([]);

  useEffect(() => {
    loadInitialData();
    loadRecentMerchants();
  }, []);

  // Load 10 most recent merchants from database
  const loadRecentMerchants = async () => {
    try {
      const result = await api.getMerchants({
        limit: 10
      });

      if (result.data) {
        const publicMerchants = result.data.merchants.filter(
          merchant => merchant.status !== 'draft'
        );
        setRecentMerchants(publicMerchants);
      }
    } catch (error) {
      console.error('Failed to load recent merchants:', error);
    }
  };

  const loadInitialData = async () => {
    try {
      // Load merchants and reviews in parallel
      const [merchantResult, reviewResult] = await Promise.all([
        api.getMerchants({ limit: 50 }),
        api.getReviews({ limit: 20 })
      ]);
      
      if (merchantResult.data) {
        // Filter out draft merchants from public display
        const publicMerchants = merchantResult.data.merchants.filter(
          merchant => merchant.status !== 'draft'
        );
        setMerchants(publicMerchants);
      }
      
      if (reviewResult.data) {
        setReviews(reviewResult.data.reviews);
      }
    } catch (error) {
      console.error('Failed to load initial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    try {
      const result = await api.getMerchants({ search: searchQuery, limit: 50 });
      if (result.data) {
        // Filter out draft merchants from search results
        const publicMerchants = result.data.merchants.filter(
          merchant => merchant.status !== 'draft'
        );
        setMerchants(publicMerchants);
      }
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setLoading(false);
    }
  };

  // Transform recent merchants for the swiper component
  const recentlyViewedItems = recentMerchants.slice(0, 10).map((item, index) => ({
    id: item.id,
    slug: item.slug,
    name: item.name,
    image: item.logo || '/images/shopee.jpg',
    rating: item.rating || 0,
    // Ensure unique keys by adding index as fallback
    uniqueKey: `${item.id}-${index}`
  }));

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-[#198639]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section with Banner Background */}
      <div
        className="w-full relative"
        style={{
          backgroundImage: 'url(/images/banner.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          minHeight: '200px',
        }}
      >
        {/* Text Overlay with Search */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-black max-w-2xl mx-auto px-4">
            <h1 className="text-xl md:text-2xl font-medium mb-2">
              Reputable Company Evaluation 2025
            </h1>
            <p className="text-sm md:text-base mb-6">
              Discover the most trusted companies based on authentic user reviews and ratings.
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
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search merchants..."
                    className="block w-full pl-10 pr-3 py-1.5 border border-gray-300 rounded-l-lg placeholder-gray-500 text-gray-900 focus:outline-none focus:border-[#198639] bg-white/90 backdrop-blur-sm"
                  />
                </div>
                <button
                  type="submit"
                  className="px-6 py-1.5 bg-[#198639] text-white font-medium rounded-r-lg hover:bg-[#15732f] focus:outline-none focus:ring-2 "
                >
                  Search
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Merchants Section */}
      <div className="bg-white border-b border-gray-200">
        <RecentlyViewedSwiper items={recentlyViewedItems} />
      </div>

      {/* Inline Ad After Recently Viewed */}
      <AdSlot slot="inline" className="max-w-7xl mx-auto px-4 py-4" />

      {/* Mobile Tab Section - Only visible on mobile */}
      <MobileTabSection merchants={merchants} reviews={reviews} />

      {/* Desktop Layout - Hidden on mobile */}
      <div className="hidden md:block max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content - Merchant Tabs */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-2">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 px-4 pt-4">Browse Merchants</h2>
                <MerchantTabs merchants={merchants} />
              </div>
            </div>
          </div>

          {/* Sidebar - Recent Reviews */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm">
              <RecentReviews reviews={reviews} />
            </div>
            {/* Sidebar Ad */}
            <div className="mt-6">
              <AdSlot slot="sidebar" />
            </div>
          </div>
        </div>
      </div>

      {/* Inline Ad Before Quick Actions */}
      <AdSlot slot="inline" className="max-w-7xl mx-auto px-4 py-4" />

      {/* Quick Actions */}
      <div className="bg-white border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Get Started</h2>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/merchants"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-[#198639] hover:bg-[#15732f] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#198639]"
              >
                Browse All Merchants
                <svg className="ml-2 -mr-1 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
              <Link
                href="/reviews"
                className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#198639]"
              >
                Read Recent Reviews
                <svg className="ml-2 -mr-1 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}