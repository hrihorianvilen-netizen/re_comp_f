'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import OptimizedImage from '@/components/ui/OptimizedImage';
import { useAuth } from '@/contexts/AuthContext';
import GiftCodeClaimModal from '@/components/merchants/GiftCodeClaimModal';
import api from '@/lib/api';
import { getImageUrl } from '@/lib/utils';
import { Merchant } from '@/types/api';

interface BaseGiftCodePromotion {
  id: string;
  title: string;
  description: string;
  type: string;
  loginRequired: boolean;
  reviewRequired: boolean;
  isAvailable: boolean;
  hasUserClaimed: boolean;
  remainingCodes: number | null;
  startDate: string | null;
  endDate: string | null;
}

interface GiftCodePromotion extends BaseGiftCodePromotion {
  merchant: {
    id: string;
    name: string;
    slug: string;
    logo: string | null;
    category: string;
  };
}

export default function GiftCodesPage() {
  const { user } = useAuth();
  const [promotions, setPromotions] = useState<GiftCodePromotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPromotion, setSelectedPromotion] = useState<GiftCodePromotion | null>(null);
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [filter, setFilter] = useState<'all' | 'available' | 'claimed'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    loadAllGiftCodes();
  }, []);

  const loadAllGiftCodes = async () => {
    try {
      setLoading(true);
      // Fetch all merchants with gift codes
      const merchantsResponse = await api.getMerchants();
      if (!merchantsResponse.data) return;

      const allPromotions: GiftCodePromotion[] = [];
      const uniqueCategories = new Set<string>();

      // Fetch gift codes for each merchant
      await Promise.all(
        merchantsResponse.data.merchants.map(async (merchant: Merchant) => {
          try {
            const response = await api.getAvailableGiftCodes(merchant.slug);
            if (response.data?.promotions) {
              const promotionsWithMerchant = response.data.promotions.map((promo: BaseGiftCodePromotion) => ({
                ...promo,
                merchant: {
                  id: merchant.id,
                  name: merchant.name,
                  slug: merchant.slug,
                  logo: merchant.logo || null,
                  category: merchant.category
                }
              }));
              allPromotions.push(...promotionsWithMerchant);
              uniqueCategories.add(merchant.category);
            }
          } catch (error) {
            console.error(`Failed to load gift codes for ${merchant.name}:`, error);
          }
        })
      );

      // Sort by priority and availability
      allPromotions.sort((a, b) => {
        if (a.type === 'priority' && b.type !== 'priority') return -1;
        if (a.type !== 'priority' && b.type === 'priority') return 1;
        if (a.isAvailable && !b.isAvailable) return -1;
        if (!a.isAvailable && b.isAvailable) return 1;
        return 0;
      });

      setPromotions(allPromotions);
      setCategories(Array.from(uniqueCategories).sort());
    } catch (error) {
      console.error('Failed to load gift codes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClaimClick = (promotion: GiftCodePromotion) => {
    setSelectedPromotion(promotion);
    setShowClaimModal(true);
  };

  const handleClaimSuccess = () => {
    loadAllGiftCodes();
    setShowClaimModal(false);
    setSelectedPromotion(null);
  };

  const filteredPromotions = promotions.filter(promo => {
    if (filter === 'available' && (!promo.isAvailable || promo.hasUserClaimed)) return false;
    if (filter === 'claimed' && !promo.hasUserClaimed) return false;
    if (categoryFilter !== 'all' && promo.merchant.category !== categoryFilter) return false;
    return true;
  });

  const getPromotionBadge = (type: string) => {
    if (type === 'priority') {
      return (
        <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800">
          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          Priority
        </span>
      );
    }
    return null;
  };

  const getRequirementBadges = (promotion: GiftCodePromotion) => {
    const badges = [];
    if (promotion.loginRequired) {
      badges.push(
        <span key="login" className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
          </svg>
          Login Required
        </span>
      );
    }
    if (promotion.reviewRequired) {
      badges.push(
        <span key="review" className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
          Review Required
        </span>
      );
    }
    return badges;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="animate-pulse">
            <div className="h-10 bg-gray-200 rounded w-1/3 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow-sm p-6">
                  <div className="h-20 bg-gray-200 rounded mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Gift Codes & Special Offers</h1>
          <p className="text-gray-600">Discover exclusive discount codes and special promotions from verified sellers</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-wrap gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as 'all' | 'available' | 'claimed')}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#198639] focus:border-[#198639]"
              >
                <option value="all">All Offers</option>
                <option value="available">Available Only</option>
                {user && <option value="claimed">My Claimed Codes</option>}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#198639] focus:border-[#198639]"
              >
                <option value="all">All Categories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div className="ml-auto flex items-end">
              <span className="text-sm text-gray-600">
                {filteredPromotions.length} {filteredPromotions.length === 1 ? 'offer' : 'offers'} found
              </span>
            </div>
          </div>
        </div>

        {/* Gift Codes Grid */}
        {filteredPromotions.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No gift codes found</h3>
            <p className="text-gray-600">Try adjusting your filters or check back later for new offers</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPromotions.map((promotion) => (
              <div
                key={promotion.id}
                className={`bg-white rounded-lg shadow-sm overflow-hidden ${
                  promotion.hasUserClaimed
                    ? 'ring-2 ring-green-500'
                    : promotion.isAvailable
                    ? 'hover:shadow-md transition-shadow'
                    : 'opacity-75'
                }`}
              >
                {/* Merchant Header */}
                <Link href={`/merchants/${promotion.merchant.slug}`}>
                  <div className="p-4 border-b bg-gray-50 hover:bg-gray-100 transition-colors">
                    <div className="flex items-center gap-3">
                      {promotion.merchant.logo ? (
                        <OptimizedImage
                          src={getImageUrl(promotion.merchant.logo)}
                          alt={promotion.merchant.name}
                          width={40}
                          height={40}
                          className="rounded-lg object-cover"
                          sizeType="thumbnail"
                          qualityPriority="medium"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                          <span className="text-gray-500 text-sm font-medium">
                            {promotion.merchant.name.charAt(0)}
                          </span>
                        </div>
                      )}
                      <div>
                        <h3 className="font-medium text-gray-900">{promotion.merchant.name}</h3>
                        <p className="text-xs text-gray-500">{promotion.merchant.category}</p>
                      </div>
                    </div>
                  </div>
                </Link>

                {/* Promotion Content */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h4 className="font-semibold text-gray-900 flex-1">{promotion.title}</h4>
                    {getPromotionBadge(promotion.type)}
                  </div>

                  <p className="text-sm text-gray-600 mb-4">{promotion.description}</p>

                  {/* Requirements */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {getRequirementBadges(promotion)}
                  </div>

                  {/* Status & Action */}
                  <div className="flex items-center justify-between">
                    <div className="text-sm">
                      {promotion.hasUserClaimed ? (
                        <span className="text-green-600 font-medium flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          Claimed
                        </span>
                      ) : !promotion.isAvailable ? (
                        <span className="text-gray-500">Unavailable</span>
                      ) : promotion.remainingCodes !== null ? (
                        <span className="text-gray-600">{promotion.remainingCodes} left</span>
                      ) : (
                        <span className="text-green-600">Available</span>
                      )}
                    </div>

                    {promotion.isAvailable && !promotion.hasUserClaimed && (
                      <button
                        onClick={() => handleClaimClick(promotion)}
                        className="px-4 py-2 bg-[#198639] text-white rounded-lg hover:bg-[#145a2b] transition-colors text-sm font-medium"
                      >
                        Claim Code
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Claim Modal */}
      {selectedPromotion && (
        <GiftCodeClaimModal
          promotion={selectedPromotion}
          merchantName={selectedPromotion.merchant.name}
          isOpen={showClaimModal}
          onClose={() => setShowClaimModal(false)}
          onSuccess={handleClaimSuccess}
        />
      )}
    </div>
  );
}