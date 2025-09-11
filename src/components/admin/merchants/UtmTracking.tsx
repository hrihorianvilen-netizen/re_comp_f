'use client';

import { useState, useEffect } from 'react';

interface UtmData {
  targetUrl: string;
  source: string;
  medium: string;
  campaign: string;
  content: string;
  term: string;
}

interface UtmTrackingProps {
  onUtmChange?: (data: UtmData) => void;
}

export default function UtmTracking({ onUtmChange }: UtmTrackingProps = {}) {
  const [utmData, setUtmData] = useState<UtmData>({
    targetUrl: '',
    source: '',
    medium: '',
    campaign: '',
    content: '',
    term: ''
  });

  const [previewUrl, setPreviewUrl] = useState<string>('');

  const handleInputChange = (field: keyof UtmData, value: string) => {
    const newData = { ...utmData, [field]: value };
    setUtmData(newData);
    onUtmChange?.(newData);
  };

  // Generate preview URL whenever UTM parameters change
  useEffect(() => {
    if (utmData.targetUrl) {
      try {
        const url = new URL(utmData.targetUrl);
        
        // Add UTM parameters if they exist
        if (utmData.source) url.searchParams.set('utm_source', utmData.source);
        if (utmData.medium) url.searchParams.set('utm_medium', utmData.medium);
        if (utmData.campaign) url.searchParams.set('utm_campaign', utmData.campaign);
        if (utmData.content) url.searchParams.set('utm_content', utmData.content);
        if (utmData.term) url.searchParams.set('utm_term', utmData.term);
        
        setPreviewUrl(url.toString());
      } catch {
        // Invalid URL, just show the base URL
        setPreviewUrl(utmData.targetUrl);
      }
    } else {
      setPreviewUrl('https://xxxx.xxx/....');
    }
  }, [utmData]);

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">UTM Tracking</h3>
      </div>
      <div className="px-6 py-4 space-y-4">
        {/* Target URL */}
        <div>
          <label htmlFor="target_url" className="block text-sm font-medium text-gray-700">
            Target URL
          </label>
          <input
            type="url"
            name="target_url"
            id="target_url"
            value={utmData.targetUrl}
            onChange={(e) => handleInputChange('targetUrl', e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#A96B11] focus:border-transparent"
            placeholder="Destination"
          />
        </div>

        {/* UTM Source */}
        <div>
          <label htmlFor="utm_source" className="block text-sm font-medium text-gray-700">
            UTM Source
          </label>
          <input
            type="text"
            name="utm_source"
            id="utm_source"
            value={utmData.source}
            onChange={(e) => handleInputChange('source', e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#A96B11] focus:border-transparent"
            placeholder="Traffic source"
          />
        </div>

        {/* UTM Medium */}
        <div>
          <label htmlFor="utm_medium" className="block text-sm font-medium text-gray-700">
            UTM Medium
          </label>
          <input
            type="text"
            name="utm_medium"
            id="utm_medium"
            value={utmData.medium}
            onChange={(e) => handleInputChange('medium', e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#A96B11] focus:border-transparent"
            placeholder="Method/channel"
          />
        </div>

        {/* UTM Campaign */}
        <div>
          <label htmlFor="utm_campaign" className="block text-sm font-medium text-gray-700">
            UTM Campaign
          </label>
          <input
            type="text"
            name="utm_campaign"
            id="utm_campaign"
            value={utmData.campaign}
            onChange={(e) => handleInputChange('campaign', e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#A96B11] focus:border-transparent"
            placeholder="Name"
          />
        </div>

        {/* UTM Content */}
        <div>
          <label htmlFor="utm_content" className="block text-sm font-medium text-gray-700">
            UTM Content
          </label>
          <input
            type="text"
            name="utm_content"
            id="utm_content"
            value={utmData.content}
            onChange={(e) => handleInputChange('content', e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#A96B11] focus:border-transparent"
            placeholder="Content/version"
          />
        </div>

        {/* UTM Term */}
        <div>
          <label htmlFor="utm_term" className="block text-sm font-medium text-gray-700">
            UTM Term
          </label>
          <input
            type="text"
            name="utm_term"
            id="utm_term"
            value={utmData.term}
            onChange={(e) => handleInputChange('term', e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#A96B11] focus:border-transparent"
            placeholder="Keywords"
          />
        </div>

        {/* Preview URL */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Preview URL:
          </label>
          <div className="p-3 bg-gray-50 rounded-md border border-gray-200">
            <p className="text-sm text-gray-600 break-all font-mono">
              {previewUrl}
            </p>
          </div>
          {utmData.targetUrl && (
            <button
              type="button"
              onClick={() => navigator.clipboard.writeText(previewUrl)}
              className="mt-2 text-sm text-[#A96B11] hover:text-[#8b5a0e] font-medium"
            >
              Copy to clipboard
            </button>
          )}
        </div>
      </div>
    </div>
  );
}