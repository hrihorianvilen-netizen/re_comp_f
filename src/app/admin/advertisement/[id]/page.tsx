'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import OptimizedImage from '@/components/ui/OptimizedImage';
import { useAd, useUpdateAd, usePublishAd, useArchiveAd, useDeleteAd } from '@/hooks/useAds';
import { getImageUrl } from '@/lib/utils';

export default function AdvertisementDetailPage() {
  const router = useRouter();
  const params = useParams();
  const adId = params.id as string;

  // Fetch ad data
  const { data: ad, isLoading: adLoading } = useAd(adId);
  const updateAdMutation = useUpdateAd();
  const publishAdMutation = usePublishAd();
  const archiveAdMutation = useArchiveAd();
  const deleteAdMutation = useDeleteAd();

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    merchantId: '',
    merchantSearch: '',
    slot: '',
    order: '',
    title: '',
    description: '',
    duration: '',
    startDate: '',
    endDate: '',
    bannerImage: null as File | null,
    targetUrl: '',
    utmSource: '',
    utmCampaign: '',
    utmContent: '',
  });

  const [imagePreview, setImagePreview] = useState<string>('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load advertisement data when it's fetched
  useEffect(() => {
    if (ad) {
      setFormData({
        merchantId: ad.merchantId || '',
        merchantSearch: ad.merchant?.name || '',
        slot: ad.slot || '',
        order: ad.order?.toString() || '',
        title: ad.title || '',
        description: ad.description || '',
        duration: ad.duration || '',
        startDate: ad.startDate ? new Date(ad.startDate).toISOString().split('T')[0] : '',
        endDate: ad.endDate ? new Date(ad.endDate).toISOString().split('T')[0] : '',
        bannerImage: null,
        targetUrl: ad.link || '',
        utmSource: ad.utmSource || '',
        utmCampaign: ad.utmCampaign || '',
        utmContent: ad.utmContent || '',
      });
      const imageUrl = ad.imageUrl && ad.imageUrl !== '' ? getImageUrl(ad.imageUrl) : '';
      setImagePreview(imageUrl);
    }
  }, [ad]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData(prev => ({ ...prev, bannerImage: file }));

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.slot) newErrors.slot = 'Slot is required';
    if (!formData.order.trim()) newErrors.order = 'Order is required';
    if (!formData.duration) newErrors.duration = 'Duration is required';
    if (!formData.startDate) newErrors.startDate = 'Start date is required';
    if (!formData.endDate) newErrors.endDate = 'End date is required';
    if (!formData.targetUrl.trim()) newErrors.targetUrl = 'Target URL is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    if (isSaving) return;

    setIsSaving(true);

    try {
      const formDataToSend = new FormData();

      // Add text fields
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      if (formData.merchantId) formDataToSend.append('merchantId', formData.merchantId);
      formDataToSend.append('targetUrl', formData.targetUrl);
      formDataToSend.append('slot', formData.slot);
      formDataToSend.append('order', formData.order);
      formDataToSend.append('duration', formData.duration);
      formDataToSend.append('startDate', new Date(formData.startDate).toISOString());
      formDataToSend.append('endDate', new Date(formData.endDate).toISOString());
      formDataToSend.append('utmSource', formData.utmSource);
      formDataToSend.append('utmCampaign', formData.utmCampaign);
      if (formData.utmContent) formDataToSend.append('utmContent', formData.utmContent);

      // Add image file if changed
      if (formData.bannerImage) {
        formDataToSend.append('image', formData.bannerImage);
      }

      await updateAdMutation.mutateAsync({ id: adId, data: formDataToSend });
      setIsEditing(false);
      alert('Advertisement updated successfully!');
    } catch (error) {
      console.error('Failed to update advertisement:', error);
      alert('Failed to update advertisement. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublish = async () => {
    if (confirm('Are you sure you want to publish this advertisement?')) {
      try {
        await publishAdMutation.mutateAsync(adId);
        alert('Advertisement published successfully!');
        router.refresh();
      } catch (error) {
        console.error('Failed to publish advertisement:', error);
        alert('Failed to publish advertisement.');
      }
    }
  };

  const handleArchive = async () => {
    if (confirm('Are you sure you want to archive this advertisement?')) {
      try {
        await archiveAdMutation.mutateAsync(adId);
        alert('Advertisement archived successfully!');
        router.refresh();
      } catch (error) {
        console.error('Failed to archive advertisement:', error);
        alert('Failed to archive advertisement.');
      }
    }
  };

  const handleTrash = async () => {
    if (confirm('Are you sure you want to move this advertisement to trash?')) {
      try {
        await deleteAdMutation.mutateAsync(adId);
        alert('Advertisement moved to trash!');
        router.push('/admin/advertisement');
      } catch (error) {
        console.error('Failed to delete advertisement:', error);
        alert('Failed to delete advertisement.');
      }
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset form to original values
    if (ad) {
      setFormData({
        merchantId: ad.merchantId || '',
        merchantSearch: ad.merchant?.name || '',
        slot: ad.slot || '',
        order: ad.order?.toString() || '',
        title: ad.title || '',
        description: ad.description || '',
        duration: ad.duration || '',
        startDate: ad.startDate ? new Date(ad.startDate).toISOString().split('T')[0] : '',
        endDate: ad.endDate ? new Date(ad.endDate).toISOString().split('T')[0] : '',
        bannerImage: null,
        targetUrl: ad.link || '',
        utmSource: ad.utmSource || '',
        utmCampaign: ad.utmCampaign || '',
        utmContent: ad.utmContent || '',
      });
      const imageUrl = ad.imageUrl && ad.imageUrl !== '' ? getImageUrl(ad.imageUrl) : '';
      setImagePreview(imageUrl);
    }
  };

  if (adLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#A96B11]"></div>
      </div>
    );
  }

  if (!ad) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Advertisement not found</h2>
          <button
            onClick={() => router.push('/admin/advertisement')}
            className="text-[#A96B11] hover:underline cursor-pointer"
          >
            Back to advertisements
          </button>
        </div>
      </div>
    );
  }


  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/admin/advertisement')}
              className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 cursor-pointer"
            >
              <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Advertisement Details</h1>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              ad.status === 'published' ? 'bg-green-100 text-green-800' :
              ad.status === 'draft' ? 'bg-gray-100 text-gray-800' :
              ad.status === 'archive' ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              {ad.status}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {ad.status === 'draft' && (
              <button
                onClick={handlePublish}
                disabled={publishAdMutation.isPending}
                className="px-4 py-2 rounded-md text-sm font-medium transition-colors text-white bg-green-600 hover:bg-green-700 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {publishAdMutation.isPending ? 'Publishing...' : 'Publish'}
              </button>
            )}
            {ad.status === 'published' && (
              <button
                onClick={handleArchive}
                disabled={archiveAdMutation.isPending}
                className="px-4 py-2 rounded-md text-sm font-medium transition-colors text-white bg-yellow-600 hover:bg-yellow-700 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {archiveAdMutation.isPending ? 'Archiving...' : 'Archive'}
              </button>
            )}
            {!isEditing ? (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 rounded-md text-sm font-medium transition-colors text-gray-700 border border-gray-300 hover:bg-gray-50 cursor-pointer"
                >
                  Edit
                </button>
                <button
                  onClick={handleTrash}
                  disabled={deleteAdMutation.isPending}
                  className="px-4 py-2 rounded-md text-sm font-medium transition-colors text-white bg-red-600 hover:bg-red-700 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {deleteAdMutation.isPending ? 'Deleting...' : 'Trash'}
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleCancel}
                  disabled={isSaving}
                  className="px-4 py-2 rounded-md text-sm font-medium transition-colors text-gray-500 border border-gray-300 hover:bg-gray-50 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="px-4 py-2 rounded-md text-sm font-medium transition-colors text-white bg-[#A96B11] hover:bg-[#8b5a0e] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Advertisement Information</h2>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-6">
                {/* Title */}
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#A96B11] ${
                      errors.title ? 'border-red-500' : 'border-gray-300'
                    } ${!isEditing ? 'bg-gray-100' : ''}`}
                  />
                  {errors.title && (
                    <p className="mt-1 text-sm text-red-600">{errors.title}</p>
                  )}
                </div>

                {/* Description */}
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    rows={3}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#A96B11] border-gray-300 ${
                      !isEditing ? 'bg-gray-100' : ''
                    }`}
                  />
                </div>

                {/* Slot and Order */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="slot" className="block text-sm font-medium text-gray-700 mb-2">
                      Slot <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="slot"
                      name="slot"
                      value={formData.slot}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#A96B11] ${
                        errors.slot ? 'border-red-500' : 'border-gray-300'
                      } ${!isEditing ? 'bg-gray-100' : ''}`}
                    >
                      <option value="">Select slot</option>
                      <option value="top">Top</option>
                      <option value="sidebar">Sidebar</option>
                      <option value="footer">Footer</option>
                      <option value="inline">Inline</option>
                    </select>
                    {errors.slot && (
                      <p className="mt-1 text-sm text-red-600">{errors.slot}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="order" className="block text-sm font-medium text-gray-700 mb-2">
                      Order <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      id="order"
                      name="order"
                      value={formData.order}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      min="1"
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#A96B11] ${
                        errors.order ? 'border-red-500' : 'border-gray-300'
                      } ${!isEditing ? 'bg-gray-100' : ''}`}
                    />
                    {errors.order && (
                      <p className="mt-1 text-sm text-red-600">{errors.order}</p>
                    )}
                  </div>
                </div>

                {/* Duration and Dates */}
                <div>
                  <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-2">
                    Duration <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="duration"
                    name="duration"
                    value={formData.duration}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#A96B11] ${
                      errors.duration ? 'border-red-500' : 'border-gray-300'
                    } ${!isEditing ? 'bg-gray-100' : ''}`}
                  >
                    <option value="">Select duration</option>
                    <option value="1d">1 day</option>
                    <option value="3d">3 days</option>
                    <option value="7d">7 days</option>
                    <option value="2w">2 weeks</option>
                    <option value="1m">1 month</option>
                    <option value="2m">2 months</option>
                    <option value="3m">3 months</option>
                    <option value="custom">Custom</option>
                  </select>
                  {errors.duration && (
                    <p className="mt-1 text-sm text-red-600">{errors.duration}</p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-2">
                      Start Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      id="startDate"
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#A96B11] ${
                        errors.startDate ? 'border-red-500' : 'border-gray-300'
                      } ${!isEditing ? 'bg-gray-100' : ''}`}
                    />
                    {errors.startDate && (
                      <p className="mt-1 text-sm text-red-600">{errors.startDate}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-2">
                      End Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      id="endDate"
                      name="endDate"
                      value={formData.endDate}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#A96B11] ${
                        errors.endDate ? 'border-red-500' : 'border-gray-300'
                      } ${!isEditing ? 'bg-gray-100' : ''}`}
                    />
                    {errors.endDate && (
                      <p className="mt-1 text-sm text-red-600">{errors.endDate}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column - Banner Image */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Banner Image
                </label>
                <div className="space-y-4">
                  {/* Image Preview */}
                  {imagePreview && imagePreview !== '' ? (
                    <div className="relative">
                      <OptimizedImage
                        src={imagePreview || '/images/placeholder.jpg'}
                        alt="Banner preview"
                        width={400}
                        height={256}
                        className="w-full h-64 object-cover rounded-lg border border-gray-300"
                        sizeType="card"
                        qualityPriority="low"
                      />
                      {isEditing && (
                        <button
                          type="button"
                          onClick={() => {
                            setImagePreview('');
                            setFormData(prev => ({ ...prev, bannerImage: null }));
                          }}
                          className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 cursor-pointer"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p className="mt-2 text-sm text-gray-600">No image uploaded</p>
                    </div>
                  )}

                  {/* Upload Button */}
                  {isEditing && (
                    <div>
                      <label
                        htmlFor="bannerImage"
                        className="cursor-pointer inline-flex items-center px-4 py-2 border border-[#A96B11] rounded-md shadow-sm text-sm font-medium text-[#A96B11] bg-white hover:bg-[#A96B11] hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#A96B11] transition-colors"
                      >
                        Choose New Image
                      </label>
                      <input
                        type="file"
                        id="bannerImage"
                        name="bannerImage"
                        onChange={handleImageChange}
                        accept="image/*"
                        className="hidden"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* UTM Parameters */}
            <div className="mt-8 pt-8 border-t border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-4">UTM Tracking</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="targetUrl" className="block text-sm font-medium text-gray-700 mb-2">
                    Target URL <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="url"
                    id="targetUrl"
                    name="targetUrl"
                    value={formData.targetUrl}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#A96B11] ${
                      errors.targetUrl ? 'border-red-500' : 'border-gray-300'
                    } ${!isEditing ? 'bg-gray-100' : ''}`}
                  />
                  {errors.targetUrl && (
                    <p className="mt-1 text-sm text-red-600">{errors.targetUrl}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="utmSource" className="block text-sm font-medium text-gray-700 mb-2">
                    UTM Source
                  </label>
                  <input
                    type="text"
                    id="utmSource"
                    name="utmSource"
                    value={formData.utmSource}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#A96B11] border-gray-300 ${
                      !isEditing ? 'bg-gray-100' : ''
                    }`}
                  />
                </div>

                <div>
                  <label htmlFor="utmCampaign" className="block text-sm font-medium text-gray-700 mb-2">
                    UTM Campaign
                  </label>
                  <input
                    type="text"
                    id="utmCampaign"
                    name="utmCampaign"
                    value={formData.utmCampaign}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#A96B11] border-gray-300 ${
                      !isEditing ? 'bg-gray-100' : ''
                    }`}
                  />
                </div>

                <div>
                  <label htmlFor="utmContent" className="block text-sm font-medium text-gray-700 mb-2">
                    UTM Content
                  </label>
                  <input
                    type="text"
                    id="utmContent"
                    name="utmContent"
                    value={formData.utmContent}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#A96B11] border-gray-300 ${
                      !isEditing ? 'bg-gray-100' : ''
                    }`}
                  />
                </div>
              </div>
            </div>

            {/* Metrics */}
            {ad && (
              <div className="mt-8 pt-8 border-t border-gray-200">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Performance Metrics</h3>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm font-medium text-gray-500">Impressions</p>
                    <p className="mt-1 text-2xl font-semibold text-gray-900">{ad.impressions || 0}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm font-medium text-gray-500">Clicks</p>
                    <p className="mt-1 text-2xl font-semibold text-gray-900">{ad.clicks || 0}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm font-medium text-gray-500">CTR</p>
                    <p className="mt-1 text-2xl font-semibold text-gray-900">
                      {ad.ctr ? `${(ad.ctr * 100).toFixed(2)}%` : '0%'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}