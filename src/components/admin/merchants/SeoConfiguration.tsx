'use client';

import { useState } from 'react';
import OptimizedImage from '@/components/ui/OptimizedImage';

interface SeoData {
  title: string;
  description: string;
  canonicalUrl: string;
  schemaType: string;
  seoImage: File | null;
}

interface SeoConfigurationProps {
  initialSeo?: {
    title?: string;
    description?: string;
    canonical?: string;
    schema?: string;
    image?: string | File;
  };
  onSeoChange?: (data: SeoData) => void;
}

export default function SeoConfiguration({ initialSeo, onSeoChange }: SeoConfigurationProps = {}) {
  const [seoData, setSeoData] = useState<SeoData>({
    title: initialSeo?.title || '',
    description: initialSeo?.description || '',
    canonicalUrl: initialSeo?.canonical || '',
    schemaType: initialSeo?.schema || '',
    seoImage: null
  });

  const [imagePreview, setImagePreview] = useState<string>(typeof initialSeo?.image === 'string' ? initialSeo.image : '');
  const [imageError, setImageError] = useState<string>('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const schemaTypes = [
    'Article',
    'Product',
    'LocalBusiness',
    'Organization',
    'Person',
    'Event',
    'Service',
    'WebPage',
    'FAQPage',
    'HowTo'
  ];

  const handleInputChange = (field: keyof SeoData, value: string) => {
    const newData = { ...seoData, [field]: value };
    setSeoData(newData);

    // Validate SEO title length (recommended 50-60 characters)
    if (field === 'title' && value.length > 60) {
      setErrors(prev => ({ ...prev, seo_title: 'SEO title should be 60 characters or less for optimal display' }));
    } else if (field === 'description' && value.length > 160) {
      setErrors(prev => ({ ...prev, seo_description: 'Meta description should be 160 characters or less for optimal display' }));
    } else {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[`seo_${field}`];
        return newErrors;
      });
    }

    onSeoChange?.(newData);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (max 300KB)
      if (file.size > 300 * 1024) {
        setImageError('Image size must be less than 300KB');
        return;
      }

      // Create preview and check dimensions
      const reader = new FileReader();
      reader.onload = () => {
        const img = new window.Image();
        // const img = new (window as any).Image();
        img.onload = () => {
          // Check aspect ratio (1.91:1 is ideal)
          const aspectRatio = img.width / img.height;
          const idealRatio = 1.91;
          const tolerance = 0.1;
          
          if (Math.abs(aspectRatio - idealRatio) > tolerance) {
            setImageError(`Image aspect ratio should be 1.91:1 (current: ${aspectRatio.toFixed(2)}:1). Recommended: 1200x630px`);
          } else {
            setImageError('');
          }
          
          setImagePreview(reader.result as string);
          const newData = { ...seoData, seoImage: file };
          setSeoData(newData);
          onSeoChange?.(newData);
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const clearImage = () => {
    setImagePreview('');
    setImageError('');
    const newData = { ...seoData, seoImage: null };
    setSeoData(newData);
    onSeoChange?.(newData);
  };

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">SEO Configuration</h3>
      </div>
      <div className="px-6 py-4 space-y-6">
        {/* SEO Title */}
        <div>
          <label htmlFor="seo_title" className="block text-sm font-medium text-gray-700">
            SEO Title
          </label>
          <input
            type="text"
            name="seo_title"
            id="seo_title"
            value={seoData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            maxLength={60}
            className={`mt-1 block w-full px-3 py-2 border ${errors.seo_title ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#A96B11] focus:border-transparent`}
            placeholder="Enter SEO title (50-60 characters recommended)"
          />
          <div className="mt-1 flex justify-between">
            {errors.seo_title && <p className="text-sm text-red-600">{errors.seo_title}</p>}
            <p className="text-sm text-gray-500 ml-auto">{seoData.title.length}/60</p>
          </div>
        </div>

        {/* Meta Description */}
        <div>
          <label htmlFor="seo_description" className="block text-sm font-medium text-gray-700">
            Meta Description
          </label>
          <textarea
            name="seo_description"
            id="seo_description"
            rows={3}
            value={seoData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            maxLength={160}
            className={`mt-1 block w-full px-3 py-2 border ${errors.seo_description ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#A96B11] focus:border-transparent`}
            placeholder="Enter meta description (150-160 characters recommended)"
          />
          <div className="mt-1 flex justify-between">
            {errors.seo_description && <p className="text-sm text-red-600">{errors.seo_description}</p>}
            <p className="text-sm text-gray-500 ml-auto">{seoData.description.length}/160</p>
          </div>
        </div>

        {/* Canonical URL */}
        <div>
          <label htmlFor="canonical_url" className="block text-sm font-medium text-gray-700">
            Canonical URL
          </label>
          <input
            type="url"
            name="canonical_url"
            id="canonical_url"
            value={seoData.canonicalUrl}
            onChange={(e) => handleInputChange('canonicalUrl', e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#A96B11] focus:border-transparent"
            placeholder="https://example.com/page"
          />
        </div>

        {/* Schema Type */}
        <div>
          <label htmlFor="schema_type" className="block text-sm font-medium text-gray-700">
            Schema Type
          </label>
          <select
            name="schema_type"
            id="schema_type"
            value={seoData.schemaType}
            onChange={(e) => handleInputChange('schemaType', e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#A96B11] focus:border-transparent"
          >
            <option value="">Select Schema Type</option>
            {schemaTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        {/* SEO Image */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            SEO Image
            <span className="text-xs text-gray-500 ml-2">
              (Aspect ratio 1.91:1, Recommended: 1200×630px, Max: 300KB)
            </span>
          </label>
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
            <div className="space-y-1 text-center">
              {imagePreview ? (
                <div className="relative">
                  <OptimizedImage
                    src={imagePreview}
                    alt="SEO preview"
                    width={305}
                    height={160}
                    className="mx-auto max-h-40 object-cover rounded-lg"
                    style={{ aspectRatio: '1.91/1' }}
                    sizeType="card"
                    qualityPriority="medium"
                  />
                  <button
                    type="button"
                    onClick={clearImage}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                  >
                    ×
                  </button>
                  {imageError && (
                    <p className="mt-2 text-sm text-amber-600">{imageError}</p>
                  )}
                </div>
              ) : (
                <>
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    stroke="currentColor"
                    fill="none"
                    viewBox="0 0 48 48"
                  >
                    <path
                      d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <div className="flex text-sm text-gray-600">
                    <label
                      htmlFor="seo-image-upload"
                      className="relative cursor-pointer bg-white rounded-md font-medium text-[#A96B11] hover:text-[#8b5a0e] focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-[#A96B11]"
                    >
                      <span>Upload an image</span>
                      <input
                        id="seo-image-upload"
                        name="seo-image-upload"
                        type="file"
                        accept="image/*"
                        className="sr-only"
                        onChange={handleImageChange}
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">PNG, JPG up to 300KB</p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}