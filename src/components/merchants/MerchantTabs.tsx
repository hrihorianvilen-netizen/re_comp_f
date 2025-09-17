'use client';

import { useState } from 'react';
import { Merchant } from '@/types/api';
import Link from 'next/link';
import { RatingStars } from '@/components/ui';
import OptimizedImage from '@/components/ui/OptimizedImage';
import { getImageUrl } from '@/lib/utils';
import api from '@/lib/api';

interface MerchantTabsProps {
  merchants: Merchant[];
}

const tabs = [
  { id: 'recommended', label: 'Recommended', description: 'Top-rated merchants' },
  { id: 'recent', label: 'Recently Updated', description: 'Latest reviews and updates' },
  { id: 'controversial', label: 'Controversial', description: 'Mixed reviews worth checking' },
  { id: 'trusted', label: 'Trusted', description: 'Verified and reliable merchants' },
  { id: 'avoid', label: 'Avoid', description: 'Merchants with serious issues' },
];

export default function MerchantTabs({ merchants }: MerchantTabsProps) {
  const [activeTab, setActiveTab] = useState('recommended');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  const filterMerchants = (status: string) => {
    // Always exclude draft merchants from public display
    const publicMerchants = merchants.filter(merchant => merchant.status !== 'draft');
    
    if (status === 'recent') {
      return publicMerchants
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    }
    return publicMerchants.filter(merchant => merchant.status === status);
  };

  const filteredMerchants = filterMerchants(activeTab);
  const totalPages = Math.ceil(filteredMerchants.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentMerchants = filteredMerchants.slice(startIndex, endIndex);

  // Reset to first page when tab changes
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    setCurrentPage(1);
  };

  // Track merchant visit
  const handleMerchantClick = async (merchantSlug: string) => {
    try {
      await api.trackMerchantVisit(merchantSlug);
    } catch (error) {
      console.error('Failed to track merchant visit:', error);
      // Don't block navigation on tracking failure
    }
  };


  return (
    <section className="py-4 w-full bg-white">
        {/* Tab Bar - horizontal scroll on mobile, wrap on desktop */}
        <div className="p-4">
          <div className="flex gap-2 md:flex-wrap overflow-x-auto scrollbar-hide">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className="px-4 py-2 rounded-lg font-medium transition-colors bg-white hover:bg-gray-100 border-2 whitespace-nowrap flex-shrink-0"
                style={
                  activeTab === tab.id 
                    ? { 
                        borderColor: '#198639',
                        color: '#198639'
                      } 
                    : { 
                        color: '#198639',
                        borderColor: '#e5e7eb'
                      }
                }
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="w-full">
            <div className="grid grid-cols-1 gap-4 mt-4">
              {currentMerchants.map((merchant, index) => (
                <Link 
                  key={merchant.id} 
                  href={`/merchants/${merchant.slug || merchant.id}`} 
                  className="pb-2 border-b-2 border-gray-200"
                  onClick={() => handleMerchantClick(merchant.slug || merchant.id)}
                >
                  <div className="bg-white transition-shadow cursor-pointer overflow-hidden">
                    <div className="flex py-2 gap-4">
                      {/* Image */}
                      <div className="relative w-32 h-32 flex-shrink-0">
                        {merchant.logo ? (
                          <OptimizedImage
                            src={getImageUrl(merchant.logo)}
                            alt={merchant.name}
                            fill
                            className="object-cover rounded-md"
                            sizeType="thumbnail"
                            qualityPriority="medium"
                            priority={index < 5}
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-200 rounded-md flex items-center justify-center">
                            <span className="text-gray-400 text-2xl font-medium">
                              {merchant.name.charAt(0)}
                            </span>
                          </div>
                        )}
                      </div>
                      
                      {/* Content */}
                      <div className="flex flex-col gap-2 flex-1">
                        {/* Name */}
                        <h3 className="font-semibold text-gray-900 line-clamp-1">
                          {merchant.name}
                        </h3>
                        
                        {/* Review stars */}
                        <RatingStars rating={merchant.rating} size={20} />
                        
                        {/* Stars with count */}
                        <div className="flex items-center gap-1">
                          <span className="text-yellow-400">⭐</span>
                          <span className="text-sm text-gray-600">
                            {(merchant.reviewCount || 0).toLocaleString()} reviews
                          </span>
                        </div>
                        
                        {/* Visits */}
                        <div className="flex items-center gap-1">
                          <span className="text-blue-500">👥</span>
                          <span className="text-sm text-gray-600">
                            {((merchant.weeklyVisits || 0)).toLocaleString()} visits this week
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-6">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 rounded-md border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                >
                  &lt;
                </button>
                
                <div className="flex gap-1">
                  {[...Array(totalPages)].map((_, index) => (
                    <button
                      key={index + 1}
                      onClick={() => setCurrentPage(index + 1)}
                      className={`px-3 py-1 rounded-md border ${
                        currentPage === index + 1
                          ? 'bg-[#198639] text-white border-[#198639]'
                          : 'border-gray-300 hover:bg-gray-100'
                      }`}
                    >
                      {index + 1}
                    </button>
                  ))}
                </div>
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 rounded-md border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100"
                >
                  &gt;
                </button>
              </div>
            )}
          </div>
        </div>

        {currentMerchants.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">No merchants found for this category.</p>
          </div>
        )}
    </section>
  );
}