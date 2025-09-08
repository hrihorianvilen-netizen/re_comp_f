'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function NewAdvertisementPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    merchantSearch: '',
    slot: '',
    order: '',
    adName: '',
    version: '',
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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

    if (!formData.merchantSearch.trim()) newErrors.merchantSearch = 'Merchant is required';
    if (!formData.slot) newErrors.slot = 'Slot is required';
    if (!formData.order.trim()) newErrors.order = 'Order is required';
    if (!formData.adName.trim()) newErrors.adName = 'Ad name is required';
    if (!formData.version) newErrors.version = 'Version is required';
    if (!formData.duration) newErrors.duration = 'Duration is required';
    if (!formData.startDate) newErrors.startDate = 'Start date is required';
    if (!formData.endDate) newErrors.endDate = 'End date is required';
    if (!formData.bannerImage && !imagePreview) newErrors.bannerImage = 'Banner image is required';
    if (!formData.targetUrl.trim()) newErrors.targetUrl = 'Target URL is required';
    if (!formData.utmSource.trim()) newErrors.utmSource = 'UTM Source is required';
    if (!formData.utmCampaign.trim()) newErrors.utmCampaign = 'UTM Campaign is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = () => {
    if (!validateForm()) return;
    
    console.log('Saving advertisement:', formData);
    // In a real app, this would save to the backend
    router.push('/admin/advertisement');
  };

  const handleDiscard = () => {
    if (confirm('Are you sure you want to discard all changes?')) {
      router.push('/admin/advertisement');
    }
  };

  return (
    <div className="py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900">Add Advertisement</h1>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-700 text-white">
              Draft
            </span>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={handleDiscard}
              className="px-4 py-2 rounded-md text-sm font-medium transition-colors text-gray-500 border border-gray-300 hover:bg-gray-50"
            >
              Discard
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 rounded-md text-sm font-medium transition-colors text-white bg-[#A96B11] hover:bg-[#8b5a0e]"
            >
              Save
            </button>
          </div>
        </div>

        {/* Post Ad Section */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Post Ad</h2>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-6">
                {/* Merchant Search */}
                <div>
                  <label htmlFor="merchantSearch" className="block text-sm font-medium text-gray-700 mb-2">
                    Merchant <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="merchantSearch"
                    name="merchantSearch"
                    value={formData.merchantSearch}
                    onChange={handleInputChange}
                    placeholder="Search for merchant..."
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#A96B11] ${
                      errors.merchantSearch ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.merchantSearch && (
                    <p className="mt-1 text-sm text-red-600">{errors.merchantSearch}</p>
                  )}
                </div>

                {/* Slot and Order */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Slot Dropdown */}
                  <div>
                    <label htmlFor="slot" className="block text-sm font-medium text-gray-700 mb-2">
                      Slot <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="slot"
                      name="slot"
                      value={formData.slot}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#A96B11] ${
                        errors.slot ? 'border-red-500' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Select slot</option>
                      <option value="header">Header</option>
                      <option value="sidebar">Sidebar</option>
                      <option value="footer">Footer</option>
                      <option value="content">Content</option>
                      <option value="popup">Popup</option>
                    </select>
                    {errors.slot && (
                      <p className="mt-1 text-sm text-red-600">{errors.slot}</p>
                    )}
                  </div>

                  {/* Order */}
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
                      placeholder="Display order"
                      min="1"
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#A96B11] ${
                        errors.order ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.order && (
                      <p className="mt-1 text-sm text-red-600">{errors.order}</p>
                    )}
                  </div>
                </div>

                {/* Ad Name */}
                <div>
                  <label htmlFor="adName" className="block text-sm font-medium text-gray-700 mb-2">
                    Ad Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="adName"
                    name="adName"
                    value={formData.adName}
                    onChange={handleInputChange}
                    placeholder="Enter advertisement name"
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#A96B11] ${
                      errors.adName ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {errors.adName && (
                    <p className="mt-1 text-sm text-red-600">{errors.adName}</p>
                  )}
                </div>

                {/* Version and Duration */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Version Dropdown */}
                  <div>
                    <label htmlFor="version" className="block text-sm font-medium text-gray-700 mb-2">
                      Version <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="version"
                      name="version"
                      value={formData.version}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#A96B11] ${
                        errors.version ? 'border-red-500' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Select version</option>
                      <option value="v1">Version 1</option>
                      <option value="v2">Version 2</option>
                      <option value="v3">Version 3</option>
                      <option value="ab-test">A/B Test</option>
                    </select>
                    {errors.version && (
                      <p className="mt-1 text-sm text-red-600">{errors.version}</p>
                    )}
                  </div>

                  {/* Duration Dropdown */}
                  <div>
                    <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-2">
                      Duration <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="duration"
                      name="duration"
                      value={formData.duration}
                      onChange={handleInputChange}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#A96B11] ${
                        errors.duration ? 'border-red-500' : 'border-gray-300'
                      }`}
                    >
                      <option value="">Select duration</option>
                      <option value="7">7 days</option>
                      <option value="14">14 days</option>
                      <option value="21">21 days</option>
                      <option value="30">30 days</option>
                      <option value="45">45 days</option>
                      <option value="60">60 days</option>
                      <option value="90">90 days</option>
                      <option value="custom">Custom</option>
                    </select>
                    {errors.duration && (
                      <p className="mt-1 text-sm text-red-600">{errors.duration}</p>
                    )}
                  </div>
                </div>

                {/* Start and End Date */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Start Date */}
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
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#A96B11] ${
                        errors.startDate ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.startDate && (
                      <p className="mt-1 text-sm text-red-600">{errors.startDate}</p>
                    )}
                  </div>

                  {/* End Date */}
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
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#A96B11] ${
                        errors.endDate ? 'border-red-500' : 'border-gray-300'
                      }`}
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
                  Banner Image <span className="text-red-500">*</span>
                </label>
                <div className="space-y-4">
                  {/* Image Preview */}
                  {imagePreview ? (
                    <div className="relative">
                      <img
                        src={imagePreview}
                        alt="Banner preview"
                        className="w-full h-64 object-cover rounded-lg border border-gray-300"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setImagePreview('');
                          setFormData(prev => ({ ...prev, bannerImage: null }));
                        }}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <div className={`border-2 border-dashed rounded-lg p-6 text-center ${
                      errors.bannerImage ? 'border-red-500' : 'border-gray-300'
                    }`}>
                      <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p className="mt-2 text-sm text-gray-600">Upload banner image</p>
                      <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                    </div>
                  )}
                  
                  {/* Upload Button */}
                  <div>
                    <label
                      htmlFor="bannerImage"
                      className="cursor-pointer inline-flex items-center px-4 py-2 border border-[#A96B11] rounded-md shadow-sm text-sm font-medium text-[#A96B11] bg-white hover:bg-[#A96B11] hover:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#A96B11] transition-colors"
                    >
                      Choose File
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
                  
                  {errors.bannerImage && (
                    <p className="text-sm text-red-600">{errors.bannerImage}</p>
                  )}

                  {/* Image Guidelines */}
                  <div className="bg-gray-50 rounded-md p-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Image Guidelines</h4>
                    <ul className="text-xs text-gray-600 space-y-1">
                      <li>• Recommended size: 1200x300px for header</li>
                      <li>• Recommended size: 300x250px for sidebar</li>
                      <li>• Maximum file size: 10MB</li>
                      <li>• Supported formats: JPG, PNG, GIF</li>
                      <li>• Use high-quality images for best results</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* UTM Section */}
        <div className="bg-white shadow rounded-lg mt-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">UTM Tracking</h2>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Target URL */}
              <div className="lg:col-span-2">
                <label htmlFor="targetUrl" className="block text-sm font-medium text-gray-700 mb-2">
                  Target URL <span className="text-red-500">*</span>
                </label>
                <input
                  type="url"
                  id="targetUrl"
                  name="targetUrl"
                  value={formData.targetUrl}
                  onChange={handleInputChange}
                  placeholder="https://example.com/landing-page"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#A96B11] ${
                    errors.targetUrl ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.targetUrl && (
                  <p className="mt-1 text-sm text-red-600">{errors.targetUrl}</p>
                )}
              </div>

              {/* UTM Source */}
              <div>
                <label htmlFor="utmSource" className="block text-sm font-medium text-gray-700 mb-2">
                  UTM Source <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="utmSource"
                  name="utmSource"
                  value={formData.utmSource}
                  onChange={handleInputChange}
                  placeholder="google, facebook, newsletter"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#A96B11] ${
                    errors.utmSource ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.utmSource && (
                  <p className="mt-1 text-sm text-red-600">{errors.utmSource}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">Identify the source of traffic (e.g. google, newsletter)</p>
              </div>

              {/* UTM Campaign */}
              <div>
                <label htmlFor="utmCampaign" className="block text-sm font-medium text-gray-700 mb-2">
                  UTM Campaign <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="utmCampaign"
                  name="utmCampaign"
                  value={formData.utmCampaign}
                  onChange={handleInputChange}
                  placeholder="summer_sale, black_friday"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#A96B11] ${
                    errors.utmCampaign ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.utmCampaign && (
                  <p className="mt-1 text-sm text-red-600">{errors.utmCampaign}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">Identify the campaign (e.g. summer_sale, product_launch)</p>
              </div>

              {/* UTM Content */}
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
                  placeholder="banner_top, sidebar_ad"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-[#A96B11] ${
                    errors.utmContent ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.utmContent && (
                  <p className="mt-1 text-sm text-red-600">{errors.utmContent}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">Differentiate similar content (optional)</p>
              </div>

              {/* Preview URL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preview URL
                </label>
                <div className="bg-gray-50 rounded-md p-3 border">
                  <p className="text-sm text-gray-600 break-all">
                    {formData.targetUrl ? (
                      `${formData.targetUrl}${
                        formData.utmSource || formData.utmCampaign || formData.utmContent 
                          ? '?' : ''
                      }${[
                        formData.utmSource && `utm_source=${encodeURIComponent(formData.utmSource)}`,
                        formData.utmCampaign && `utm_campaign=${encodeURIComponent(formData.utmCampaign)}`,
                        formData.utmContent && `utm_content=${encodeURIComponent(formData.utmContent)}`
                      ].filter(Boolean).join('&')}`
                    ) : (
                      'Enter target URL and UTM parameters to see preview'
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* UTM Guidelines */}
            <div className="mt-6 bg-blue-50 rounded-md p-4">
              <h4 className="text-sm font-medium text-blue-900 mb-2">UTM Best Practices</h4>
              <ul className="text-xs text-blue-800 space-y-1">
                <li>• Use consistent naming conventions (lowercase, underscores)</li>
                <li>• UTM Source: Where traffic comes from (google, facebook, email)</li>
                <li>• UTM Campaign: Marketing campaign name (summer_sale, product_launch)</li>
                <li>• UTM Content: Differentiate ads/content (banner_top, text_link)</li>
                <li>• Track performance in Google Analytics or your analytics tool</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}