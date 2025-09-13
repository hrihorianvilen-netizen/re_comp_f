'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';
import GiftCodeClaimModal from './GiftCodeClaimModal';

interface GiftCodePromotion {
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

interface GiftCodeSectionProps {
  merchantSlug: string;
  merchantId: string;
  merchantName: string;
}

export default function GiftCodeSection({ merchantSlug, merchantName }: GiftCodeSectionProps) {
  const [promotions, setPromotions] = useState<GiftCodePromotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPromotion, setSelectedPromotion] = useState<GiftCodePromotion | null>(null);
  const [showClaimModal, setShowClaimModal] = useState(false);

  const loadGiftCodes = async () => {
    try {
      const response = await api.getAvailableGiftCodes(merchantSlug);
      if (response.data) {
        setPromotions(response.data.promotions);
      }
    } catch (error) {
      console.error('Failed to load gift codes:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGiftCodes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [merchantSlug]);

  const handleClaimClick = (promotion: GiftCodePromotion) => {
    setSelectedPromotion(promotion);
    setShowClaimModal(true);
  };

  const handleClaimSuccess = () => {
    // Reload promotions to update availability
    loadGiftCodes();
    setShowClaimModal(false);
    setSelectedPromotion(null);
  };

  const getPromotionBadge = (type: string) => {
    if (type === 'priority') {
      return (
        <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800">
          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          Priority Offer
        </span>
      );
    }
    return null;
  };

  const getAvailabilityStatus = (promotion: GiftCodePromotion) => {
    if (promotion.hasUserClaimed) {
      return (
        <span className="text-green-600 font-medium flex items-center">
          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          Claimed
        </span>
      );
    }

    if (!promotion.isAvailable) {
      return <span className="text-gray-500">Unavailable</span>;
    }

    if (promotion.remainingCodes !== null) {
      return (
        <span className="text-gray-600">
          {promotion.remainingCodes} left
        </span>
      );
    }

    return <span className="text-green-600">Available</span>;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (promotions.length === 0) {
    return null;
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Special Offers & Gift Codes</h3>
          <span className="text-sm text-gray-500">{promotions.length} available</span>
        </div>

        <div className="space-y-4">
          {promotions.map((promotion) => (
            <div
              key={promotion.id}
              className={`border rounded-lg p-4 ${
                promotion.hasUserClaimed
                  ? 'bg-green-50 border-green-200'
                  : promotion.isAvailable
                  ? 'bg-white border-gray-200 hover:border-[#198639] transition-colors'
                  : 'bg-gray-50 border-gray-200 opacity-75'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-medium text-gray-900">{promotion.title}</h4>
                    {getPromotionBadge(promotion.type)}
                  </div>

                  <p className="text-sm text-gray-600 mb-3">{promotion.description}</p>

                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    {promotion.loginRequired && (
                      <span className="flex items-center">
                        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                        </svg>
                        Login required
                      </span>
                    )}
                    {promotion.reviewRequired && (
                      <span className="flex items-center">
                        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        Review required
                      </span>
                    )}
                    {promotion.endDate && (
                      <span className="flex items-center">
                        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                        </svg>
                        Expires {new Date(promotion.endDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>

                <div className="ml-4 flex flex-col items-end">
                  <div className="mb-2">
                    {getAvailabilityStatus(promotion)}
                  </div>

                  {promotion.isAvailable && !promotion.hasUserClaimed && (
                    <button
                      onClick={() => handleClaimClick(promotion)}
                      className="px-4 py-2 bg-[#198639] text-white text-sm font-medium rounded-md hover:bg-[#15732f] transition-colors"
                    >
                      Claim Code
                    </button>
                  )}

                  {promotion.hasUserClaimed && (
                    <button
                      onClick={() => handleClaimClick(promotion)}
                      className="px-4 py-2 bg-white border border-green-600 text-green-600 text-sm font-medium rounded-md hover:bg-green-50 transition-colors"
                    >
                      View Code
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showClaimModal && selectedPromotion && (
        <GiftCodeClaimModal
          promotion={selectedPromotion}
          merchantName={merchantName}
          isOpen={showClaimModal}
          onClose={() => {
            setShowClaimModal(false);
            setSelectedPromotion(null);
          }}
          onSuccess={handleClaimSuccess}
        />
      )}
    </>
  );
}