'use client';

import { useState } from 'react';
import MerchantTabs from './MerchantTabs';
import RecentReviews from './RecentReviews';
import NewsSection from './NewsSection';
import { Merchant, Review } from '@/types/api';

interface MobileTabSectionProps {
  merchants: Merchant[];
  reviews: Review[];
}

export default function MobileTabSection({ merchants, reviews }: MobileTabSectionProps) {
  const [activeTab, setActiveTab] = useState<'brands' | 'reviews' | 'news'>('brands');

  return (
    <div className="md:hidden max-w-7xl mx-auto px-4 mb-12">
      {/* Tab Bar */}
      <div className="flex border-b border-gray-200 mb-4">
        <button
          onClick={() => setActiveTab('brands')}
          className={`flex-1 py-3 text-center font-medium transition-colors ${
            activeTab === 'brands'
              ? 'text-[#198639] border-b-2 border-[#198639]'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Brands
        </button>
        <button
          onClick={() => setActiveTab('reviews')}
          className={`flex-1 py-3 text-center font-medium transition-colors ${
            activeTab === 'reviews'
              ? 'text-[#198639] border-b-2 border-[#198639]'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Recent Reviews
        </button>
        <button
          onClick={() => setActiveTab('news')}
          className={`flex-1 py-3 text-center font-medium transition-colors ${
            activeTab === 'news'
              ? 'text-[#198639] border-b-2 border-[#198639]'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          News
        </button>
      </div>

      {/* Tab Content */}
      <div className="w-full">
        {activeTab === 'brands' && (
          <MerchantTabs merchants={merchants} />
        )}
        
        {activeTab === 'reviews' && (
          <RecentReviews reviews={reviews} />
        )}
        
        {activeTab === 'news' && (
          <NewsSection 
            showCategories={true}
            showPagination={false}
            showSidebar={true}
            itemsPerPage={5}
          />
        )}
      </div>
    </div>
  );
}