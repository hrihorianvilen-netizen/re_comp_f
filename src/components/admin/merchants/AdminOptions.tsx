'use client';

import { useState } from 'react';

interface AdminOptionsProps {
  settings?: {
    removeHotTrusted?: boolean;
    removeControversial?: boolean;
    removeAvoid?: boolean;
    controversialStartDate?: string;
    controversialEndDate?: string;
  };
  advertisement?: {
    dontShowAds?: boolean;
    adsStartDate?: string;
    adsEndDate?: string;
  };
  onSettingsChange?: (settings: AdminOptionsProps['settings']) => void;
  onAdvertisementChange?: (advertisement: AdminOptionsProps['advertisement']) => void;
}

export default function AdminOptions({
  settings = {
    removeHotTrusted: false,
    removeControversial: false,
    removeAvoid: false,
    controversialStartDate: '',
    controversialEndDate: '',
  },
  advertisement = {
    dontShowAds: false,
    adsStartDate: '',
    adsEndDate: '',
  },
  onSettingsChange,
  onAdvertisementChange,
}: AdminOptionsProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [localSettings, setLocalSettings] = useState(settings);
  const [localAdvertisement, setLocalAdvertisement] = useState(advertisement);

  const handleSettingChange = (key: string) => {
    const newSettings = {
      ...localSettings,
      [key]: !localSettings[key as keyof typeof localSettings],
    };
    setLocalSettings(newSettings);
    onSettingsChange?.(newSettings);
  };

  const handleSettingDateChange = (key: string, value: string) => {
    const newSettings = {
      ...localSettings,
      [key]: value,
    };
    setLocalSettings(newSettings);
    onSettingsChange?.(newSettings);
  };

  const handleAdvertisementChange = (key: string) => {
    const newAdvertisement = {
      ...localAdvertisement,
      [key]: !localAdvertisement[key as keyof typeof localAdvertisement],
    };
    setLocalAdvertisement(newAdvertisement);
    onAdvertisementChange?.(newAdvertisement);
  };

  const handleAdvertisementDateChange = (key: string, value: string) => {
    const newAdvertisement = {
      ...localAdvertisement,
      [key]: value,
    };
    setLocalAdvertisement(newAdvertisement);
    onAdvertisementChange?.(newAdvertisement);
  };

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Admin</h3>
      </div>
      
      <div className="px-6 py-4 space-y-6">
        {/* Search Field */}
        <div>
          <label htmlFor="admin-search" className="block text-sm font-medium text-gray-700">
            Search
          </label>
          <div className="mt-1 relative">
            <input
              type="text"
              id="admin-search"
              name="admin-search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#A96B11] focus:border-transparent"
              placeholder="Search admin options..."
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <svg
                className="h-5 w-5 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
          </div>
        </div>

        {/* Settings Section */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3">Settings</h4>
          <div className="space-y-3">
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="remove-hot-trusted"
                  name="remove-hot-trusted"
                  type="checkbox"
                  checked={localSettings.removeHotTrusted}
                  onChange={() => handleSettingChange('removeHotTrusted')}
                  className="focus:ring-[#A96B11] h-4 w-4 text-[#A96B11] border-gray-300 rounded"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="remove-hot-trusted" className="font-medium text-gray-700">
                  Remove from the list: Hot & Trusted
                </label>
                <p className="text-gray-500">This merchant will not appear in the Hot & Trusted section</p>
              </div>
            </div>

            <div>
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="remove-controversial"
                    name="remove-controversial"
                    type="checkbox"
                    checked={localSettings.removeControversial}
                    onChange={() => handleSettingChange('removeControversial')}
                    className="focus:ring-[#A96B11] h-4 w-4 text-[#A96B11] border-gray-300 rounded"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="remove-controversial" className="font-medium text-gray-700">
                    Remove from the list: Controversial
                  </label>
                  <p className="text-gray-500">This merchant will not appear in the Controversial section</p>
                </div>
              </div>
              
              {/* Date fields for Controversial - show when checkbox is checked */}
              {localSettings.removeControversial && (
                <div className="ml-7 mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div>
                    <label htmlFor="controversial-start-date" className="block text-xs font-medium text-gray-700 mb-1">
                      Start Date
                    </label>
                    <input
                      type="date"
                      id="controversial-start-date"
                      value={localSettings.controversialStartDate || ''}
                      onChange={(e) => handleSettingDateChange('controversialStartDate', e.target.value)}
                      className="block w-full px-2 py-1 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-[#A96B11] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label htmlFor="controversial-end-date" className="block text-xs font-medium text-gray-700 mb-1">
                      End Date
                    </label>
                    <input
                      type="date"
                      id="controversial-end-date"
                      value={localSettings.controversialEndDate || ''}
                      onChange={(e) => handleSettingDateChange('controversialEndDate', e.target.value)}
                      className="block w-full px-2 py-1 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-[#A96B11] focus:border-transparent"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="remove-avoid"
                  name="remove-avoid"
                  type="checkbox"
                  checked={localSettings.removeAvoid}
                  onChange={() => handleSettingChange('removeAvoid')}
                  className="focus:ring-[#A96B11] h-4 w-4 text-[#A96B11] border-gray-300 rounded"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="remove-avoid" className="font-medium text-gray-700">
                  Remove from the list: Avoid
                </label>
                <p className="text-gray-500">This merchant will not appear in the Avoid section</p>
              </div>
            </div>
          </div>
        </div>

        {/* Advertisement Section */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-3">Advertisement</h4>
          <div>
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="dont-show-ads"
                  name="dont-show-ads"
                  type="checkbox"
                  checked={localAdvertisement.dontShowAds}
                  onChange={() => handleAdvertisementChange('dontShowAds')}
                  className="focus:ring-[#A96B11] h-4 w-4 text-[#A96B11] border-gray-300 rounded"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="dont-show-ads" className="font-medium text-gray-700">
                  Don't show advertisements on my page
                </label>
                <p className="text-gray-500">Disable all advertisements for this merchant's page</p>
              </div>
            </div>
            
            {/* Date fields for Advertisement - show when checkbox is checked */}
            {localAdvertisement.dontShowAds && (
              <div className="ml-7 mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label htmlFor="ads-start-date" className="block text-xs font-medium text-gray-700 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    id="ads-start-date"
                    value={localAdvertisement.adsStartDate || ''}
                    onChange={(e) => handleAdvertisementDateChange('adsStartDate', e.target.value)}
                    className="block w-full px-2 py-1 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-[#A96B11] focus:border-transparent"
                  />
                </div>
                <div>
                  <label htmlFor="ads-end-date" className="block text-xs font-medium text-gray-700 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    id="ads-end-date"
                    value={localAdvertisement.adsEndDate || ''}
                    onChange={(e) => handleAdvertisementDateChange('adsEndDate', e.target.value)}
                    className="block w-full px-2 py-1 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-[#A96B11] focus:border-transparent"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}