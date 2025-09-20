'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { MerchantPromotion } from '@/types/merchant';
import PromotionHeader from '../promotions/PromotionHeader';
import PromotionListItem from '../promotions/PromotionListItem';

interface PromotionsProps {
  initialPromotions?: MerchantPromotion[];
  onPromotionsChange?: (promotions: MerchantPromotion[]) => void;
}

export default function Promotions({
  initialPromotions = [],
  onPromotionsChange
}: PromotionsProps) {
  const [promotions, setPromotions] = useState<MerchantPromotion[]>(initialPromotions);
  const [expandedPromotion, setExpandedPromotion] = useState<number | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Notify parent of changes
  useEffect(() => {
    onPromotionsChange?.(promotions);
  }, [promotions, onPromotionsChange]);

  // Auto-expand first promotion
  useEffect(() => {
    if (promotions.length === 1 && expandedPromotion === null) {
      setExpandedPromotion(0);
    }
  }, [promotions.length, expandedPromotion]);

  const handleAddPromotion = () => {
    const newPromotion: MerchantPromotion = {
      id: uuidv4(),
      title: '',
      description: '',
      type: 'common',
      startDate: '',
      endDate: '',
      giftcodes: '',
      loginRequired: false,
      reviewRequired: false
    };

    const updatedPromotions = [...promotions, newPromotion];
    setPromotions(updatedPromotions);
    setExpandedPromotion(updatedPromotions.length - 1);
  };

  const handleRemovePromotion = (index: number) => {
    if (confirm('Are you sure you want to delete this promotion?')) {
      const updatedPromotions = promotions.filter((_, i) => i !== index);
      setPromotions(updatedPromotions);

      if (expandedPromotion === index) {
        setExpandedPromotion(null);
      } else if (expandedPromotion !== null && expandedPromotion > index) {
        setExpandedPromotion(expandedPromotion - 1);
      }
    }
  };

  const handlePromotionChange = useCallback((index: number, field: keyof MerchantPromotion, value: string | boolean) => {
    const updatedPromotions = [...promotions];
    updatedPromotions[index] = {
      ...updatedPromotions[index],
      [field]: value
    };
    setPromotions(updatedPromotions);

    // Clear error for this field
    const errorKey = `promotions.${index}.${field}`;
    if (errors[errorKey]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[errorKey];
        return newErrors;
      });
    }
  }, [promotions, errors]);

  const togglePromotion = (index: number) => {
    setExpandedPromotion(expandedPromotion === index ? null : index);
  };

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-6 py-4 border-b border-gray-200">
        <PromotionHeader
          onAddPromotion={handleAddPromotion}
          promotionCount={promotions.length}
        />
      </div>

      <div className="px-6 py-4">
        {promotions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
            </svg>
            <p className="mt-2">No promotions added yet</p>
            <button
              type="button"
              onClick={handleAddPromotion}
              className="mt-4 text-[#A96B11] hover:text-[#8B560E] font-medium"
            >
              Add your first promotion
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            {promotions.map((promotion, index) => (
              <PromotionListItem
                key={promotion.id}
                promotion={promotion}
                index={index}
                isExpanded={expandedPromotion === index}
                onToggle={togglePromotion}
                onChange={handlePromotionChange}
                onRemove={handleRemovePromotion}
                errors={errors}
              />
            ))}

            {/* Add More Button */}
            <div className="text-center pt-4">
              <button
                type="button"
                onClick={handleAddPromotion}
                className="text-[#A96B11] hover:text-[#8B560E] font-medium"
              >
                + Add Another Promotion
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}