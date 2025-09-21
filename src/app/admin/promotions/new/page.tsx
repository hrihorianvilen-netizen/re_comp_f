'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { toast } from 'react-hot-toast';
import { MerchantPromotion } from '@/types/merchant';
import PromotionForm from '@/components/admin/promotions/PromotionForm';
import { v4 as uuidv4 } from 'uuid';
import LoadingOverlay from '@/components/ui/LoadingOverlay';
import { useMerchants } from '@/hooks/useMerchants';

interface Merchant {
  id: string;
  name: string;
  slug: string;
  category?: string;
}

export default function AddPromotionPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [merchantSearch, setMerchantSearch] = useState('');
  const [merchantId, setMerchantId] = useState('');
  const [selectedMerchant, setSelectedMerchant] = useState<{ id: string; name: string } | null>(null);
  const [showMerchantDropdown, setShowMerchantDropdown] = useState(false);
  const [searchDebounce, setSearchDebounce] = useState<NodeJS.Timeout | null>(null);
  const [promotions, setPromotions] = useState<MerchantPromotion[]>([
    {
      id: uuidv4(),
      title: '',
      description: '',
      type: 'common',
      startDate: '',
      endDate: '',
      giftcodes: '',
      loginRequired: false,
      reviewRequired: false
    }
  ]);
  const [expandedPromotion, setExpandedPromotion] = useState<number>(0);

  // Fetch merchants based on search
  const { data: merchantsData, isLoading: merchantsLoading } = useMerchants({
    search: merchantSearch,
    limit: 10,
    excludeDrafts: true
  });

  // Handle clicks outside dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowMerchantDropdown(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounce merchant search
  const handleMerchantSearch = (value: string) => {
    setMerchantSearch(value);
    setSelectedMerchant(null);
    setMerchantId('');

    if (searchDebounce) {
      clearTimeout(searchDebounce);
    }

    if (value.trim()) {
      setShowMerchantDropdown(true);
      const timeout = setTimeout(() => {
        // Search will be triggered automatically by the useMerchants hook
      }, 300);
      setSearchDebounce(timeout);
    } else {
      setShowMerchantDropdown(false);
    }
  };

  const selectMerchant = (merchant: { id: string; name: string }) => {
    setSelectedMerchant(merchant);
    setMerchantId(merchant.id);
    setMerchantSearch(merchant.name);
    setShowMerchantDropdown(false);

    // Clear error when merchant is selected
    if (errors.merchantId) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.merchantId;
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!merchantId) {
      newErrors.merchantId = 'Please select a merchant';
    }

    promotions.forEach((promotion, index) => {
      if (!promotion.title.trim()) {
        newErrors[`promotions.${index}.title`] = 'Title is required';
      }
      if (!promotion.description.trim()) {
        newErrors[`promotions.${index}.description`] = 'Description is required';
      }
      if (!promotion.type) {
        newErrors[`promotions.${index}.type`] = 'Type is required';
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {

    if (!validateForm() || loading) return;

    setLoading(true);
    try {
      // Create all promotions
      const createPromises = promotions.map(promotion => {
        const dataToSend = {
          merchantId,
          title: promotion.title,
          description: promotion.description,
          type: promotion.type, // Keep lowercase for backend
          startDate: promotion.startDate,
          endDate: promotion.endDate,
          giftcodes: promotion.giftcodes,
          loginRequired: promotion.loginRequired,
          reviewRequired: promotion.reviewRequired,
          isActive: true
        };
        return api.post('/admin/promotions', dataToSend);
      });
      await Promise.all(createPromises);

      toast.success(`${promotions.length} promotion(s) created successfully!`);
      router.push('/admin/promotions');

    } catch (error) {
      console.error('Error creating promotion:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create promotion';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    router.push('/admin/promotions');
  };

  const handlePromotionChange = (index: number, field: keyof MerchantPromotion, value: string | boolean) => {
    const updatedPromotions = [...promotions];
    updatedPromotions[index] = {
      ...updatedPromotions[index],
      [field]: value
    };
    setPromotions(updatedPromotions);

    // Clear error when user starts typing
    const errorKey = `promotions.${index}.${field}`;
    if (errors[errorKey]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[errorKey];
        return newErrors;
      });
    }
  };

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
    setPromotions([...promotions, newPromotion]);
    setExpandedPromotion(promotions.length);
  };

  const handleRemovePromotion = (index: number) => {
    if (promotions.length === 1) {
      toast.error('At least one promotion is required');
      return;
    }
    const updatedPromotions = promotions.filter((_, i) => i !== index);
    setPromotions(updatedPromotions);
    if (expandedPromotion === index) {
      setExpandedPromotion(0);
    } else if (expandedPromotion > index) {
      setExpandedPromotion(expandedPromotion - 1);
    }
  };

  const togglePromotion = (index: number) => {
    setExpandedPromotion(expandedPromotion === index ? -1 : index);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header with Save button */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Add Promotions</h1>
          <p className="mt-1 text-sm text-gray-600">
            Create one or more promotions for a merchant
          </p>
        </div>
        <div className="flex space-x-3">
          <button
            type="button"
            onClick={handleBack}
            className="px-6 py-2.5 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors font-medium"
          >
            Back to Promotions
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className={`px-6 py-2.5 rounded-md text-white font-medium transition-colors ${
              loading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-[#A96B11] hover:bg-[#8B560E] active:bg-[#6B4309]'
            }`}
          >
            {loading ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      {/* Form */}
      <div className="space-y-6">
        <div className="bg-white shadow-sm rounded-lg p-6 border border-gray-200">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Promotion Details</h2>

          {/* Merchant Search */}
          <div className="mb-4 relative w-1/2" ref={dropdownRef}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Merchant <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={merchantSearch}
                onChange={(e) => handleMerchantSearch(e.target.value)}
                onFocus={() => merchantSearch && setShowMerchantDropdown(true)}
                placeholder="Search for merchant..."
                autoComplete="off"
                className={`w-full px-3 py-2 pr-10 border ${
                  errors.merchantId ? 'border-red-300' : 'border-gray-300'
                } rounded-md focus:outline-none focus:ring-2 focus:ring-[#A96B11]`}
              />
              {/* Search icon or loading spinner */}
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                {merchantsLoading ? (
                  <svg className="animate-spin h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                )}
              </div>
            </div>

            {/* Merchant dropdown */}
            {showMerchantDropdown && (
              <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
                {merchantsLoading ? (
                  <div className="px-4 py-2 text-gray-500">Searching...</div>
                ) : merchantsData?.merchants && merchantsData.merchants.length > 0 ? (
                  merchantsData.merchants.map((merchant: Merchant) => (
                    <div
                      key={merchant.id}
                      onClick={() => selectMerchant({ id: merchant.id, name: merchant.name })}
                      className="cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-[#A96B11] hover:text-white"
                    >
                      <div className="flex items-center">
                        <span className="font-normal block truncate">
                          {merchant.name}
                        </span>
                        {merchant.category && (
                          <span className="ml-2 text-xs opacity-75">
                            ({merchant.category})
                          </span>
                        )}
                      </div>
                      {selectedMerchant?.id === merchant.id && (
                        <span className="absolute inset-y-0 right-0 flex items-center pr-4">
                          <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </span>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="px-4 py-2 text-gray-500">
                    {merchantSearch ? 'No merchants found' : 'Type to search merchants'}
                  </div>
                )}
              </div>
            )}

            {errors.merchantId && (
              <p className="mt-1 text-sm text-red-600">{errors.merchantId}</p>
            )}
          </div>

          {/* Promotions List */}
          <div className="space-y-4">
            {promotions.map((promotion, index) => (
              <div key={promotion.id} className="border border-gray-200 rounded-lg overflow-hidden">
                {/* Promotion Header */}
                <div
                  className="bg-gray-50 px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-gray-100"
                  onClick={() => togglePromotion(index)}
                >
                  <div className="flex items-center space-x-3">
                    <svg
                      className={`h-5 w-5 text-gray-500 transform transition-transform ${
                        expandedPromotion === index ? 'rotate-90' : ''
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    <span className="font-medium text-gray-900">
                      {promotion.title || `Promotion ${index + 1}`}
                    </span>
                    {promotion.type && (
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        promotion.type === 'default' ? 'bg-blue-100 text-blue-800' :
                        promotion.type === 'common' ? 'bg-green-100 text-green-800' :
                        'bg-purple-100 text-purple-800'
                      }`}>
                        {promotion.type === 'default' ? 'Default' :
                         promotion.type === 'common' ? 'Common' : 'Private'}
                      </span>
                    )}
                  </div>
                  {promotions.length > 1 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemovePromotion(index);
                      }}
                      className="text-red-600 hover:text-red-800"
                    >
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  )}
                </div>

                {/* Promotion Content */}
                {expandedPromotion === index && (
                  <div className="p-4 bg-white">
                    <PromotionForm
                      promotion={promotion}
                      index={index}
                      onChange={handlePromotionChange}
                      errors={errors}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Add Promotion Button */}
          <div className="flex justify-center pt-4">
            <button
              type="button"
              onClick={handleAddPromotion}
              className="inline-flex items-center px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-[#A96B11] hover:text-[#A96B11] transition-colors"
            >
              <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Another Promotion
            </button>
          </div>
        </div>

      </div>

      {/* Loading Overlay */}
      <LoadingOverlay
        show={loading}
        message={`Creating ${promotions.length} promotion(s)...`}
      />
    </div>
  );
}