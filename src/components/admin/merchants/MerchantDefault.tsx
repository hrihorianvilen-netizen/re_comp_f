"use client";

import { useState } from 'react';

interface DefaultPromotion {
  title: string;
  description: string;
}

interface PromotePromotion {
  title: string;
  description: string;
  type: string;
  startDate: string;
  endDate: string;
  giftcodes: string;
  loginRequired: boolean;
  reviewRequired: boolean;
}

interface MerchantDefaultProps {
  initialDefaultPromotion?: DefaultPromotion;
  initialPromotePromotion?: PromotePromotion;
  onDefaultChange?: (data: DefaultPromotion) => void;
  onPromoteChange?: (data: PromotePromotion) => void;
}

export default function MerchantDefault({
  initialDefaultPromotion,
  initialPromotePromotion,
  onDefaultChange,
  onPromoteChange
}: MerchantDefaultProps = {}) {
  const [defaultPromotion, setDefaultPromotion] = useState<DefaultPromotion>(
    initialDefaultPromotion || {
      title: '',
      description: ''
    }
  );

  const [promotePromotion, setPromotePromotion] = useState<PromotePromotion>(
    initialPromotePromotion || {
      title: '',
      description: '',
      type: '',
      startDate: '',
      endDate: '',
      giftcodes: '',
      loginRequired: false,
      reviewRequired: false
    }
  );

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleDefaultChange = (field: keyof DefaultPromotion, value: string) => {
    const newData = { ...defaultPromotion, [field]: value };
    setDefaultPromotion(newData);
    
    // Validate character limits
    if (field === 'title' && value.length > 40) {
      setErrors(prev => ({ ...prev, default_title: 'Title must be 40 characters or less' }));
    } else if (field === 'description' && value.length > 256) {
      setErrors(prev => ({ ...prev, default_description: 'Description must be 256 characters or less' }));
    } else {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[`default_${field}`];
        return newErrors;
      });
    }

    onDefaultChange?.(newData);
  };

  const handlePromoteChange = (field: keyof PromotePromotion, value: string | boolean) => {
    const newData = { ...promotePromotion, [field]: value };
    setPromotePromotion(newData);
    
    // Validate character limits for string fields
    if (field === 'title' && typeof value === 'string' && value.length > 40) {
      setErrors(prev => ({ ...prev, promote_title: 'Title must be 40 characters or less' }));
    } else if (field === 'description' && typeof value === 'string' && value.length > 256) {
      setErrors(prev => ({ ...prev, promote_description: 'Description must be 256 characters or less' }));
    } else {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[`promote_${field}`];
        return newErrors;
      });
    }

    onPromoteChange?.(newData);
  };

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-6 py-4">
        <h3 className="text-lg font-medium text-gray-900">Default Promotion</h3>
      </div>
      <div className="px-6 py-4 space-y-6">
        <div>
          <label
            htmlFor="default_title"
            className="block text-sm font-medium text-gray-700"
          >
            Title
          </label>
          <input
            type="text"
            name="default_title"
            id="default_title"
            value={defaultPromotion.title}
            onChange={(e) => handleDefaultChange('title', e.target.value)}
            maxLength={40}
            className={`mt-1 block w-full px-3 py-2 border ${errors.default_title ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#A96B11] focus:border-transparent`}
            placeholder="Maximum 40 characters"
          />
          <div className="mt-1 flex justify-between">
            {errors.default_title && <p className="text-sm text-red-600">{errors.default_title}</p>}
            <p className="text-sm text-gray-500 ml-auto">{defaultPromotion.title?.length || 0}/40</p>
          </div>
        </div>
        <div>
          <label
            htmlFor="default_description"
            className="block text-sm font-medium text-gray-700"
          >
            Description
          </label>
          <textarea
            name="default_description"
            id="default_description"
            value={defaultPromotion.description}
            onChange={(e) => handleDefaultChange('description', e.target.value)}
            maxLength={256}
            rows={3}
            className={`mt-1 block w-full px-3 py-2 border ${errors.default_description ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#A96B11] focus:border-transparent`}
            placeholder="Maximum 256 characters"
          />
          <div className="mt-1 flex justify-between">
            {errors.default_description && <p className="text-sm text-red-600">{errors.default_description}</p>}
            <p className="text-sm text-gray-500 ml-auto">{defaultPromotion.description?.length || 0}/256</p>
          </div>
        </div>
      </div>
      <div className="px-6 py-4">
        <h3 className="text-lg font-medium text-gray-900">Promote Promotion</h3>
      </div>
      <div className="px-6 py-4 space-y-6">
        <div>
          <label
            htmlFor="promote_title"
            className="block text-sm font-medium text-gray-700"
          >
            Title
          </label>
          <input
            type="text"
            name="promote_title"
            id="promote_title"
            value={promotePromotion.title}
            onChange={(e) => handlePromoteChange('title', e.target.value)}
            maxLength={40}
            className={`mt-1 block w-full px-3 py-2 border ${errors.promote_title ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#A96B11] focus:border-transparent`}
            placeholder="Maximum 40 characters"
          />
          <div className="mt-1 flex justify-between">
            {errors.promote_title && <p className="text-sm text-red-600">{errors.promote_title}</p>}
            <p className="text-sm text-gray-500 ml-auto">{promotePromotion.title?.length || 0}/40</p>
          </div>
        </div>
        <div>
          <label
            htmlFor="promote_description"
            className="block text-sm font-medium text-gray-700"
          >
            Description
          </label>
          <textarea
            name="promote_description"
            id="promote_description"
            value={promotePromotion.description}
            onChange={(e) => handlePromoteChange('description', e.target.value)}
            maxLength={256}
            rows={3}
            className={`mt-1 block w-full px-3 py-2 border ${errors.promote_description ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#A96B11] focus:border-transparent`}
            placeholder="Maximum 256 characters"
          />
          <div className="mt-1 flex justify-between">
            {errors.promote_description && <p className="text-sm text-red-600">{errors.promote_description}</p>}
            <p className="text-sm text-gray-500 ml-auto">{promotePromotion.description?.length || 0}/256</p>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <label
              htmlFor="promote_type"
              className="block text-sm font-medium text-gray-700"
            >
              Type
            </label>
            <select 
              value={promotePromotion.type}
              onChange={(e) => handlePromoteChange('type', e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#A96B11] focus:border-transparent"
            >
              <option value="">Common Use</option>
              <option value="5">5 Stars</option>
              <option value="4">4+ Stars</option>
              <option value="3">3+ Stars</option>
              <option value="2">2+ Stars</option>
              <option value="1">1+ Stars</option>
            </select>
          </div>
          <div className="lg:col-span-1">
            <label
              htmlFor="promote_start_date"
              className="block text-sm font-medium text-gray-700"
            >
              Start date
            </label>
            <input
              type="date"
              name="promote_start_date"
              id="promote_start_date"
              value={promotePromotion.startDate}
              onChange={(e) => handlePromoteChange('startDate', e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#A96B11] focus:border-transparent"
            />
          </div>
          <div className="lg:col-span-1">
            <label
              htmlFor="promote_end_date"
              className="block text-sm font-medium text-gray-700"
            >
              End date
            </label>
            <input
              type="date"
              name="promote_end_date"
              id="promote_end_date"
              value={promotePromotion.endDate}
              onChange={(e) => handlePromoteChange('endDate', e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#A96B11] focus:border-transparent"
            />
          </div>
        </div>
        <div>
          <label
            htmlFor="promote_giftcode"
            className="block text-sm font-medium text-gray-700"
          >
            Giftcode(s)
          </label>
          <input
            type="text"
            name="promote_giftcode"
            id="promote_giftcode"
            value={promotePromotion.giftcodes}
            onChange={(e) => handlePromoteChange('giftcodes', e.target.value)}
            className={`mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#A96B11] focus:border-transparent`}
            placeholder="Each code is separated by a semicolon"
          />
        </div>
        <div className="flex gap-6">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              name="login_required"
              id="login_required"
              checked={promotePromotion.loginRequired}
              onChange={(e) => handlePromoteChange('loginRequired', e.target.checked)}
              className="h-4 w-4 text-[#A96B11] focus:ring-[#A96B11] border-gray-300 rounded"
            />
            <label
              htmlFor="login_required"
              className="block text-sm font-medium text-gray-700"
            >
              Login required to claim
            </label>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              name="review_required"
              id="review_required"
              checked={promotePromotion.reviewRequired}
              onChange={(e) => handlePromoteChange('reviewRequired', e.target.checked)}
              className="h-4 w-4 text-[#A96B11] focus:ring-[#A96B11] border-gray-300 rounded"
            />
            <label
              htmlFor="review_required"
              className="block text-sm font-medium text-gray-700"
            >
              Review required to claim
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
