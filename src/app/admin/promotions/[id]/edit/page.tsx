'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { api } from '@/lib/api';
import { toast } from 'react-hot-toast';
import { MerchantPromotion } from '@/types/merchant';
import PromotionForm from '@/components/admin/promotions/PromotionForm';
import LoadingOverlay from '@/components/ui/LoadingOverlay';
import { useMerchants } from '@/hooks/useMerchants';

interface Merchant {
  id: string;
  name: string;
  slug: string;
  category?: string;
}


export default function EditPromotionPage() {
  const router = useRouter();
  const params = useParams();
  const promotionId = params.id as string;
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [merchantSearch, setMerchantSearch] = useState('');
  const [merchantId, setMerchantId] = useState('');
  const [selectedMerchant, setSelectedMerchant] = useState<{ id: string; name: string } | null>(null);
  const [showMerchantDropdown, setShowMerchantDropdown] = useState(false);
  const [searchDebounce, setSearchDebounce] = useState<NodeJS.Timeout | null>(null);
  const [isActive, setIsActive] = useState(true);
  const [promotion, setPromotion] = useState<MerchantPromotion>({
    id: '',
    title: '',
    description: '',
    type: 'common',
    startDate: '',
    endDate: '',
    giftcodes: '',
    loginRequired: false,
    reviewRequired: false
  });

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

  useEffect(() => {
    fetchPromotionData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [promotionId]);

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

  const fetchPromotionData = async () => {
    try {
      // Fetch promotion details
      const promotionResponse = await api.get<{
        promotion: {
          id: string;
          merchantId: string;
          title: string;
          description: string;
          type: string;
          startDate: string | null;
          endDate: string | null;
          giftcodes?: string;
          loginRequired: boolean;
          reviewRequired: boolean;
          isActive: boolean;
          merchant?: {
            id: string;
            name: string;
          };
        }
      }>(`/admin/promotions/${promotionId}`);
      if (promotionResponse.data?.promotion) {
        const fetchedPromotion = promotionResponse.data.promotion;

        setMerchantId(fetchedPromotion.merchantId);
        setIsActive(fetchedPromotion.isActive);

        // Set the merchant info for the search field
        if (fetchedPromotion.merchant) {
          setSelectedMerchant({ id: fetchedPromotion.merchant.id, name: fetchedPromotion.merchant.name });
          setMerchantSearch(fetchedPromotion.merchant.name);
        }

        setPromotion({
          id: fetchedPromotion.id,
          title: fetchedPromotion.title,
          description: fetchedPromotion.description,
          type: (fetchedPromotion.type as 'default' | 'common' | 'private'),
          startDate: fetchedPromotion.startDate ? new Date(fetchedPromotion.startDate).toISOString().split('T')[0] : '',
          endDate: fetchedPromotion.endDate ? new Date(fetchedPromotion.endDate).toISOString().split('T')[0] : '',
          giftcodes: fetchedPromotion.giftcodes || '',
          loginRequired: fetchedPromotion.loginRequired,
          reviewRequired: fetchedPromotion.reviewRequired
        });
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load promotion details');
      router.push('/admin/promotions');
    } finally {
      setFetching(false);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!merchantId) {
      newErrors.merchantId = 'Please select a merchant';
    }
    if (!promotion.title.trim()) {
      newErrors['promotions.0.title'] = 'Title is required';
    }
    if (!promotion.description.trim()) {
      newErrors['promotions.0.description'] = 'Description is required';
    }
    if (!promotion.type) {
      newErrors['promotions.0.type'] = 'Type is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm() || loading) return;

    setLoading(true);
    try {
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
        isActive
      };

      const response = await api.patch(`/admin/promotions/${promotionId}`, dataToSend);

      if (response.data) {
        toast.success('Promotion updated successfully!');
        router.push('/admin/promotions');
      } else {
        throw new Error('Failed to update promotion');
      }
    } catch (error) {
      console.error('Error updating promotion:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to update promotion';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.push('/admin/promotions');
  };

  const handlePromotionChange = (index: number, field: keyof MerchantPromotion, value: string | boolean) => {
    setPromotion(prev => ({
      ...prev,
      [field]: value
    }));

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

  if (fetching) {
    return (
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#A96B11]"></div>
            <p className="mt-2 text-gray-500">Loading promotion details...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Edit Promotion</h1>
        <p className="mt-1 text-sm text-gray-600">
          Update promotion details
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white shadow-sm rounded-lg p-6 border border-gray-200">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Promotion Details</h2>

          {/* Merchant Search */}
          <div className="mb-4 relative" ref={dropdownRef}>
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

          {/* Promotion Form */}
          <PromotionForm
            promotion={promotion}
            index={0}
            onChange={handlePromotionChange}
            errors={errors}
          />

          {/* Active Status */}
          <div className="mt-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="h-4 w-4 text-[#A96B11] focus:ring-[#A96B11] border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">Active</span>
            </label>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={handleCancel}
            className="px-6 py-2.5 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className={`px-6 py-2.5 rounded-md text-white font-medium transition-colors ${
              loading
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-[#A96B11] hover:bg-[#8B560E] active:bg-[#6B4309]'
            }`}
          >
            {loading ? 'Updating...' : 'Update Promotion'}
          </button>
        </div>
      </form>

      {/* Loading Overlay */}
      <LoadingOverlay
        show={loading}
        message="Updating promotion..."
      />
    </div>
  );
}