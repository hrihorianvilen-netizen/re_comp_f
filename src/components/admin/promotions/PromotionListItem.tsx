'use client';

import React from 'react';
import { MerchantPromotion } from '@/types/merchant';
import PromotionForm from './PromotionForm';

interface PromotionListItemProps {
  promotion: MerchantPromotion;
  index: number;
  isExpanded: boolean;
  onToggle: (index: number) => void;
  onChange: (index: number, field: keyof MerchantPromotion, value: string | boolean) => void;
  onRemove: (index: number) => void;
  errors?: Record<string, string>;
}

export default function PromotionListItem({
  promotion,
  index,
  isExpanded,
  onToggle,
  onChange,
  onRemove,
  errors
}: PromotionListItemProps) {
  const getTypeLabel = (type: string) => {
    const typeLabels = {
      'default': 'Default',
      'common': 'Common Use',
      'private': 'Private Use'
    };
    return typeLabels[type as keyof typeof typeLabels] || type;
  };

  const getTypeColor = (type: string) => {
    const typeColors = {
      'default': 'bg-blue-100 text-blue-800',
      'common': 'bg-green-100 text-green-800',
      'private': 'bg-purple-100 text-purple-800'
    };
    return typeColors[type as keyof typeof typeColors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden">
      <div
        className="bg-gray-50 px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-gray-100"
        onClick={() => onToggle(index)}
      >
        <div className="flex items-center space-x-3">
          <svg
            className={`h-5 w-5 text-gray-500 transform transition-transform ${
              isExpanded ? 'rotate-90' : ''
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
          <div>
            <span className="font-medium text-gray-900">
              {promotion.title || `Promotion ${index + 1}`}
            </span>
            {promotion.type && (
              <span className={`ml-2 px-2 py-1 text-xs rounded-full ${getTypeColor(promotion.type)}`}>
                {getTypeLabel(promotion.type)}
              </span>
            )}
          </div>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove(index);
          }}
          className="text-red-600 hover:text-red-800"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </div>

      {isExpanded && (
        <div className="p-4 bg-white">
          <PromotionForm
            promotion={promotion}
            index={index}
            onChange={onChange}
            errors={errors}
          />
        </div>
      )}
    </div>
  );
}