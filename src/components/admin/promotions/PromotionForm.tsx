'use client';

import React from 'react';
import RichTextEditor from '@/components/ui/RichTextEditor';
import { MerchantPromotion } from '@/types/merchant';

interface PromotionFormProps {
  promotion: MerchantPromotion;
  index: number;
  onChange: (index: number, field: keyof MerchantPromotion, value: string | boolean) => void;
  errors?: Record<string, string>;
}

export default function PromotionForm({
  promotion,
  index,
  onChange,
  errors = {}
}: PromotionFormProps) {
  const handleFieldChange = (field: keyof MerchantPromotion, value: string | boolean) => {
    onChange(index, field, value);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={promotion.title}
            onChange={(e) => handleFieldChange('title', e.target.value)}
            maxLength={40}
            className={`w-full px-3 py-2 border ${
              errors[`promotions.${index}.title`] ? 'border-red-300' : 'border-gray-300'
            } rounded-md focus:outline-none focus:ring-2 focus:ring-[#A96B11]`}
            placeholder="Maximum 40 characters"
          />
          <div className="mt-1 flex justify-between">
            {errors[`promotions.${index}.title`] && (
              <p className="text-sm text-red-600">{errors[`promotions.${index}.title`]}</p>
            )}
            <p className="text-sm text-gray-500 ml-auto">
              {promotion.title.length}/40
            </p>
          </div>
        </div>

        {/* Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Type <span className="text-red-500">*</span>
          </label>
          <select
            value={promotion.type}
            onChange={(e) => handleFieldChange('type', e.target.value as 'default' | 'common' | 'private')}
            className={`w-full px-3 py-2 border ${
              errors[`promotions.${index}.type`] ? 'border-red-300' : 'border-gray-300'
            } rounded-md focus:outline-none focus:ring-2 focus:ring-[#A96B11]`}
          >
            <option value="default">Default</option>
            <option value="common">Common Use</option>
            <option value="private">Private Use</option>
          </select>
          {errors[`promotions.${index}.type`] && (
            <p className="mt-1 text-sm text-red-600">{errors[`promotions.${index}.type`]}</p>
          )}
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description <span className="text-red-500">*</span>
        </label>
        <RichTextEditor
          value={promotion.description}
          onChange={(value) => handleFieldChange('description', value)}
          placeholder="Maximum 256 characters"
          maxLength={256}
          height="min-h-[100px] max-h-[150px]"
          showPreview={false}
        />
        <div className="mt-1 flex justify-between">
          {errors[`promotions.${index}.description`] && (
            <p className="text-sm text-red-600">{errors[`promotions.${index}.description`]}</p>
          )}
          <p className="text-sm text-gray-500 ml-auto">
            {promotion.description.length}/256
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Start Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Start Date
          </label>
          <input
            type="date"
            value={promotion.startDate}
            onChange={(e) => handleFieldChange('startDate', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#A96B11]"
          />
        </div>

        {/* End Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            End Date
          </label>
          <input
            type="date"
            value={promotion.endDate}
            onChange={(e) => handleFieldChange('endDate', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#A96B11]"
          />
        </div>
      </div>

      {/* Gift Codes - Changed to input */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Gift Codes
        </label>
        <input
          type="text"
          value={promotion.giftcodes}
          onChange={(e) => handleFieldChange('giftcodes', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FF6B2C]"
          placeholder="Enter gift codes separated by commas"
        />
        <p className="mt-1 text-sm text-gray-500">
          Enter gift codes separated by commas (e.g., CODE1, CODE2, CODE3)
        </p>
      </div>

      {/* Requirements */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">
          Requirements
        </label>
        <div className="space-y-2">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={promotion.loginRequired}
              onChange={(e) => handleFieldChange('loginRequired', e.target.checked)}
              className="h-4 w-4 text-[#A96B11] focus:ring-[#A96B11] border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-700">Login Required</span>
          </label>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={promotion.reviewRequired}
              onChange={(e) => handleFieldChange('reviewRequired', e.target.checked)}
              className="h-4 w-4 text-[#A96B11] focus:ring-[#A96B11] border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-700">Review Required</span>
          </label>
        </div>
      </div>
    </div>
  );
}