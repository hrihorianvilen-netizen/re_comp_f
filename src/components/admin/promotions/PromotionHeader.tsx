'use client';

import React from 'react';

interface PromotionHeaderProps {
  onAddPromotion: () => void;
  promotionCount: number;
}

export default function PromotionHeader({ onAddPromotion }: PromotionHeaderProps) {
  return (
    <div className="flex justify-between items-center mb-4">
      <div>
        <h3 className="text-lg font-medium text-gray-900">Promotions</h3>
        <p className="text-sm text-gray-500">
          Add multiple promotions with different types and requirements
        </p>
      </div>
      <button
        type="button"
        onClick={onAddPromotion}
        className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-[#A96B11] hover:bg-[#8B560E]"
      >
        <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Add Promotion
      </button>
    </div>
  );
}