'use client';

import { useState } from 'react';
import Image from 'next/image';

interface SEOSettingsCardProps {
  seoTitle: string;
  seoDescription: string;
  canonicalUrl: string;
  schemaType: string;
  seoImage: string;
  onFieldChange: (name: string, value: string) => void;
  schemaOptions?: { value: string; label: string }[];
}

export default function SEOSettingsCard({
  seoTitle,
  seoDescription,
  canonicalUrl,
  schemaType,
  seoImage,
  onFieldChange,
  schemaOptions = [
    { value: 'Thing', label: 'Thing' },
    { value: 'Article', label: 'Article' },
    { value: 'BlogPosting', label: 'Blog Posting' },
    { value: 'Category', label: 'Category' },
  ]
}: SEOSettingsCardProps) {
  const [seoImagePreview, setSeoImagePreview] = useState(seoImage);

  const handleSeoImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 300 * 1024) {
        alert('SEO image must be less than 300KB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setSeoImagePreview(result);
        onFieldChange('seoImage', result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">SEO Settings</h3>
      <div className="space-y-4">
        <div>
          <label htmlFor="seoTitle" className="block text-sm font-medium text-gray-700 mb-2">
            SEO Title
          </label>
          <input
            type="text"
            id="seoTitle"
            name="seoTitle"
            value={seoTitle}
            onChange={(e) => onFieldChange('seoTitle', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#A96B11] focus:border-[#A96B11]"
            placeholder="SEO optimized title"
          />
        </div>

        <div>
          <label htmlFor="seoDescription" className="block text-sm font-medium text-gray-700 mb-2">
            SEO Description
          </label>
          <textarea
            id="seoDescription"
            name="seoDescription"
            value={seoDescription}
            onChange={(e) => onFieldChange('seoDescription', e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#A96B11] focus:border-[#A96B11]"
            placeholder="Meta description for search engines..."
          />
        </div>

        <div>
          <label htmlFor="canonicalUrl" className="block text-sm font-medium text-gray-700 mb-2">
            Canonical URL
          </label>
          <input
            type="url"
            id="canonicalUrl"
            name="canonicalUrl"
            value={canonicalUrl}
            onChange={(e) => onFieldChange('canonicalUrl', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#A96B11] focus:border-[#A96B11]"
            placeholder="https://example.com/canonical-url"
          />
        </div>

        <div>
          <label htmlFor="schemaType" className="block text-sm font-medium text-gray-700 mb-2">
            Schema Type
          </label>
          <select
            id="schemaType"
            name="schemaType"
            value={schemaType}
            onChange={(e) => onFieldChange('schemaType', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#A96B11] focus:border-[#A96B11]"
          >
            {schemaOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            SEO Image (1.91:1 ratio, 1200×630px recommended, ≤300KB)
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleSeoImageChange}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-[#A96B11] file:text-white hover:file:bg-[#8B5A0F]"
          />
          {seoImagePreview && (
            <div className="mt-3">
              <Image
                src={seoImagePreview}
                alt="SEO Preview"
                width={384}
                height={201}
                className="w-full max-w-sm h-auto rounded border border-gray-200"
                style={{ aspectRatio: '1.91/1' }}
              />
              <p className="text-xs text-gray-500 mt-1">Preview (1.91:1 aspect ratio)</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}