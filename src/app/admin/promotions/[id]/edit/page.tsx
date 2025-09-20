'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { api } from '@/lib/api';
import { toast } from 'react-hot-toast';
import { MerchantPromotion } from '@/types/merchant';
import PromotionForm from '@/components/admin/promotions/PromotionForm';
import LoadingOverlay from '@/components/ui/LoadingOverlay';

interface Merchant {
  id: string;
  name: string;
  slug: string;
}


export default function EditPromotionPage() {
  const router = useRouter();
  const params = useParams();
  const promotionId = params.id as string;
  
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [merchantId, setMerchantId] = useState('');
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

  useEffect(() => {
    fetchPromotionAndMerchants();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [promotionId]);

  const fetchPromotionAndMerchants = async () => {
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
        }
      }>(`/api/admin/promotions/${promotionId}`);
      if (promotionResponse.data?.promotion) {
        const fetchedPromotion = promotionResponse.data.promotion;

        setMerchantId(fetchedPromotion.merchantId);
        setIsActive(fetchedPromotion.isActive);
        setPromotion({
          id: fetchedPromotion.id,
          title: fetchedPromotion.title,
          description: fetchedPromotion.description,
          type: (fetchedPromotion.type.toLowerCase() as 'default' | 'common' | 'private'),
          startDate: fetchedPromotion.startDate ? new Date(fetchedPromotion.startDate).toISOString().split('T')[0] : '',
          endDate: fetchedPromotion.endDate ? new Date(fetchedPromotion.endDate).toISOString().split('T')[0] : '',
          giftcodes: fetchedPromotion.giftcodes || '',
          loginRequired: fetchedPromotion.loginRequired,
          reviewRequired: fetchedPromotion.reviewRequired
        });
      }

      // Fetch merchants list
      const merchantsResponse = await api.get<{ merchants: Merchant[] }>('/api/admin/merchants?limit=100');
      if (merchantsResponse.data?.merchants) {
        setMerchants(merchantsResponse.data.merchants);
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
        type: promotion.type.toUpperCase(), // Convert to uppercase for backend
        startDate: promotion.startDate,
        endDate: promotion.endDate,
        giftcodes: promotion.giftcodes,
        loginRequired: promotion.loginRequired,
        reviewRequired: promotion.reviewRequired,
        isActive
      };

      const response = await api.patch(`/api/admin/promotions/${promotionId}`, dataToSend);

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
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <svg className="animate-spin h-12 w-12 text-[#FF6B2C] mx-auto" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="mt-2 text-gray-600">Loading promotion details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
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

          {/* Merchant Selection */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Merchant <span className="text-red-500">*</span>
            </label>
            <select
              value={merchantId}
              onChange={(e) => {
                setMerchantId(e.target.value);
                if (errors.merchantId) {
                  setErrors(prev => {
                    const newErrors = { ...prev };
                    delete newErrors.merchantId;
                    return newErrors;
                  });
                }
              }}
              className={`w-full px-3 py-2 border ${
                errors.merchantId ? 'border-red-300' : 'border-gray-300'
              } rounded-md focus:outline-none focus:ring-2 focus:ring-[#A96B11]`}
            >
              <option value="">-- Select a merchant --</option>
              {merchants.map((merchant) => (
                <option key={merchant.id} value={merchant.id}>
                  {merchant.name}
                </option>
              ))}
            </select>
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